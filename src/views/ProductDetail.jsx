"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getStoredProducts,
  subscribeProducts,
  DEFAULT_PRODUCTS,
} from "@/lib/productStore";
import {
  getStoredSettings,
  subscribeSettings,
  DEFAULT_SETTINGS,
} from "@/lib/settingsStore";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiGrid,
  FiMaximize2,
  FiZoomIn,
  FiZoomOut,
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
} from "react-icons/fi";
import { FaWhatsapp, FaStar } from "react-icons/fa";

export default function ProductDetail() {
  const params = useParams() || {};
  const id = params.id;

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [dbProduct, setDbProduct] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Lightbox / Image detail modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubSettings = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    // 1. Initial cached products
    setProducts(getStoredProducts());

    // 2. Fetch specific product by ID from Prisma database API
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setDbProduct(json.data);
          }
        })
        .catch((err) => console.warn("Fetch product detail error:", err));
    }

    // 3. Subscribe to product updates
    const unsubscribe = subscribeProducts((updated) => {
      setProducts(updated);
    });
    return () => unsubscribe();
  }, [id]);

  const product =
    dbProduct ||
    products.find((item) => Number(item.id) === Number(id)) ||
    products[0] ||
    DEFAULT_PRODUCTS[0];

  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"];

  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  useEffect(() => {
    if (galleryImages[0]) {
      setActiveImage(galleryImages[0]);
    }
  }, [product]);

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

  const handleNextImage = useCallback(() => {
    setModalImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    setZoomScale(1);
  }, [galleryImages.length]);

  const handlePrevImage = useCallback(() => {
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

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handlePrevImage, handleNextImage]);

  const handleWhatsApp = () => {
    const cleanWhatsapp = (settings.whatsapp || "08212128701").replace(/[^0-9]/g, "");
    const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
    const message = `Halo ${settings.companyName || "Rumah Indah Carpet"}, saya tertarik dengan ${product.name}. Saya ingin konsultasi & harga penawaran.`;

    window.open(
      `https://wa.me/${num}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  const defaultSpecs = {
    Material: "Polypropylene Premium",
    Ketebalan: "12 mm",
    Warna: "Maroon / Hijau",
    Garansi: "1 Tahun",
    Ukuran: "Custom Sesuai Ruangan",
  };

  const specifications =
    product.specifications && Object.keys(product.specifications).length > 0
      ? product.specifications
      : defaultSpecs;

  const currentActiveIdx = galleryImages.indexOf(activeImage);
  const activeImgIdx = currentActiveIdx >= 0 ? currentActiveIdx : 0;

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
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div className="product-detail-page-wrapper">
      <section className="product-detail-page">
        {/* BACK BUTTON */}
        <div className="product-back-wrapper">
          <Link href="/catalog" className="product-back-btn">
            <FiArrowLeft size={16} />
            <span>Kembali ke Katalog</span>
          </Link>
        </div>

        {/* MAIN PRODUCT CARD */}
        <div className="product-detail-card">
          {/* GALLERY SECTION */}
          <div className="product-gallery">
            <div
              className="product-main-image clickable"
              onClick={() => openModal(activeImgIdx)}
              title="Klik gambar untuk memperbesar detail tekstur dan motif karpet"
            >
              <img src={activeImage} alt={product.name} />

              <div className="product-image-zoom-overlay">
                <div className="product-image-zoom-badge">
                  <FiMaximize2 size={16} />
                  <span>Lihat Detail Foto</span>
                </div>
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="product-thumb-list">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`product-thumb ${
                      activeImage === img ? "active" : ""
                    }`}
                    title={`Lihat foto ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumb ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAIL CONTENT */}
          <div className="product-detail-content">
            <div className="product-category-badge">
              {product.category ? product.category.toUpperCase() : "KARPET MASJID"}
            </div>

            <h1>{product.name}</h1>

            <div className="product-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={14} className="star-icon" />
                ))}
              </div>
              <span className="rating-count">
                ({product.reviews || 24} Ulasan Pelanggan)
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            {/* BENEFIT HIGHLIGHTS */}
            <div className="product-benefits">
              <div className="product-benefit">
                <div className="benefit-icon">
                  <FiCheckCircle size={18} />
                </div>
                <div className="benefit-content">
                  <strong>Bahan Karpet Berkualitas Tinggi</strong>
                  <span>Serat empuk, mudah dibersihkan & nyaman dipakai</span>
                </div>
              </div>

              <div className="product-benefit">
                <div className="benefit-icon">
                  <FiShield size={18} />
                </div>
                <div className="benefit-content">
                  <strong>Garansi Resmi Rumah Indah Carpet</strong>
                  <span>Terjamin mutu bahan dan hasil obras karpet</span>
                </div>
              </div>

              <div className="product-benefit">
                <div className="benefit-icon">
                  <FiTruck size={18} />
                </div>
                <div className="benefit-content">
                  <strong>Pengiriman & Instalasi</strong>
                  <span>Siap kirim & pasang ke lokasi seluruh Indonesia</span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="product-actions">
              <button
                type="button"
                className="product-whatsapp-btn"
                onClick={handleWhatsApp}
              >
                <FaWhatsapp size={18} />
                <span>Minta Penawaran / WhatsApp</span>
              </button>
              <Link href="/catalog" className="product-catalog-btn">
                <FiGrid size={16} />
                <span>Katalog Lainnya</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS SECTION */}
        <div className="product-specification-section">
          <div className="product-section-heading">
            <span className="section-sub-badge">SPESIFIKASI DETAIL</span>
            <h2>Informasi Teknis Produk</h2>
            <p>Ketahuilah detail spesifikasi karpet pilihan Anda secara rinci</p>
          </div>

          <div className="product-spec-grid">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="product-spec-card">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL IMAGE LIGHTBOX DETAIL MODAL */}
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
                  <h3 title={product.name}>{product.name}</h3>
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
                  <span className="modal-cat-badge">
                    {product.category ? product.category.toUpperCase() : "KARPET"}
                  </span>
                  {galleryImages.length > 1 && (
                    <span className="modal-counter">
                      <FiImage size={13} />
                      Foto {modalImageIndex + 1} dari {galleryImages.length}
                    </span>
                  )}
                </div>

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
              </div>
            </div>

            {/* MODAL IMAGE VIEWER WITH TOUCH SWIPE */}
            <div
              className="product-image-modal-body"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  className="modal-nav-btn prev"
                  onClick={handlePrevImage}
                  title="Foto Sebelumnya (Panah Kiri)"
                  aria-label="Foto Sebelumnya"
                >
                  <FiChevronLeft size={24} />
                </button>
              )}

              <div
                className={`modal-image-viewport ${zoomScale > 1 ? "zoomed" : ""}`}
                onClick={handleToggleZoom}
                title={
                  zoomScale === 1
                    ? "Klik untuk memperbesar 2x"
                    : "Klik untuk kembali ke ukuran normal"
                }
              >
                <img
                  src={galleryImages[modalImageIndex] || activeImage}
                  alt={`${product.name} detail`}
                  style={{
                    transform: `scale(${zoomScale})`,
                  }}
                  className="modal-main-img"
                />
              </div>

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  className="modal-nav-btn next"
                  onClick={handleNextImage}
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
                        setZoomScale(1);
                      }}
                      className={`modal-thumb-item ${
                        modalImageIndex === idx ? "active" : ""
                      }`}
                      title={`Pilih foto ${idx + 1}`}
                    >
                      <img src={img} alt={`thumb-${idx + 1}`} />
                      <span className="modal-thumb-num">{idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
