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
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function PortfolioDetail() {
  const params = useParams() || {};
  const id = params.id;

  const [portfolios, setPortfolios] = useState(DEFAULT_PORTFOLIOS);
  const [dbPortfolio, setDbPortfolio] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const currentMedia = galleryImages[activeIndex] || portfolio.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";
  const isVideo = isVideoMedia(currentMedia, portfolio.mediaType);

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

  // Keyboard navigation (Left / Right keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (galleryImages.length <= 1) return;
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, galleryImages.length]);

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
            Kembali ke Portofolio
          </Link>
        </div>

        {/* MAIN CONTENT */}
        <div className="portfolio-detail-grid">
          {/* GALLERY SECTION (MAIN IMAGE + SLIDER + THUMBNAILS) */}
          <div className="portfolio-gallery">
            {/* MAIN IMAGE CARD */}
            <div className="portfolio-main-image-card">
              {isVideo ? (
                <video
                  key={currentMedia}
                  src={currentMedia}
                  controls
                  playsInline
                  autoPlay
                  className="portfolio-main-media"
                />
              ) : (
                <img
                  key={currentMedia}
                  src={currentMedia}
                  alt={`${portfolio.title} - Foto ${activeIndex + 1}`}
                  className="portfolio-main-media animate-fade-in"
                />
              )}

              {/* SLIDE BUTTONS OVER MAIN IMAGE (IF MULTIPLE PHOTOS) */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="portfolio-slide-btn prev"
                    aria-label="Foto sebelumnya"
                    title="Foto sebelumnya (Panah Kiri)"
                  >
                    <FiChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
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

              <Link href="/portofolio" className="portfolio-back-outline-btn">
                <FiLayers size={18} />
                <span>Lihat Proyek Lainnya</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
