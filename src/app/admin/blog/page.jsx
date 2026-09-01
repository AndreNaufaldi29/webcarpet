"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredArticles,
  saveArticles,
  subscribeArticles,
  syncArticlesFromDatabase,
  BLOG_CATEGORIES,
} from "@/lib/blogStore";
import {
  FiPlus,
  FiBookOpen,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiClock,
  FiEye,
  FiExternalLink,
  FiCheckCircle,
  FiX,
  FiUpload,
  FiTag,
  FiLayers,
  FiRefreshCw,
  FiAlertCircle,
  FiFileText,
  FiGlobe,
  FiZap,
  FiSliders,
  FiShare2,
} from "react-icons/fi";

const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function AdminBlogPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Form state including SEO Metadata
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Tips & Panduan",
    excerpt: "",
    content: "",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    readTime: "5 Menit Baca",
    publishedAt: "Maret 2026",
    tags: "karpet, interior, tips",
    status: "Dipublikasikan",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    robotsIndex: "index, follow",
  });

  const fetchArticlesFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/articles");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setArticles(json.data);
        saveArticles(json.data);
        if (showNotification) {
          showToast("Data artikel berhasil disinkronkan dari Database Prisma!");
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database artikel:", err);
      if (showNotification) {
        showToast("Koneksi database offline, menampilkan data cache.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setArticles(getStoredArticles());
    fetchArticlesFromDB(false);

    const unsubscribe = subscribeArticles((updated) => {
      setArticles(updated);
    });

    // Real-time polling every 10 seconds for live database views
    const interval = setInterval(() => {
      fetchArticlesFromDB(false);
    }, 10000);

    const handleFocus = () => {
      fetchArticlesFromDB(false);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const updateArticlesAndPersist = (updated) => {
    setArticles(updated);
    saveArticles(updated);
  };

  // Handle Photo Upload via FileReader
  const handleImageUpload = (e, field = "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar maksimal adalah 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData((prev) => ({
        ...prev,
        [field]: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Auto generate slug & default SEO when typing title
  const handleTitleChange = (val, isEdit = false) => {
    const newSlug = slugify(val);
    setFormData((prev) => {
      const shouldUpdateSlug = !isEdit && (!prev.slug || prev.slug === slugify(prev.title));
      const shouldUpdateMetaTitle = !isEdit && (!prev.metaTitle || prev.metaTitle === `${prev.title} | Rumah Indah Carpet`);
      return {
        ...prev,
        title: val,
        slug: shouldUpdateSlug ? newSlug : prev.slug,
        metaTitle: shouldUpdateMetaTitle ? `${val} | Rumah Indah Carpet` : prev.metaTitle,
      };
    });
  };

  // Auto-generate all SEO fields from content
  const handleAutoGenerateSEO = () => {
    const currentSlug = slugify(formData.slug || formData.title);
    const cleanedExcerpt = formData.excerpt.trim() || formData.content.slice(0, 150).replace(/[#*>-]/g, "").trim();
    
    setFormData((prev) => ({
      ...prev,
      metaTitle: `${prev.title.trim()} | Rumah Indah Carpet`,
      metaDescription: cleanedExcerpt.length > 160 ? `${cleanedExcerpt.slice(0, 157)}...` : cleanedExcerpt,
      metaKeywords: prev.tags.trim() || `${prev.category.toLowerCase()}, karpet masjid, karpet hotel, rumah indah carpet`,
      canonicalUrl: `https://webcarpet-p2id.vercel.app/blog/${currentSlug}`,
      ogImage: prev.image,
      robotsIndex: "index, follow",
    }));

    showToast("Metadata SEO berhasil dibuat secara otomatis dari konten!");
  };

  // Insert markdown snippet into content textarea
  const insertMarkdownSnippet = (snippet) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${snippet}` : snippet,
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      slug: "",
      category: "Tips & Panduan",
      excerpt: "",
      content: "",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      readTime: "5 Menit Baca",
      publishedAt: "Maret 2026",
      tags: "karpet, interior, tips",
      status: "Dipublikasikan",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogImage: "",
      robotsIndex: "index, follow",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (art) => {
    setSelectedArticle(art);
    setFormData({
      title: art.title || "",
      slug: art.slug || "",
      category: art.category || "Tips & Panduan",
      excerpt: art.excerpt || "",
      content: art.content || "",
      image: art.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      readTime: art.readTime || "5 Menit Baca",
      publishedAt: art.publishedAt || "Maret 2026",
      tags: Array.isArray(art.tags) ? art.tags.join(", ") : art.tags || "",
      status: art.status || "Dipublikasikan",
      metaTitle: art.metaTitle || `${art.title || ""} | Rumah Indah Carpet`,
      metaDescription: art.metaDescription || art.excerpt || "",
      metaKeywords: art.metaKeywords || (Array.isArray(art.tags) ? art.tags.join(", ") : ""),
      canonicalUrl: art.canonicalUrl || `https://webcarpet-p2id.vercel.app/blog/${art.slug || ""}`,
      ogImage: art.ogImage || art.image || "",
      robotsIndex: art.robotsIndex || "index, follow",
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (art) => {
    setSelectedArticle(art);
    setShowDeleteModal(true);
  };

  const handleOpenPreview = (art) => {
    setSelectedArticle(art);
    setShowPreviewModal(true);
  };

  // Save new article
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Judul artikel wajib diisi!");
      return;
    }

    const finalSlug = slugify(formData.slug || formData.title);
    const parsedTags = formData.tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: finalSlug || `artikel-${Date.now()}`,
      category: formData.category,
      excerpt: formData.excerpt.trim() || formData.title.trim(),
      content: formData.content.trim() || "Konten artikel sedang disiapkan.",
      image: formData.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      readTime: formData.readTime || "5 Menit Baca",
      publishedAt: formData.publishedAt || "Maret 2026",
      tags: parsedTags.length > 0 ? parsedTags : ["karpet", "tips"],
      status: formData.status || "Dipublikasikan",
      metaTitle: formData.metaTitle.trim() || `${formData.title.trim()} | Rumah Indah Carpet`,
      metaDescription: formData.metaDescription.trim() || formData.excerpt.trim(),
      metaKeywords: formData.metaKeywords.trim() || parsedTags.join(", "),
      canonicalUrl: formData.canonicalUrl.trim() || `https://webcarpet-p2id.vercel.app/blog/${finalSlug}`,
      ogImage: formData.ogImage.trim() || formData.image,
      robotsIndex: formData.robotsIndex || "index, follow",
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = [result.data, ...articles];
        updateArticlesAndPersist(updated);
        setShowAddModal(false);
        showToast(`Artikel "${result.data.title}" berhasil disimpan & dioptimalkan untuk SEO!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal simpan artikel ke API:", err);
    }

    // Fallback local save
    const newArt = { id: Date.now(), views: 0, ...payload };
    const updated = [newArt, ...articles];
    updateArticlesAndPersist(updated);
    setShowAddModal(false);
    showToast(`Artikel "${newArt.title}" berhasil ditambahkan & metadata SEO aktif!`);
  };

  // Save edited article
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedArticle || !formData.title.trim()) return;

    const finalSlug = slugify(formData.slug || formData.title);
    const parsedTags = formData.tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const payload = {
      id: selectedArticle.id,
      slug: finalSlug,
      title: formData.title.trim(),
      category: formData.category,
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      image: formData.image,
      readTime: formData.readTime,
      publishedAt: formData.publishedAt,
      tags: parsedTags,
      status: formData.status,
      views: selectedArticle.views || 0,
      metaTitle: formData.metaTitle.trim() || `${formData.title.trim()} | Rumah Indah Carpet`,
      metaDescription: formData.metaDescription.trim() || formData.excerpt.trim(),
      metaKeywords: formData.metaKeywords.trim() || parsedTags.join(", "),
      canonicalUrl: formData.canonicalUrl.trim() || `https://webcarpet-p2id.vercel.app/blog/${finalSlug}`,
      ogImage: formData.ogImage.trim() || formData.image,
      robotsIndex: formData.robotsIndex || "index, follow",
    };

    try {
      const res = await fetch("/api/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = articles.map((item) =>
          item.id === selectedArticle.id ? { ...item, ...result.data } : item
        );
        updateArticlesAndPersist(updated);
        setShowEditModal(false);
        showToast(`Metadata SEO & artikel "${formData.title}" berhasil diperbarui di Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal update artikel ke API:", err);
    }

    const updated = articles.map((item) =>
      item.id === selectedArticle.id ? { ...item, ...payload } : item
    );
    updateArticlesAndPersist(updated);
    setShowEditModal(false);
    showToast(`Metadata SEO & artikel "${formData.title}" berhasil diperbarui!`);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedArticle) return;
    try {
      await fetch(
        `/api/articles?id=${selectedArticle.id}&slug=${selectedArticle.slug}`,
        { method: "DELETE" }
      );
    } catch (err) {
      console.warn("Gagal delete artikel ke API:", err);
    }

    const updated = articles.filter(
      (a) => a.id !== selectedArticle.id && a.slug !== selectedArticle.slug
    );
    updateArticlesAndPersist(updated);
    setShowDeleteModal(false);
    showToast(`Artikel "${selectedArticle.title}" berhasil dihapus dari database.`);
  };

  // Filtered articles
  const filteredArticles = articles.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(item.tags) &&
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchCategory =
      categoryFilter === "Semua" || item.category === categoryFilter;

    const matchStatus =
      statusFilter === "Semua" ||
      (statusFilter === "Dipublikasikan" && item.status !== "Draf") ||
      item.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const publishedCount = articles.filter((a) => a.status !== "Draf").length;
  const draftCount = articles.filter((a) => a.status === "Draf").length;

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN */}
      <main className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* HEADER */}
        <AdminHeader
          title="Manajemen Blog & Artikel SEO"
          breadcrumb="ADMIN PANEL / EDUKASI & ARTIKEL"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT */}
        <div className="admin-content">
          {/* STATS SUMMARY */}
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                  <FiBookOpen size={20} />
                </div>
                <span className="stat-change">Total</span>
              </div>
              <div className="stat-value">{articles.length}</div>
              <div className="stat-title">Total Artikel Edukasi</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <FiCheckCircle size={20} />
                </div>
                <span className="stat-change">Live</span>
              </div>
              <div className="stat-value">{publishedCount}</div>
              <div className="stat-title">Artikel Dipublikasikan</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                  <FiFileText size={20} />
                </div>
                <span className="stat-change">Draft</span>
              </div>
              <div className="stat-value">{draftCount}</div>
              <div className="stat-title">Draf Belum Terbit</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#faf5ff", color: "#9333ea" }}>
                  <FiGlobe size={20} />
                </div>
                <span
                  className="stat-change"
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#16a34a",
                    fontWeight: 700,
                    fontSize: "11px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                  Live DB
                </span>
              </div>
              <div className="stat-value">{totalViews.toLocaleString("id-ID")}</div>
              <div className="stat-title">Total Pembaca (Real-Time DB)</div>
            </div>
          </div>

          {/* FILTER & TOOLBAR */}
          <div className="admin-user-filter-bar">
            <div className="admin-filter-group">
              <div className="admin-search-input-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari judul, topik, atau kata kunci artikel..."
                  className="admin-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="admin-select-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="Semua">Semua Kategori</option>
                {BLOG_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                className="admin-select-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Dipublikasikan">Dipublikasikan</option>
                <option value="Draf">Draf</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => fetchArticlesFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan artikel dengan database PostgreSQL melalui Prisma"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 15px",
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  color: "#60a5fa",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: isSyncing ? "not-allowed" : "pointer",
                }}
              >
                <FiRefreshCw className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleOpenAdd}
              >
                <FiPlus size={18} />
                <span>Tulis Artikel Baru</span>
              </button>
            </div>
          </div>

          {/* ARTICLES TABLE / GRID */}
          <div className="admin-cards-grid">
            {filteredArticles.map((art) => (
              <div className="admin-port-card" key={art.id}>
                <div className="admin-port-image">
                  <img src={art.image} alt={art.title} />
                  <span className="admin-port-badge">{art.category}</span>
                  {art.status === "Draf" && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(234, 88, 12, 0.9)",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      DRAF
                    </span>
                  )}
                  {art.metaTitle && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(10, 59, 37, 0.9)",
                        color: "#D8C2A4",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        border: "1px solid rgba(216, 194, 164, 0.4)",
                      }}
                      title="Metadata SEO Google Aktif"
                    >
                      SEO OPTIMAL
                    </span>
                  )}
                </div>

                <div className="admin-port-body">
                  <h3 className="admin-port-title" style={{ fontSize: "15px", lineHeight: "1.4" }}>
                    {art.title}
                  </h3>

                  <div className="admin-port-meta" style={{ marginBottom: "8px" }}>
                    <span>
                      <FiCalendar size={12} color="#16a34a" /> {art.publishedAt}
                    </span>
                    <span>
                      <FiClock size={12} color="#2563eb" /> {art.readTime}
                    </span>
                    <span>
                      <FiEye size={12} color="#9333ea" /> {art.views || 0} views
                    </span>
                  </div>

                  <p className="admin-port-desc" style={{ WebkitLineClamp: 2, marginBottom: "12px" }}>
                    {art.metaDescription || art.excerpt}
                  </p>

                  {/* TAGS */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
                    {Array.isArray(art.tags) &&
                      art.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(226, 232, 240, 0.6)",
                            color: "#475569",
                            fontWeight: 600,
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>

                  <div className="admin-article-card-actions">
                    <Link
                      href={`/blog/${art.slug}`}
                      target="_blank"
                      className="admin-article-action-btn view"
                      title="Lihat artikel di web live"
                    >
                      <FiExternalLink size={13} />
                      <span>Lihat</span>
                    </Link>

                    <button
                      type="button"
                      className="admin-article-action-btn format"
                      onClick={() => handleOpenPreview(art)}
                      title="Pratinjau Format Artikel"
                    >
                      <FiEye size={13} />
                      <span>Format</span>
                    </button>

                    <button
                      type="button"
                      className="admin-article-action-btn edit"
                      onClick={() => handleOpenEdit(art)}
                      title="Edit Konten & SEO Artikel"
                    >
                      <FiEdit2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="admin-article-action-btn delete"
                      onClick={() => handleOpenDelete(art)}
                      title="Hapus Artikel"
                    >
                      <FiTrash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="admin-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
              <FiBookOpen size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h3 style={{ margin: "0 0 6px" }}>Tidak ada artikel ditemukan</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                Coba sesuaikan filter kategori, status, atau kata kunci pencarian Anda.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* =================================================
          MODAL TAMBAH ARTIKEL DENGAN METADATA SEO
      ================================================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box admin-blog-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Tulis Artikel Edukasi Baru</h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Lengkap dengan optimasi Metadata SEO Google
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveNew}>
              <div className="admin-modal-body">
                {/* 1. INFORMASI DASAR ARTIKEL */}
                <div className="admin-form-group">
                  <label>Judul Artikel <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Panduan Lengkap Memilih Karpet Masjid Berkualitas Tinggi"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value, false)}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Slug URL (SEO Friendly)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="panduan-memilih-karpet-masjid"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    />
                    <small style={{ color: "#64748b", fontSize: "11px", marginTop: "4px", display: "block" }}>
                      URL: /blog/{formData.slug || "judul-artikel"}
                    </small>
                  </div>

                  <div className="admin-form-group">
                    <label>Kategori Artikel</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {BLOG_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label>Waktu Estimasi Baca</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 6 Menit Baca"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tanggal Rilis / Publikasi</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 1 Maret 2026"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Status Publikasi</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Dipublikasikan">Dipublikasikan</option>
                      <option value="Draf">Draf (Belum Terbit)</option>
                    </select>
                  </div>
                </div>

                {/* COVER IMAGE */}
                <div className="admin-form-group">
                  <label>Foto Sampul Artikel <span className="required">*</span></label>
                  <div className="admin-image-upload-row">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Masukkan URL Gambar (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <label className="admin-upload-btn" title="Pilih foto dari perangkat">
                      <FiUpload size={14} />
                      <span>Pilih File</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(e, "image")}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div style={{ width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <img
                        src={formData.image}
                        alt="Preview Sampul"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                </div>

                {/* EXCERPT */}
                <div className="admin-form-group">
                  <label>Ringkasan Singkat / Excerpt (untuk Google snippet & kartu)</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    placeholder="Ringkasan 1-2 kalimat seputar isi pembahasan artikel..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  />
                </div>

                {/* CONTENT WITH MARKDOWN TOOLBAR */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                    <label style={{ margin: 0 }}>Isi Konten Lengkap Artikel</label>
                    <div className="admin-markdown-tools">
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("## Sub-Judul Utama")}
                      >
                        + H2
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("### Poin Pembahasan")}
                      >
                        + H3
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("- **Poin Penting**: Penjelasan detail di sini.\n- **Poin Kedua**: Penjelasan tambahan.")}
                      >
                        + List Centang
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("> **Tips Spesialis**: Rekomendasi ahli untuk hasil terbaik.")}
                      >
                        + Callout Box
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("---")}
                      >
                        + Garis Pemisah
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="admin-textarea"
                    rows={8}
                    placeholder="Tulis artikel lengkap di sini. Gunakan ## untuk Sub-judul, - untuk list centang, dan > untuk box tips..."
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                {/* TAGS */}
                <div className="admin-form-group">
                  <label>Tag Topik (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: karpet masjid, shaf, perawatan, obras"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                {/* =================================================
                    2. METADATA SEO & GOOGLE RANKING OPTIMIZATION
                ================================================= */}
                <div className="admin-seo-card">
                  <div className="admin-seo-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#0A3B25", color: "#D8C2A4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FiGlobe size={15} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0A3B25", display: "block" }}>
                          Pengaturan Metadata SEO & Google Ranking
                        </strong>
                        <span style={{ fontSize: "11px", color: "#4A5B52" }}>
                          Optimalkan judul, deskripsi, dan keyword agar artikel berada di peringkat atas Google
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoGenerateSEO}
                      className="action-btn-pill"
                      style={{
                        background: "linear-gradient(135deg, #0A3B25 0%, #2A6151 100%)",
                        color: "#FCF7F0",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                      title="Otomatis buat Meta Title, Description, dan Keywords dari artikel"
                    >
                      <FiZap size={13} color="#D8C2A4" />
                      <span>Auto-Generate SEO</span>
                    </button>
                  </div>

                  {/* GOOGLE SERP LIVE PREVIEW */}
                  <div className="admin-serp-box">
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                      Pratinjau Hasil Pencarian Google (SERP Preview)
                    </span>
                    <div style={{ fontFamily: "Arial, sans-serif" }}>
                      <div style={{ fontSize: "12px", color: "#202124", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px", flexWrap: "wrap" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#0A3B25", color: "#fff", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                          R
                        </div>
                        <span style={{ color: "#202124", fontWeight: 500 }}>Rumah Indah Carpet</span>
                        <span style={{ color: "#5f6368" }}>› blog › {formData.slug || "panduan-karpet"}</span>
                      </div>
                      <h4 style={{ fontSize: "17px", color: "#1a0dab", fontWeight: 400, margin: "0 0 4px", lineHeight: "1.35", cursor: "pointer", wordBreak: "break-word" }}>
                        {formData.metaTitle || (formData.title ? `${formData.title} | Rumah Indah Carpet` : "Judul Artikel di Hasil Pencarian Google")}
                      </h4>
                      <p style={{ fontSize: "12.5px", color: "#4d5156", lineHeight: "1.5", margin: 0, wordBreak: "break-word" }}>
                        {formData.metaDescription || formData.excerpt || "Deskripsi ringkas yang menarik pembaca mengklik artikel Anda dari hasil pencarian Google..."}
                      </p>
                    </div>
                  </div>

                  {/* META TITLE */}
                  <div className="admin-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                      <label style={{ margin: 0 }}>
                        Meta Title Google <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>(Judul Tag HTML)</span>
                      </label>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color:
                            (formData.metaTitle?.length || 0) > 60
                              ? "#ea580c"
                              : (formData.metaTitle?.length || 0) >= 30
                              ? "#16a34a"
                              : "#64748b",
                        }}
                      >
                        {formData.metaTitle?.length || 0} / 60 Karakter{" "}
                        {(formData.metaTitle?.length || 0) > 60
                          ? "(Terlalu panjang ⚠️)"
                          : (formData.metaTitle?.length || 0) >= 30
                          ? "(Optimal ✅)"
                          : ""}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Panduan Memilih Karpet Masjid Berkualitas | Rumah Indah Carpet"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    />
                  </div>

                  {/* META DESCRIPTION */}
                  <div className="admin-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                      <label style={{ margin: 0 }}>
                        Meta Description <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>(Snippet Pencarian Google)</span>
                      </label>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color:
                            (formData.metaDescription?.length || 0) > 160
                              ? "#ea580c"
                              : (formData.metaDescription?.length || 0) >= 80
                              ? "#16a34a"
                              : "#64748b",
                        }}
                      >
                        {formData.metaDescription?.length || 0} / 160 Karakter{" "}
                        {(formData.metaDescription?.length || 0) > 160
                          ? "(Terlalu panjang ⚠️)"
                          : (formData.metaDescription?.length || 0) >= 80
                          ? "(Optimal ✅)"
                          : ""}
                      </span>
                    </div>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      placeholder="Ringkasan informatif 120-160 karakter yang menggugah calon klien mengklik link dari Google..."
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    />
                  </div>

                  {/* KEYWORDS & CANONICAL */}
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Kata Kunci Fokus / Target Keywords</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="karpet masjid sidoarjo, karpet hotel surabaya, harga karpet"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>URL Kanonikal (Canonical URL)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://webcarpet-p2id.vercel.app/blog/..."
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* OPENGRAPH IMAGE & ROBOTS */}
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Gambar Sosial Media (OpenGraph / Share Preview)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="URL Gambar Pratinjau WhatsApp / FB (Opsional)"
                        value={formData.ogImage}
                        onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Arahan Robot Indeksasi (Robots Directive)</label>
                      <select
                        className="admin-select"
                        value={formData.robotsIndex}
                        onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.value })}
                      >
                        <option value="index, follow">index, follow (Rekomendasi SEO)</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Publikasikan Artikel & Aktifkan SEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL EDIT ARTIKEL DENGAN METADATA SEO
      ================================================= */}
      {showEditModal && selectedArticle && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-box admin-blog-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Edit Artikel & Metadata SEO</h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Perbarui konten dan parameter pencarian Google
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                {/* 1. KONTEN UTAMA */}
                <div className="admin-form-group">
                  <label>Judul Artikel <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value, true)}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Slug URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    />
                    <small style={{ color: "#64748b", fontSize: "11px", marginTop: "4px", display: "block" }}>
                      URL: /blog/{formData.slug}
                    </small>
                  </div>

                  <div className="admin-form-group">
                    <label>Kategori Artikel</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {BLOG_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row-3">
                  <div className="admin-form-group">
                    <label>Waktu Estimasi Baca</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tanggal Rilis</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Status Publikasi</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Dipublikasikan">Dipublikasikan</option>
                      <option value="Draf">Draf (Belum Terbit)</option>
                    </select>
                  </div>
                </div>

                {/* COVER IMAGE */}
                <div className="admin-form-group">
                  <label>Foto Sampul Artikel</label>
                  <div className="admin-image-upload-row">
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <label className="admin-upload-btn" title="Pilih foto dari perangkat">
                      <FiUpload size={14} />
                      <span>Pilih File</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(e, "image")}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div style={{ width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <img
                        src={formData.image}
                        alt="Preview Sampul"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                </div>

                {/* EXCERPT */}
                <div className="admin-form-group">
                  <label>Ringkasan Singkat / Excerpt</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  />
                </div>

                {/* CONTENT */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                    <label style={{ margin: 0 }}>Isi Konten Lengkap Artikel</label>
                    <div className="admin-markdown-tools">
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("## Sub-Judul Baru")}
                      >
                        + H2
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("### Poin Baru")}
                      >
                        + H3
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("- **Poin**: Penjelasan poin penting.")}
                      >
                        + List
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill"
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                        onClick={() => insertMarkdownSnippet("> **Catatan**: Rekomendasi khusus.")}
                      >
                        + Callout
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="admin-textarea"
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                {/* TAGS */}
                <div className="admin-form-group">
                  <label>Tag Topik</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                {/* =================================================
                    2. METADATA SEO & GOOGLE RANKING OPTIMIZATION
                ================================================= */}
                <div className="admin-seo-card">
                  <div className="admin-seo-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#0A3B25", color: "#D8C2A4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FiGlobe size={15} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0A3B25", display: "block" }}>
                          Pengaturan Metadata SEO & Google Ranking
                        </strong>
                        <span style={{ fontSize: "11px", color: "#4A5B52" }}>
                          Perbarui meta title, description, dan keyword untuk mempertahankan ranking Google
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoGenerateSEO}
                      className="action-btn-pill"
                      style={{
                        background: "linear-gradient(135deg, #0A3B25 0%, #2A6151 100%)",
                        color: "#FCF7F0",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                      title="Otomatis buat Meta Title, Description, dan Keywords dari artikel"
                    >
                      <FiZap size={13} color="#D8C2A4" />
                      <span>Auto-Generate SEO</span>
                    </button>
                  </div>

                  {/* GOOGLE SERP LIVE PREVIEW */}
                  <div className="admin-serp-box">
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                      Pratinjau Hasil Pencarian Google (SERP Preview)
                    </span>
                    <div style={{ fontFamily: "Arial, sans-serif" }}>
                      <div style={{ fontSize: "12px", color: "#202124", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px", flexWrap: "wrap" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#0A3B25", color: "#fff", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                          R
                        </div>
                        <span style={{ color: "#202124", fontWeight: 500 }}>Rumah Indah Carpet</span>
                        <span style={{ color: "#5f6368" }}>› blog › {formData.slug || "panduan-karpet"}</span>
                      </div>
                      <h4 style={{ fontSize: "17px", color: "#1a0dab", fontWeight: 400, margin: "0 0 4px", lineHeight: "1.35", cursor: "pointer", wordBreak: "break-word" }}>
                        {formData.metaTitle || (formData.title ? `${formData.title} | Rumah Indah Carpet` : "Judul Artikel di Hasil Pencarian Google")}
                      </h4>
                      <p style={{ fontSize: "12.5px", color: "#4d5156", lineHeight: "1.5", margin: 0, wordBreak: "break-word" }}>
                        {formData.metaDescription || formData.excerpt || "Deskripsi ringkas yang menarik pembaca mengklik artikel Anda dari hasil pencarian Google..."}
                      </p>
                    </div>
                  </div>

                  {/* META TITLE */}
                  <div className="admin-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                      <label style={{ margin: 0 }}>
                        Meta Title Google <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>(Judul Tag HTML)</span>
                      </label>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color:
                            (formData.metaTitle?.length || 0) > 60
                              ? "#ea580c"
                              : (formData.metaTitle?.length || 0) >= 30
                              ? "#16a34a"
                              : "#64748b",
                        }}
                      >
                        {formData.metaTitle?.length || 0} / 60 Karakter{" "}
                        {(formData.metaTitle?.length || 0) > 60
                          ? "(Terlalu panjang ⚠️)"
                          : (formData.metaTitle?.length || 0) >= 30
                          ? "(Optimal ✅)"
                          : ""}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Panduan Memilih Karpet Masjid Berkualitas | Rumah Indah Carpet"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    />
                  </div>

                  {/* META DESCRIPTION */}
                  <div className="admin-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                      <label style={{ margin: 0 }}>
                        Meta Description <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>(Snippet Pencarian Google)</span>
                      </label>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color:
                            (formData.metaDescription?.length || 0) > 160
                              ? "#ea580c"
                              : (formData.metaDescription?.length || 0) >= 80
                              ? "#16a34a"
                              : "#64748b",
                        }}
                      >
                        {formData.metaDescription?.length || 0} / 160 Karakter{" "}
                        {(formData.metaDescription?.length || 0) > 160
                          ? "(Terlalu panjang ⚠️)"
                          : (formData.metaDescription?.length || 0) >= 80
                          ? "(Optimal ✅)"
                          : ""}
                      </span>
                    </div>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      placeholder="Ringkasan informatif 120-160 karakter yang menggugah calon klien mengklik link dari Google..."
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    />
                  </div>

                  {/* KEYWORDS & CANONICAL */}
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Kata Kunci Fokus / Target Keywords</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="karpet masjid sidoarjo, karpet hotel surabaya, harga karpet"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>URL Kanonikal (Canonical URL)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://webcarpet-p2id.vercel.app/blog/..."
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* OPENGRAPH IMAGE & ROBOTS */}
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Gambar Sosial Media (OpenGraph / Share Preview)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="URL Gambar Pratinjau WhatsApp / FB (Opsional)"
                        value={formData.ogImage}
                        onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Arahan Robot Indeksasi (Robots Directive)</label>
                      <select
                        className="admin-select"
                        value={formData.robotsIndex}
                        onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.value })}
                      >
                        <option value="index, follow">index, follow (Rekomendasi SEO)</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Simpan Perubahan & Perbarui SEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL PREVIEW ARTIKEL
      ================================================= */}
      {showPreviewModal && selectedArticle && (
        <div className="admin-modal-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Pratinjau Format Artikel</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowPreviewModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto", padding: "24px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  borderRadius: "999px",
                  background: "#0A3B25",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                {selectedArticle.category}
              </span>
              <h2 style={{ fontSize: "20px", color: "#0A3B25", margin: "0 0 12px", lineHeight: "1.3" }}>
                {selectedArticle.title}
              </h2>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", display: "flex", gap: "12px" }}>
                <span>📅 {selectedArticle.publishedAt}</span>
                <span>⏱️ {selectedArticle.readTime}</span>
                <span>👁️ {selectedArticle.views || 0} views</span>
              </div>
              <div style={{ width: "100%", height: "220px", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", borderLeft: "4px solid #0A3B25", marginBottom: "20px", fontSize: "14px", fontStyle: "italic" }}>
                {selectedArticle.excerpt}
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontSize: "13px", lineHeight: "1.7", color: "#334155" }}>
                {selectedArticle.content}
              </div>
            </div>
            <div className="admin-modal-footer">
              <Link
                href={`/blog/${selectedArticle.slug}`}
                target="_blank"
                className="admin-btn-primary"
                style={{ textDecoration: "none" }}
              >
                Buka di Web Live ↗
              </Link>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowPreviewModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL HAPUS ARTIKEL
      ================================================= */}
      {showDeleteModal && selectedArticle && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: "#dc2626" }}>Hapus Artikel</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: "1.6" }}>
                Apakah Anda yakin ingin menghapus artikel:
              </p>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#dc2626",
                  marginBottom: "12px",
                }}
              >
                "{selectedArticle.title}"
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                Tindakan ini akan menghapus artikel dari daftar blog publik dan database.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus Artikel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0A3B25",
            color: "#FCF7F0",
            padding: "12px 22px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.25)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
            border: "1px solid rgba(216, 194, 164, 0.4)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <FiCheckCircle size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
