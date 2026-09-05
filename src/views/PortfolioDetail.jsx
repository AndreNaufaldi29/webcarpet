"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getStoredPortfolios,
  subscribePortfolios,
  DEFAULT_PORTFOLIOS,
  isVideoMedia,
  getPortfolioGalleryImages,
} from "@/lib/portfolioStore";
import {
  getStoredSettings,
  subscribeSettings,
  DEFAULT_SETTINGS,
} from "@/lib/settingsStore";

import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiPlay,
  FiCheckCircle,
  FiMaximize2,
  FiZoomIn,
  FiZoomOut,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function PortfolioDetail() {
  const params = useParams() || {};
  const id = params.id;

  const [portfolios, setPortfolios] = useState(DEFAULT_PORTFOLIOS);
  const [dbPortfolio, setDbPortfolio] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dynamic orientation state for flexible portrait / landscape / square view
  const [mediaOrientation, setMediaOrientation] = useState("landscape");

  // Lightbox / Detail Zoom Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const thumbTrackRef = useRef(null);
  const thumbRefs = useRef([]);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubSettings = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    // 1. Initial cached
    setPortfolios(getStoredPortfolios());

    // 2. Fetch specific portfolio by ID from Prisma database API
    if (id) {
      fetch(`/api/portfolios/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setDbPortfolio(json.data);
          }
        })
        .catch((err) => console.warn("Fetch portfolio detail error:", err));
    }

    // 3. Realtime subscribe
    const unsubscribe = subscribePortfolios((updated) => {
      setPortfolios(updated);
    });
    return () => unsubscribe();
  }, [id]);

  const portfolio =
    dbPortfolio ||
    portfolios.find((item) => Number(item.id) === Number(id)) ||
    portfolios[0] ||
    DEFAULT_PORTFOLIOS[0];

  // Resolve gallery images
  const galleryImages = getPortfolioGalleryImages(portfolio);

  // Reset active index when portfolio changes
  useEffect(() => {
    setActiveIndex(0);
  }, [portfolio?.id]);

  const currentMedia =
    galleryImages[activeIndex] ||
    portfolio.image ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";
  const isVideo = isVideoMedia(currentMedia, portfolio.mediaType);

  // Detect image natural dimensions for flexible portrait / landscape layout
  const handleMediaLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      if (naturalHeight > naturalWidth * 1.08) {
        setMediaOrientation("portrait");
      } else if (naturalWidth > naturalHeight * 1.08) {
        setMediaOrientation("landscape");
      } else {
        setMediaOrientation("square");
      }
    }
  };

  const handleVideoMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoWidth && videoHeight) {
      if (videoHeight > videoWidth * 1.08) {
        setMediaOrientation("portrait");
      } else if (videoWidth > videoHeight * 1.08) {
        setMediaOrientation("landscape");
      } else {
        setMediaOrientation("square");
      }
    }
  };

  // Slide navigation handlers
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [galleryImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [galleryImages.length]);

  const handleSelectImage = (index) => {
    setActiveIndex(index);
  };

  // Modal open & navigation handlers
  const openModal = (index = 0) => {
    setModalImageIndex(index);
    setZoomScale(1);
    setIsModalOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setZoomScale(1);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
    }
  };

  const handleModalNext = useCallback(() => {
    setModalImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    setZoomScale(1);
  }, [galleryImages.length]);

  const handleModalPrev = useCallback(() => {
    setModalImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
    setZoomScale(1);
  }, [galleryImages.length]);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  const handleToggleZoom = () => {
    setZoomScale((prev) => (prev > 1 ? 1 : 2));
  };

  // Touch swipe gesture support for mobile image navigation
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    if (zoomScale > 1) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Horizontal swipe detection with threshold 40px
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleModalNext();
      } else {
        handleModalPrev();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbRefs.current[activeIndex] && thumbTrackRef.current) {
      thumbRefs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  // Scroll thumbnails horizontally via slide buttons
  const handleScrollThumbnails = (direction) => {
    if (thumbTrackRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      thumbTrackRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === "Escape") {
          closeModal();
        } else if (e.key === "ArrowLeft") {
          handleModalPrev();
        } else if (e.key === "ArrowRight") {
          handleModalNext();
        } else if (e.key === "+" || e.key === "=") {
          handleZoomIn();
        } else if (e.key === "-") {
          handleZoomOut();
        } else if (e.key === "0") {
          handleResetZoom();
        }
      } else {
        if (galleryImages.length <= 1) return;
        if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleModalPrev, handleModalNext, handlePrev, handleNext, galleryImages.length]);

  const handleWhatsApp = () => {
    const cleanWhatsapp = (settings.whatsapp || "08212128701").replace(/[^0-9]/g, "");
    const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
    const message = `Halo ${settings.companyName || "Rumah Indah Carpet"}, saya tertarik dengan portofolio proyek "${portfolio.title}". Mohon info estimasi biaya dan konsultasi untuk lokasi kami.`;

    window.open(
      `https://wa.me/${num}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  return (
    <section className="portfolio-detail-page">
      <div className="portfolio-container">
        {/* BACK BUTTON */}
        <div className="product-back-wrapper">
          <Link href="/portofolio" className="portfolio-back-btn">
            <FiArrowLeft />
            <span>Kembali ke Portofolio</span>
          </Link>
        </div>

        {/* MAIN CONTENT */}
        <div className="portfolio-detail-grid">
          {/* GALLERY SECTION (MAIN IMAGE + SLIDER + THUMBNAILS) */}
          <div className="portfolio-gallery">
            {/* MAIN IMAGE CARD (DYNAMIC FLEXIBLE ORIENTATION) */}
            <div
              className={`portfolio-main-image-card clickable is-${mediaOrientation}`}
              onClick={() => openModal(activeIndex)}
              title="Klik gambar untuk melihat detail foto proyek"
            >
              {isVideo ? (
                <video
                  key={currentMedia}
                  src={currentMedia}
                  controls
                  playsInline
                  autoPlay
                  onLoadedMetadata={handleVideoMetadata}
                  className="portfolio-main-media"
                />
              ) : (
                <img
                  key={currentMedia}
                  src={currentMedia}
                  alt={`${portfolio.title} - Foto ${activeIndex + 1}`}
                  onLoad={handleMediaLoad}
                  className="portfolio-main-media animate-fade-in"
                />
              )}

              {/* ZOOM HOVER OVERLAY BADGE */}
              <div className="product-image-zoom-overlay">
                <div className="product-image-zoom-badge">
                  <FiMaximize2 size={16} />
                  <span>Lihat Detail Foto</span>
                </div>
              </div>

              {/* SLIDE BUTTONS OVER MAIN IMAGE (IF MULTIPLE PHOTOS) */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="portfolio-slide-btn prev"
                    aria-label="Foto sebelumnya"
                    title="Foto sebelumnya (Panah Kiri)"
                  >
                    <FiChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="portfolio-slide-btn next"
                    aria-label="Foto selanjutnya"
                    title="Foto selanjutnya (Panah Kanan)"
                  >
                    <FiChevronRight size={22} />
                  </button>

                  {/* PHOTO COUNTER BADGE */}
                  <div className="portfolio-img-counter">
                    <FiImage size={13} />
                    <span>
                      {activeIndex + 1} / {galleryImages.length}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* THUMBNAILS CAROUSEL WITH SLIDE ARROWS */}
            {galleryImages.length > 1 && (
              <div className="portfolio-thumb-slider-wrapper">
                {galleryImages.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleScrollThumbnails("left")}
                    className="portfolio-thumb-arrow prev"
                    aria-label="Geser thumbnail ke kiri"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                )}

                <div className="portfolio-thumb-track" ref={thumbTrackRef}>
                  {galleryImages.map((img, idx) => {
                    const isThumbVideo = isVideoMedia(img);
                    const isActive = activeIndex === idx;

                    return (
                      <button
                        key={idx}
                        ref={(el) => (thumbRefs.current[idx] = el)}
                        type="button"
                        onClick={() => handleSelectImage(idx)}
                        className={`portfolio-thumb-item ${isActive ? "active" : ""}`}
                        aria-label={`Pilih foto ${idx + 1}`}
                        title={`Lihat foto ${idx + 1}`}
                      >
                        {isThumbVideo ? (
                          <div className="thumb-video-placeholder">
                            <FiPlay size={18} />
                          </div>
                        ) : (
                          <img
                            src={img}
                            alt={`${portfolio.title} thumbnail ${idx + 1}`}
                            loading="lazy"
                          />
                        )}
                        <span className="thumb-index-pill">{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {galleryImages.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleScrollThumbnails("right")}
                    className="portfolio-thumb-arrow next"
                    aria-label="Geser thumbnail ke kanan"
                  >
                    <FiChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="portfolio-detail-info">
            <span className="portfolio-category-tag">
              {portfolio.category}
            </span>

            <h1>{portfolio.title}</h1>

            <p className="portfolio-desc">
              {portfolio.description || "Dokumentasi pengerjaan karpet profesional bergaransi resmi dari Rumah Indah Carpet."}
            </p>

            {/* DETAILS GRID */}
            <div className="portfolio-meta-grid">
              <div className="meta-item">
                <div className="meta-icon">
                  <FiMapPin size={22} />
                </div>
                <div>
                  <strong>Lokasi Pengerjaan</strong>
                  <span>{portfolio.location || "Indonesia"}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <FiLayers size={22} />
                </div>
                <div>
                  <strong>Luas Area</strong>
                  <span>{portfolio.area || "100 m²"}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <FiClock size={22} />
                </div>
                <div>
                  <strong>Durasi Pengerjaan</strong>
                  <span>{portfolio.duration || "7 Hari"}</span>
                </div>
              </div>

              <div className="meta-item">
                <div className="meta-icon">
                  <FiCalendar size={22} />
                </div>
                <div>
                  <strong>Waktu Selesai</strong>
                  <span>{portfolio.date || portfolio.year || "2026"}</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="portfolio-detail-actions">
              <button
                type="button"
                className="portfolio-whatsapp-btn"
                onClick={handleWhatsApp}
              >
                <FaWhatsapp size={20} />
                <span>Konsultasi Proyek Serupa</span>
              </button>

              <button
                type="button"
                className="portfolio-zoom-action-btn"
                onClick={() => openModal(activeIndex)}
                title="Buka foto resolusi penuh & zoom"
              >
                <FiMaximize2 size={18} />
                <span>Lihat Detail Foto</span>
              </button>

              <Link href="/portofolio" className="portfolio-back-outline-btn">
                <FiLayers size={18} />
                <span>Lihat Proyek Lainnya</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FULL IMAGE / MEDIA LIGHTBOX DETAIL MODAL */}
      {isModalOpen && (
        <div
          className="product-image-modal-overlay animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="product-image-modal-dialog animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER: TWO-TIER RESPONSIVE LAYOUT */}
            <div className="product-image-modal-header">
              {/* ROW 1: TITLE & CLOSE BUTTON */}
              <div className="modal-header-top">
                <div className="modal-header-title-wrap">
                  <h3 title={portfolio.title}>{portfolio.title}</h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeModal}
                  title="Tutup Preview (Esc)"
                  aria-label="Tutup"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* ROW 2: CATEGORY, COUNTER & ZOOM CONTROLS */}
              <div className="modal-header-sub">
                <div className="modal-header-meta">
                  <span className="modal-cat-badge">{portfolio.category}</span>
                  {galleryImages.length > 1 && (
                    <span className="modal-counter">
                      <FiImage size={13} />
                      Foto {modalImageIndex + 1} dari {galleryImages.length}
                    </span>
                  )}
                </div>

                {/* ZOOM CONTROLS (ONLY FOR IMAGES) */}
                {!isVideoMedia(galleryImages[modalImageIndex]) && (
                  <div className="modal-zoom-controls">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={zoomScale <= 1}
                      className="modal-tool-btn"
                      title="Perkecil Foto (-)"
                    >
                      <FiZoomOut size={16} />
                    </button>
                    <span className="zoom-indicator">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={zoomScale >= 3}
                      className="modal-tool-btn"
                      title="Perbesar Foto (+)"
                    >
                      <FiZoomIn size={16} />
                    </button>
                    {zoomScale > 1 && (
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="modal-tool-btn reset"
                        title="Reset Ukuran (0)"
                      >
                        <FiRefreshCw size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* MODAL MEDIA VIEWER WITH TOUCH SWIPE */}
            <div
              className="product-image-modal-body"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  className="modal-nav-btn prev"
                  onClick={handleModalPrev}
                  title="Foto Sebelumnya (Panah Kiri)"
                  aria-label="Foto Sebelumnya"
                >
                  <FiChevronLeft size={24} />
                </button>
              )}

              <div
                className={`modal-image-viewport ${zoomScale > 1 ? "zoomed" : ""}`}
                onClick={
                  isVideoMedia(galleryImages[modalImageIndex])
                    ? undefined
                    : handleToggleZoom
                }
                title={
                  isVideoMedia(galleryImages[modalImageIndex])
                    ? undefined
                    : zoomScale === 1
                    ? "Klik untuk memperbesar 2x"
                    : "Klik untuk kembali ke ukuran normal"
                }
              >
                {isVideoMedia(galleryImages[modalImageIndex]) ? (
                  <video
                    src={galleryImages[modalImageIndex]}
                    controls
                    autoPlay
                    playsInline
                    className="modal-main-img"
                    style={{ maxHeight: "75vh" }}
                  />
                ) : (
                  <img
                    src={galleryImages[modalImageIndex] || currentMedia}
                    alt={`${portfolio.title} detail`}
                    style={{
                      transform: `scale(${zoomScale})`,
                    }}
                    className="modal-main-img"
                  />
                )}
              </div>

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  className="modal-nav-btn next"
                  onClick={handleModalNext}
                  title="Foto Selanjutnya (Panah Kanan)"
                  aria-label="Foto Selanjutnya"
                >
                  <FiChevronRight size={24} />
                </button>
              )}
            </div>

            {/* MODAL THUMBNAIL FILMSTRIP */}
            {galleryImages.length > 1 && (
              <div className="product-image-modal-footer">
                <div className="modal-thumb-strip">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setModalImageIndex(idx);
                        setActiveIndex(idx);
                        setZoomScale(1);
                      }}
                      className={`modal-thumb-item ${
                        modalImageIndex === idx ? "active" : ""
                      }`}
                      title={`Pilih foto ${idx + 1}`}
                    >
                      {isVideoMedia(img) ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#0A3B25",
                            color: "#FCF7F0",
                            borderRadius: "8px",
                          }}
                        >
                          <FiPlay size={16} />
                        </div>
                      ) : (
                        <img src={img} alt={`thumb-${idx + 1}`} />
                      )}
                      <span className="modal-thumb-num">{idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
