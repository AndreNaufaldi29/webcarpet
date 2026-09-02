"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getArticleBySlug,
  getRelatedArticles,
  incrementArticleViews,
  subscribeArticles,
  syncArticlesFromDatabase,
} from "@/lib/blogStore";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiEye,
  FiShare2,
  FiCheck,
  FiCopy,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function BlogDetail({ initialArticle }) {
  const params = useParams() || {};
  const slug = params.slug || initialArticle?.slug;

  const [article, setArticle] = useState(
    initialArticle || (slug ? getArticleBySlug(slug) : null)
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialArticle) {
      setArticle(initialArticle);
    }
  }, [initialArticle]);

  useEffect(() => {
    if (slug) {
      // 1. Get initial from store or sync if missing
      const art = getArticleBySlug(slug);
      if (art && !initialArticle) {
        setArticle(art);
      } else if (!art && !initialArticle) {
        // Fallback sync from DB if article was freshly created
        syncArticlesFromDatabase().then((dbList) => {
          const fresh = Array.isArray(dbList)
            ? dbList.find((a) => a.slug === slug || String(a.id) === String(slug))
            : getArticleBySlug(slug);
          if (fresh) setArticle(fresh);
        });
      }

      // 2. Real-time increment in Database + Local Store
      incrementArticleViews(slug);
    }

    // 3. Listen to real-time updates (including live view counter)
    const unsubscribe = subscribeArticles((allArticles) => {
      const current = allArticles.find(
        (a) => a.slug === slug || String(a.id) === String(slug)
      );
      if (current) {
        setArticle((prev) => ({ ...prev, ...current }));
      }
    });

    return () => unsubscribe();
  }, [slug, initialArticle]);


  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="blog-not-found-page">
        <div className="blog-container">
          <div className="blog-empty-state">
            <FiBookOpen size={48} className="empty-icon" />
            <h2>Artikel Tidak Ditemukan</h2>
            <p>
              Maaf, artikel yang Anda cari mungkin telah dipindahkan atau tautan
              tidak valid.
            </p>
            <Link href="/blog" className="reset-filter-btn">
              Kembali ke Daftar Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedArticles = getRelatedArticles(article.slug, 3);
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://abcarpet.co.id/blog/${article.slug}`;

  // Social Share Handlers
  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Baca artikel menarik ini: "${article.title}" di Rumah Indah Carpet: ${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank"
    );
  };

  const handleShareTwitter = () => {
    const text = `"${article.title}" via Rumah Indah Carpet`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  // Convert markdown content to rich JSX blocks
  const renderFormattedContent = (rawContent = "") => {
    const lines = rawContent.trim().split("\n");
    const elements = [];
    let currentList = [];
    let key = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key++}`} className="article-body-list">
            {currentList.map((item, idx) => (
              <li key={idx}>
                <FiCheckCircle className="list-check-icon" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith("## ")) {
        flushList();
        const text = trimmed.replace("## ", "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        elements.push(
          <h2 key={`h2-${key++}`} id={id} className="article-heading-2">
            {text}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        flushList();
        const text = trimmed.replace("### ", "");
        elements.push(
          <h3 key={`h3-${key++}`} className="article-heading-3">
            {text}
          </h3>
        );
      } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const itemText = trimmed.replace(/^[\*\-]\s+/, "");
        // Format bold text inside list items
        const parts = itemText.split(/\*\*(.*?)\*\*/g);
        const renderedItem = parts.map((p, idx) =>
          idx % 2 === 1 ? <strong key={idx}>{p}</strong> : p
        );
        currentList.push(renderedItem);
      } else if (trimmed.startsWith("> ")) {
        flushList();
        const quoteText = trimmed.replace("> ", "");
        const parts = quoteText.split(/\*\*(.*?)\*\*/g);
        const renderedQuote = parts.map((p, idx) =>
          idx % 2 === 1 ? <strong key={idx}>{p}</strong> : p
        );
        elements.push(
          <blockquote key={`quote-${key++}`} className="article-callout-box">
            {renderedQuote}
          </blockquote>
        );
      } else if (trimmed === "---") {
        flushList();
        elements.push(<hr key={`hr-${key++}`} className="article-separator" />);
      } else if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        // Simple Markdown Table row
        flushList();
        // Skip markdown separator row like | :--- |
        if (!trimmed.includes("---")) {
          const cells = trimmed
            .split("|")
            .filter((_, i, arr) => i > 0 && i < arr.length - 1)
            .map((c) => c.trim());
          elements.push(
            <div key={`tbl-${key++}`} className="article-table-row">
              {cells.map((cell, idx) => {
                const parts = cell.split(/\*\*(.*?)\*\*/g);
                return (
                  <span key={idx} className={`tbl-col tbl-col-${idx}`}>
                    {parts.map((p, pIdx) =>
                      pIdx % 2 === 1 ? <strong key={pIdx}>{p}</strong> : p
                    )}
                  </span>
                );
              })}
            </div>
          );
        }
      } else {
        flushList();
        const parts = trimmed.split(/\*\*(.*?)\*\*/g);
        const renderedParagraph = parts.map((p, idx) =>
          idx % 2 === 1 ? <strong key={idx}>{p}</strong> : p
        );
        elements.push(
          <p key={`p-${key++}`} className="article-paragraph">
            {renderedParagraph}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="blog-detail-wrapper">
      {/* READING PROGRESS BAR */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <article className="blog-detail-page">
        <div className="blog-container">
          {/* TOP BREADCRUMB & BACK BUTTON */}
          <div className="blog-breadcrumb-row">
            <Link href="/blog" className="blog-back-btn">
              <FiArrowLeft size={16} />
              <span>Kembali ke Blog</span>
            </Link>

            <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Beranda</Link>
              <span>/</span>
              <Link href="/blog">Blog</Link>
              <span>/</span>
              <span className="current-crumb">{article.category}</span>
            </nav>
          </div>

          {/* ARTICLE HEADER */}
          <header className="article-header">
            <div className="article-category-badge">{article.category}</div>

            <h1 className="article-title">{article.title}</h1>

            <div className="article-meta-bar">
              <div className="meta-stats-block">
                <span>
                  <FiCalendar size={14} /> {article.publishedAt}
                </span>
                <span>
                  <FiClock size={14} /> {article.readTime}
                </span>
                <span>
                  <FiEye size={14} /> {article.views || 850} Views
                </span>
              </div>
            </div>
          </header>

          {/* MAIN COVER IMAGE */}
          <div className="article-cover-wrap">
            <img src={article.image} alt={article.title} />
            <span className="cover-caption">
              Dokumentasi & Inspirasi Karpet dari Rumah Indah Carpet
            </span>
          </div>

          {/* TWO-COLUMN LAYOUT: CONTENT + SIDEBAR */}
          <div className="article-layout-grid">
            {/* MAIN ARTICLE BODY */}
            <div className="article-main-body">
              <div className="article-excerpt-highlight">
                <p>{article.excerpt}</p>
              </div>

              {/* RENDERED CONTENT */}
              <div className="article-content-flow">
                {renderFormattedContent(article.content)}
              </div>

              {/* TAGS CLOUD */}
              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="article-tags-wrap">
                  <strong>Topik Terkait:</strong>
                  <div className="tags-list">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="article-tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SOCIAL SHARE BAR */}
              <div className="article-share-section">
                <span>Bagikan Artikel Ini:</span>
                <div className="share-buttons-group">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="share-btn wa"
                    title="Bagikan ke WhatsApp"
                  >
                    <FaWhatsapp size={16} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="share-btn fb"
                    title="Bagikan ke Facebook"
                  >
                    <FaFacebook size={16} />
                    <span>Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="share-btn x"
                    title="Bagikan ke X / Twitter"
                  >
                    <FaTwitter size={16} />
                    <span>Twitter</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="share-btn copy"
                    title="Salin Tautan Artikel"
                  >
                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                    <span>{copied ? "Tersalin!" : "Salin Link"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STICKY SIDEBAR */}
            <aside className="article-sidebar">
              {/* SIDEBAR CTA */}
              <div className="sidebar-cta-card">
                <span className="sidebar-badge">KONSULTASI PROYEK</span>
                <h3>Ingin Pasang Karpet untuk Masjid, Hotel, atau Kantor?</h3>
                <p>
                  Dapatkan konsultasi gratis, survey lokasi pengukuran, dan
                  estimasi biaya terbaik dari tim Rumah Indah Carpet.
                </p>
                <a
                  href="https://wa.me/628212128701?text=Halo%20Rumah%20Indah%20Carpet%2C%20saya%20tertarik%20dengan%20artikel%20dan%20ingin%20konsultasi%20karpet."
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar-wa-btn"
                >
                  <FaWhatsapp size={18} />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>

              {/* SIDEBAR RELATED ARTICLES */}
              {relatedArticles.length > 0 && (
                <div className="sidebar-related-card">
                  <h4>Artikel Pilihan Lainnya</h4>
                  <div className="sidebar-related-list">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/blog/${rel.slug}`}
                        className="sidebar-related-item"
                      >
                        <img src={rel.image} alt={rel.title} />
                        <div>
                          <span className="rel-cat">{rel.category}</span>
                          <h5>{rel.title}</h5>
                          <span className="rel-time">
                            <FiClock size={11} /> {rel.readTime}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* BOTTOM RELATED ARTICLES SECTION */}
          {relatedArticles.length > 0 && (
            <section className="bottom-related-section">
              <div className="section-title-wrap">
                <span className="section-badge">REKOMENDASI ARTIKEL</span>
                <h2>Baca Artikel Terkait Lainnya</h2>
              </div>

              <div className="bottom-related-grid">
                {relatedArticles.map((rel) => (
                  <article key={rel.id} className="blog-card">
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="blog-card-img-wrap"
                    >
                      <img src={rel.image} alt={rel.title} loading="lazy" />
                      <span className="card-category-badge">
                        {rel.category}
                      </span>
                    </Link>

                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span>
                          <FiCalendar size={12} /> {rel.publishedAt}
                        </span>
                        <span>•</span>
                        <span>
                          <FiClock size={12} /> {rel.readTime}
                        </span>
                      </div>

                      <h3 className="blog-card-title">
                        <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h3>

                      <p className="blog-card-excerpt">{rel.excerpt}</p>

                      <div className="blog-card-footer">
                        <span className="card-tag-pill">
                          #{rel.tags?.[0] || rel.category}
                        </span>
                        <Link
                          href={`/blog/${rel.slug}`}
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
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
