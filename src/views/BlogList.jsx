"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getStoredArticles,
  subscribeArticles,
  syncArticlesFromDatabase,
  BLOG_CATEGORIES,
} from "@/lib/blogStore";
import {
  FiSearch,
  FiClock,
  FiCalendar,
  FiEye,
  FiArrowRight,
  FiBookOpen,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function BlogList() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Initial local state
    setArticles(getStoredArticles());

    // 2. Fetch fresh data from PostgreSQL database
    syncArticlesFromDatabase().then((dbArticles) => {
      if (Array.isArray(dbArticles) && dbArticles.length > 0) {
        setArticles(dbArticles);
      }
    });

    // 3. Subscribe to real-time events (including from admin updates)
    const unsubscribe = subscribeArticles((updated) => {
      setArticles(updated);
    });

    // 4. Re-sync whenever user returns to the tab
    const handleFocus = () => {
      syncArticlesFromDatabase().then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) {
          setArticles(fresh);
        }
      });
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  // Filter & Search Logic
  const filteredArticles = articles.filter((art) => {
    // Hide drafts from user-facing view unless published
    if (art.status === "Draf") return false;

    const matchCategory =
      selectedCategory === "Semua" || art.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === "" ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(art.tags) &&
        art.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    return matchCategory && matchSearch;
  });

  const featuredArticle =
    selectedCategory === "Semua" && searchQuery === "" && filteredArticles.length > 0
      ? filteredArticles[0]
      : null;

  const standardArticles = featuredArticle
    ? filteredArticles.filter((art) => art.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className="blog-page-wrapper">
      {/* BLOG HERO SECTION */}
      <section className="blog-hero-section">
        <div className="blog-container">
          <div className="blog-hero-header">
            <span className="section-badge animate-badge-pop">
              <FiBookOpen size={13} />
              <span>BLOG & EDUKASI KARPET</span>
            </span>

            <h1>Panduan, Tips & Inspirasi Karpet Terbaik</h1>

            <p>
              Temukan wawasan mendalam seputar pemilihan karpet masjid, tren interior
              ballroom hotel, efisiensi karpet tile kantor, hingga tips perawatan
              lantai komersial terpercaya dari para ahli.
            </p>

            {/* SEARCH INPUT */}
            <div className="blog-search-bar">
              <FiSearch className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Cari artikel, topik, atau kata kunci (contoh: karpet masjid, obras, tile)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari artikel blog"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="search-clear-btn"
                >
                  ✕
                </button>
              )}
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="blog-category-tabs">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`blog-cat-btn ${
                    selectedCategory === cat ? "active" : ""
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLES CONTAINER */}
      <section className="blog-feed-section">
        <div className="blog-container">
          {/* FEATURED ARTICLE HIGHLIGHT */}
          {featuredArticle && (
            <div className="blog-featured-card">
              <div className="featured-img-wrap">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  loading="eager"
                />
                <span className="featured-badge">ARTIKEL UTAMA</span>
              </div>

              <div className="featured-content">
                <div className="article-meta-row">
                  <span className="article-category-tag">
                    {featuredArticle.category}
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="meta-text">
                    <FiClock size={13} /> {featuredArticle.readTime}
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="meta-text">
                    <FiCalendar size={13} /> {featuredArticle.publishedAt}
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="meta-text">
                    <FiEye size={13} /> {featuredArticle.views || 0} views
                  </span>
                </div>

                <h2>
                  <Link href={`/blog/${featuredArticle.slug}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="featured-excerpt">{featuredArticle.excerpt}</p>

                <div className="featured-footer">
                  <div className="featured-tags-preview">
                    {Array.isArray(featuredArticle.tags) &&
                      featuredArticle.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="featured-tag-pill">
                          #{tag}
                        </span>
                      ))}
                  </div>

                  <Link
                    href={`/blog/${featuredArticle.slug}`}
                    className="read-more-btn"
                  >
                    <span>Baca Selengkapnya</span>
                    <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* GRID OF STANDARD ARTICLES */}
          {standardArticles.length > 0 ? (
            <div className="blog-grid">
              {standardArticles.map((article) => (
                <article key={article.id} className="blog-card">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="blog-card-img-wrap"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                    />
                    <span className="card-category-badge">
                      {article.category}
                    </span>
                  </Link>

                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span>
                        <FiCalendar size={12} /> {article.publishedAt}
                      </span>
                      <span>•</span>
                      <span>
                        <FiClock size={12} /> {article.readTime}
                      </span>
                      <span>•</span>
                      <span>
                        <FiEye size={12} /> {article.views || 0} views
                      </span>
                    </div>

                    <h3 className="blog-card-title">
                      <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                    </h3>

                    <p className="blog-card-excerpt">{article.excerpt}</p>

                    <div className="blog-card-footer">
                      <span className="card-tag-pill">
                        #{article.tags?.[0] || article.category}
                      </span>

                      <Link
                        href={`/blog/${article.slug}`}
                        className="card-read-link"
                      >
                        <span>Baca Selengkapnya</span>
                        <FiArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="blog-empty-state">
              <FiBookOpen size={48} className="empty-icon" />
              <h3>Tidak ada artikel yang sesuai</h3>
              <p>
                Coba ubah kata kunci pencarian atau pilih kategori artikel yang
                lain.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                }}
                className="reset-filter-btn"
              >
                Tampilkan Semua Artikel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA CONSULTATION BANNER */}
      <section className="blog-cta-section">
        <div className="blog-container">
          <div className="blog-cta-box">
            <div className="cta-text">
              <span className="cta-badge">KONSULTASI GRATIS</span>
              <h2>Punya Pertanyaan Spesifik Mengenai Proyek Karpet Anda?</h2>
              <p>
                Tim spesialis Rumah Indah Carpet siap membantu survey lokasi,
                estimasi kebutuhan ukuran shaf, dan pengiriman sampel gratis ke
                seluruh Indonesia.
              </p>
            </div>
            <div className="cta-action">
              <a
                href="https://wa.me/628212128701?text=Halo%20Rumah%20Indah%20Carpet%2C%20saya%20membaca%20artikel%20blog%20dan%20ingin%20konsultasi%20kebutuhan%20karpet."
                target="_blank"
                rel="noreferrer"
                className="blog-whatsapp-cta"
              >
                <FaWhatsapp size={22} />
                <span>Konsultasi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
