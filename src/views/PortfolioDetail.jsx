"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getStoredPortfolios,
  subscribePortfolios,
  DEFAULT_PORTFOLIOS,
  isVideoMedia,
} from "@/lib/portfolioStore";

import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiPhone,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function PortfolioDetail() {
  const params = useParams() || {};
  const id = params.id;

  const [portfolios, setPortfolios] = useState(DEFAULT_PORTFOLIOS);
  const [dbPortfolio, setDbPortfolio] = useState(null);

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

  const isVideo = isVideoMedia(portfolio.image, portfolio.mediaType);

  const handleWhatsApp = () => {
    const message = `Halo AB Carpet, saya tertarik dengan portofolio proyek "${portfolio.title}". Mohon info estimasi biaya dan konsultasi untuk lokasi kami.`;

    window.open(
      `https://wa.me/6281252235800?text=${encodeURIComponent(
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
          {/* IMAGE / VIDEO */}
          <div className="portfolio-image-card">
            {isVideo ? (
              <video
                src={portfolio.image}
                controls
                playsInline
                style={{ width: "100%", height: "100%", maxHeight: "460px", objectFit: "cover", borderRadius: "16px" }}
              />
            ) : (
              <img
                src={portfolio.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"}
                alt={portfolio.title}
                style={{ width: "100%", height: "100%", maxHeight: "460px", objectFit: "cover", borderRadius: "16px" }}
              />
            )}
          </div>

          {/* INFO */}
          <div className="portfolio-detail-info">
            <span className="portfolio-category-tag">
              {portfolio.category}
            </span>

            <h1>{portfolio.title}</h1>

            <p className="portfolio-desc">
              {portfolio.description || "Dokumentasi pengerjaan karpet profesional bergaransi resmi dari AB Carpet."}
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
