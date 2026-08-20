"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiMapPin,
  FiStar,
  FiPlay,
} from "react-icons/fi";
import {
  getStoredPortfolios,
  subscribePortfolios,
  syncPortfoliosFromDatabase,
  isVideoMedia,
} from "@/lib/portfolioStore";

const DEFAULT_FILTER_CATEGORIES = [
  "Semua",
  "Karpet Masjid",
  "Karpet Hotel",
  "Karpet Kantor",
  "Karpet Rumah",
  "Karpet Custom",
];

function Portofolio() {
  const [projects, setProjects] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [filterCategories, setFilterCategories] = useState(DEFAULT_FILTER_CATEGORIES);

  useEffect(() => {
    // 1. Initial cached portfolios
    const initial = getStoredPortfolios();
    setProjects(initial);
    updateDynamicFilterList(initial);

    // 2. Fetch fresh portfolios from Prisma PostgreSQL database
    syncPortfoliosFromDatabase().then((dbPortfolios) => {
      if (Array.isArray(dbPortfolios) && dbPortfolios.length > 0) {
        setProjects(dbPortfolios);
        updateDynamicFilterList(dbPortfolios);
      }
    });

    // 3. Realtime subscription
    const unsubscribe = subscribePortfolios((updated) => {
      setProjects(updated);
      updateDynamicFilterList(updated);
    });

    return () => unsubscribe();
  }, []);

  const updateDynamicFilterList = (list) => {
    if (!Array.isArray(list)) return;
    const catSet = new Set(["Semua"]);
    list.forEach((p) => {
      if (p.category) {
        const catName = p.category.startsWith("Karpet ") ? p.category : `Karpet ${p.category}`;
        catSet.add(catName);
      }
    });
    setFilterCategories(Array.from(catSet));
  };

  const normalizeCat = (cat = "") =>
    cat.toLowerCase().replace(/^karpet\s+/i, "").trim();

  const filteredProjects = projects.filter((item) => {
    if (selectedFilter === "Semua") return true;
    const itemNorm = normalizeCat(item.category);
    const filterNorm = normalizeCat(selectedFilter);
    return itemNorm === filterNorm || item.category === selectedFilter;
  });

  return (
    <section className="portfolio-section">
      <div className="portfolio-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>PORTOFOLIO PROYEK TERBAIK</span>
        </span>

        <h2>
          Ratusan Proyek Karpet Telah Sukses Kami Kerjakan
        </h2>

        <p>
          Dokumentasi dedikasi pemasangan karpet berkualitas tinggi bergaransi resmi untuk masjid, hotel, ballroom, kantor, dan residensial di seluruh Indonesia.
        </p>

        {/* FILTER CATEGORY PILLS */}
        <div className="portfolio-filter-tabs">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`portfolio-filter-btn ${
                selectedFilter === cat ? "active" : ""
              }`}
              onClick={() => setSelectedFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="portfolio-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, idx) => {
            const isVideo = isVideoMedia(project.image, project.mediaType);
            const categoryDisplay = project.category?.startsWith("Karpet ")
              ? project.category
              : `Karpet ${project.category || "Custom"}`;

            return (
              <div
                key={project.id || idx}
                className="portfolio-card"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="portfolio-card-img-wrap">
                  {isVideo ? (
                    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000" }}>
                      <video
                        src={project.image}
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          borderRadius: "50%",
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                        }}
                      >
                        <FiPlay size={14} />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={project.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"}
                      alt={project.title}
                      className="portfolio-img"
                    />
                  )}
                  <div className="portfolio-card-overlay" />
                  <span className="portfolio-badge">
                    {categoryDisplay}
                  </span>
                </div>

                <div className="portfolio-content">
                  <h3>{project.title}</h3>

                  <p className="portfolio-location-row">
                    <FiMapPin size={14} className="pin-icon" />
                    <span>{project.location || "Indonesia"}</span>
                    {project.area && (
                      <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "12px" }}>
                        Luas: {project.area}
                      </span>
                    )}
                  </p>

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="portfolio-btn"
                  >
                    <span>Lihat Detail Proyek</span>
                    <FiArrowRight className="btn-arrow-icon" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px 20px",
              color: "#94a3b8",
            }}
          >
            <p>Belum ada proyek pada kategori ini.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Portofolio;
