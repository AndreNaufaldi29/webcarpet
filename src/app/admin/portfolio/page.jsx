"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredPortfolios,
  savePortfolios,
  subscribePortfolios,
  DEFAULT_PORTFOLIOS,
  getPortfolioGalleryImages,
  isVideoMedia,
} from "@/lib/portfolioStore";
import {
  FiPlus,
  FiImage,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiMaximize,
  FiCheckCircle,
  FiX,
  FiUpload,
  FiVideo,
  FiPlay,
  FiClock,
  FiLayers,
  FiExternalLink,
  FiStar,
  FiRefreshCw,
} from "react-icons/fi";

export default function PortfolioPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [portfolios, setPortfolios] = useState(DEFAULT_PORTFOLIOS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchPortfoliosFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/portfolios");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setPortfolios(json.data);
        savePortfolios(json.data);
        if (showNotification) {
          showToast("Data portofolio berhasil disinkronkan dari Database Prisma!");
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database portofolio:", err);
      if (showNotification) {
        showToast("Koneksi database gagal, menampilkan cache lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Load from database on mount, fallback to storage
  useEffect(() => {
    setPortfolios(getStoredPortfolios());
    fetchPortfoliosFromDB(false);

    const unsubscribe = subscribePortfolios((updated) => {
      setPortfolios(updated);
    });

    return () => unsubscribe();
  }, []);

  // Save to storage and broadcast
  const updatePortfoliosAndPersist = (updated) => {
    setPortfolios(updated);
    savePortfolios(updated);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form state matching /portfolio/[id]
  const [formData, setFormData] = useState({
    title: "",
    category: "Masjid",
    location: "Sidoarjo, Jawa Timur",
    area: "450 m²",
    duration: "7 Hari",
    date: "Januari 2026",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    images: [],
    mediaType: "image",
    mediaFileName: "",
    description: "Instalasi karpet masjid tebal 14mm custom motif shaf hijau zamrud dengan list kiblat emas.",
  });

  // State for single gallery image URL input
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Handle Single / Cover Photo Upload
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      alert("Silakan pilih file foto (JPG, PNG, WEBP) atau video (MP4, WebM).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Ukuran file maksimal adalah 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData((prev) => {
        const existingImages = Array.isArray(prev.images) ? prev.images : [];
        const newImages = existingImages.includes(dataUrl)
          ? existingImages
          : [dataUrl, ...existingImages];

        return {
          ...prev,
          image: dataUrl,
          images: newImages,
          mediaType: isVideo ? "video" : "image",
          mediaFileName: file.name,
        };
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Multi-file upload for Gallery
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 50 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setFormData((prev) => {
          const currentList = Array.isArray(prev.images) ? prev.images : [];
          if (!currentList.includes(dataUrl)) {
            return {
              ...prev,
              images: [...currentList, dataUrl],
            };
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Add URL to Gallery
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    const url = newGalleryUrl.trim();
    setFormData((prev) => {
      const currentList = Array.isArray(prev.images) ? prev.images : [];
      if (!currentList.includes(url)) {
        return {
          ...prev,
          images: [...currentList, url],
        };
      }
      return prev;
    });
    setNewGalleryUrl("");
  };

  // Remove photo from Gallery
  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormData((prev) => {
      const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
      const removed = currentList.splice(indexToRemove, 1);
      let newMainImage = prev.image;

      // If removed image was the cover, fallback to first item
      if (removed[0] === prev.image) {
        newMainImage = currentList[0] || "";
      }

      return {
        ...prev,
        image: newMainImage,
        images: currentList,
      };
    });
  };

  // Set photo as Cover
  const handleSetCoverImage = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imgUrl,
      mediaType: isVideoMedia(imgUrl) ? "video" : "image",
    }));
    showToast("Foto utama / cover proyek berhasil diubah.");
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: "Masjid",
      location: "Sidoarjo, Jawa Timur",
      area: "450 m²",
      duration: "7 Hari",
      date: "Januari 2026",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200",
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200",
      ],
      mediaType: "image",
      mediaFileName: "",
      description: "Instalasi karpet masjid tebal 14mm custom motif shaf hijau zamrud dengan list kiblat emas.",
    });
    setNewGalleryUrl("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    const resolvedGallery = getPortfolioGalleryImages(item);

    setFormData({
      title: item.title || "",
      category: item.category || "Masjid",
      location: item.location || "Sidoarjo, Jawa Timur",
      area: item.area || "450 m²",
      duration: item.duration || "7 Hari",
      date: item.date || "Januari 2026",
      image: item.image || (resolvedGallery[0] || ""),
      images: resolvedGallery,
      mediaType: item.mediaType || (isVideoMedia(item.image) ? "video" : "image"),
      mediaFileName: "",
      description: item.description || "",
    });
    setNewGalleryUrl("");
    setShowEditModal(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Judul portofolio wajib diisi!");
      return;
    }

    const finalImage =
      formData.image ||
      formData.images[0] ||
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

    const finalImages =
      Array.isArray(formData.images) && formData.images.length > 0
        ? formData.images
        : [finalImage];

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location || "Indonesia",
      area: formData.area || "100 m²",
      duration: formData.duration || "7 Hari",
      date: formData.date || "2026",
      image: finalImage,
      images: finalImages,
      mediaType: formData.mediaType || (isVideoMedia(finalImage) ? "video" : "image"),
      description: formData.description || "Dokumentasi pengerjaan karpet profesional Rumah Indah Carpet.",
    };

    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = [result.data, ...portfolios];
        updatePortfoliosAndPersist(updated);
        setShowAddModal(false);
        showToast(`Portofolio "${result.data.title}" berhasil disimpan ke Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal simpan portofolio ke API:", err);
    }

    const newItem = { id: Date.now(), ...payload };
    const updated = [newItem, ...portfolios];
    updatePortfoliosAndPersist(updated);
    setShowAddModal(false);
    showToast(`Portofolio "${newItem.title}" berhasil ditambahkan!`);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !formData.title.trim()) return;

    const finalImage =
      formData.image ||
      formData.images[0] ||
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

    const finalImages =
      Array.isArray(formData.images) && formData.images.length > 0
        ? formData.images
        : [finalImage];

    const payload = {
      id: selectedItem.id,
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location,
      area: formData.area,
      duration: formData.duration,
      date: formData.date,
      image: finalImage,
      images: finalImages,
      mediaType: formData.mediaType || (isVideoMedia(finalImage) ? "video" : "image"),
      description: formData.description,
    };

    try {
      const res = await fetch("/api/portfolios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = portfolios.map((item) =>
          item.id === selectedItem.id ? { ...item, ...result.data } : item
        );
        updatePortfoliosAndPersist(updated);
        setShowEditModal(false);
        showToast(`Portofolio "${formData.title}" berhasil diperbarui di Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal update portofolio ke API:", err);
    }

    const updated = portfolios.map((item) =>
      item.id === selectedItem.id ? { ...item, ...payload } : item
    );
    updatePortfoliosAndPersist(updated);
    setShowEditModal(false);
    showToast(`Portofolio "${formData.title}" berhasil diperbarui!`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await fetch(`/api/portfolios?id=${selectedItem.id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Gagal delete portofolio ke API:", err);
    }

    const updated = portfolios.filter((p) => p.id !== selectedItem.id);
    updatePortfoliosAndPersist(updated);
    setShowDeleteModal(false);
    showToast(`Portofolio "${selectedItem.title}" berhasil dihapus dari Database.`);
  };

  const filteredPortfolios = portfolios.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(search.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory =
      categoryFilter === "Semua" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

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
        {/* UNIFIED ADMIN HEADER */}
        <AdminHeader
          title="Manajemen Portofolio Proyek"
          breadcrumb="ADMIN PANEL / DOKUMENTASI PROYEK"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT */}
        <div className="admin-content">
          {/* STATS SUMMARY */}
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <FiImage size={20} />
                </div>
                <span className="stat-change">Total</span>
              </div>
              <div className="stat-value">{portfolios.length}</div>
              <div className="stat-title">Total Proyek Selesai</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                  <FiMapPin size={20} />
                </div>
                <span className="stat-change">Masjid</span>
              </div>
              <div className="stat-value">
                {portfolios.filter((p) => p.category === "Masjid").length}
              </div>
              <div className="stat-title">Proyek Rumah Ibadah</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#faf5ff", color: "#9333ea" }}>
                  <FiMaximize size={20} />
                </div>
                <span className="stat-change">Komersil</span>
              </div>
              <div className="stat-value">
                {portfolios.filter((p) => p.category === "Hotel" || p.category === "Kantor").length}
              </div>
              <div className="stat-title">Hotel & Kantor</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                  <FiCheckCircle size={20} />
                </div>
                <span className="stat-change">Garansi</span>
              </div>
              <div className="stat-value">100%</div>
              <div className="stat-title">Tingkat Kepuasan Klien</div>
            </div>
          </div>

          {/* FILTER & TOOLBAR */}
          <div className="admin-user-filter-bar">
            <div className="admin-filter-group">
              <div className="admin-search-input-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari judul, lokasi, atau deskripsi proyek..."
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
                <option value="Masjid">Masjid</option>
                <option value="Hotel">Hotel</option>
                <option value="Kantor">Kantor</option>
                <option value="Rumah">Rumah</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => fetchPortfoliosFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan portofolio dengan database PostgreSQL melalui Prisma"
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
                <span>Tambah Portofolio</span>
              </button>
            </div>
          </div>

          {/* PORTFOLIO CARDS GRID */}
          <div className="admin-cards-grid">
            {filteredPortfolios.map((item) => {
              const isVideo = isVideoMedia(item.image, item.mediaType);
              const gallery = getPortfolioGalleryImages(item);

              return (
                <div className="admin-port-card" key={item.id}>
                  <div className="admin-port-image">
                    {isVideo ? (
                      <div style={{ position: "relative", width: "100%", height: "100%", background: "#000" }}>
                        <video
                          src={item.image}
                          muted
                          playsInline
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span className="admin-port-video-badge">
                          <FiVideo size={12} /> Video Proyek
                        </span>
                      </div>
                    ) : (
                      <img src={item.image || gallery[0]} alt={item.title} />
                    )}

                    {/* TOP BADGES */}
                    <span className="admin-port-badge">{item.category}</span>
                    {gallery.length > 1 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(0,0,0,0.75)",
                          backdropFilter: "blur(4px)",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiImage size={12} /> {gallery.length} Foto
                      </span>
                    )}
                  </div>

                  <div className="admin-port-body">
                    <h3 className="admin-port-title">{item.title}</h3>

                    {/* 4 SPECS MATCHING USER PAGE */}
                    <div className="admin-port-meta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginBottom: "12px" }}>
                      <span>
                        <FiMapPin size={13} color="#2563eb" /> {item.location || "Sidoarjo"}
                      </span>
                      <span>
                        <FiMaximize size={13} color="#16a34a" /> {item.area || "450 m²"}
                      </span>
                      <span>
                        <FiClock size={13} color="#d97706" /> {item.duration || "7 Hari"}
                      </span>
                      <span>
                        <FiCalendar size={13} color="#9333ea" /> {item.date || "2026"}
                      </span>
                    </div>

                    <p className="admin-port-desc" style={{ WebkitLineClamp: 2 }}>{item.description}</p>

                    {/* ACTION BUTTONS */}
                    <div className="admin-article-card-actions" style={{ gridTemplateColumns: "1.2fr 1fr 1fr" }}>
                      <Link
                        href={`/portfolio/${item.id}`}
                        target="_blank"
                        className="admin-article-action-btn view"
                        title="Lihat halaman detail proyek di web publik"
                      >
                        <FiExternalLink size={13} />
                        <span>Lihat Detail</span>
                      </Link>

                      <button
                        type="button"
                        className="admin-article-action-btn edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Portofolio & Galeri Foto"
                      >
                        <FiEdit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="admin-article-action-btn delete"
                        onClick={() => handleOpenDelete(item)}
                        title="Hapus Portofolio"
                      >
                        <FiTrash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPortfolios.length === 0 && (
            <div className="admin-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
              <FiImage size={36} color="#94a3b8" style={{ marginBottom: "10px" }} />
              <h3 style={{ margin: "0 0 6px" }}>Tidak ada portofolio ditemukan</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Coba ganti filter kategori atau kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </main>

      {/* =================================================
          MODAL TAMBAH PORTOFOLIO (MATCHING USER DETAIL)
      ================================================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box admin-blog-modal-box" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Tambah Portofolio Proyek Baru</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Lengkap dengan 4 Spesifikasi & Slider Multi-Foto Dokumentasi
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
                {/* 1. INFORMASI UTAMA PROYEK */}
                <div className="admin-form-group">
                  <label>Judul Proyek <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Pemasangan Karpet Masjid Al-Ikhlas"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* ROW 1: KATEGORI & LUAS AREA */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kategori Proyek</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Masjid">Masjid & Musholla</option>
                      <option value="Hotel">Hotel & Ballroom</option>
                      <option value="Kantor">Kantor & Komersial</option>
                      <option value="Rumah">Rumah & Hunian</option>
                      <option value="Custom">Karpet Custom</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Luas Area / Spesifikasi <span className="required">*</span></label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 450 m²"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                {/* ROW 2: LOKASI & DURASI PENGERJAAN */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Lokasi Pengerjaan <span className="required">*</span></label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Sidoarjo, Jawa Timur"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Durasi Pengerjaan</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 7 Hari / 3-5 Hari"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>

                {/* ROW 3: WAKTU SELESAI & TIPE MEDIA */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Waktu Selesai / Tanggal Proyek</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Januari 2026"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tipe Media Utama</label>
                    <select
                      className="admin-select"
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    >
                      <option value="image">Foto (Gambar Galeri)</option>
                      <option value="video">Video Dokumentasi</option>
                    </select>
                  </div>
                </div>

                {/* DESKRIPSI PENGERJAAN */}
                <div className="admin-form-group">
                  <label>Deskripsi Pengerjaan Proyek</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder="Contoh: Instalasi karpet masjid tebal 14mm custom motif shaf hijau zamrud dengan list kiblat emas..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* 2. FOTO UTAMA & SLIDER MULTI-FOTO DOKUMENTASI */}
                <div className="admin-form-group">
                  <label>Foto Utama / Cover Proyek <span className="required">*</span></label>
                  <div className="admin-image-upload-row">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Masukkan URL Foto Utama (https://...)"
                      value={formData.image}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          image: val,
                          mediaType: isVideoMedia(val) ? "video" : "image",
                        });
                      }}
                    />
                    <label className="admin-upload-btn" title="Unggah foto cover dari perangkat">
                      <FiUpload size={14} />
                      <span>Pilih File</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: "none" }}
                        onChange={handleMediaUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* GALERI MULTI-FOTO MANAGER (SLIDER) */}
                <div className="portfolio-admin-gallery-box">
                  <div className="portfolio-admin-gallery-header">
                    <div className="portfolio-admin-gallery-title">
                      <FiLayers size={16} />
                      <span>Galeri Slider Dokumentasi ({formData.images.length} Foto)</span>
                    </div>

                    <label
                      className="admin-btn-secondary"
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiUpload size={13} />
                      <span>+ Unggah Multi-Foto</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        style={{ display: "none" }}
                        onChange={handleGalleryUpload}
                      />
                    </label>
                  </div>

                  {/* INPUT URL FOTO TAMBAHAN */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: "12.5px", padding: "7px 10px" }}
                      placeholder="Atau tempel URL foto tambahan (https://...)"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddGalleryUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="admin-btn-primary"
                      style={{ padding: "0 14px", fontSize: "12px", whiteSpace: "nowrap" }}
                      onClick={handleAddGalleryUrl}
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* THUMBNAIL PREVIEW GRID */}
                  {formData.images.length > 0 ? (
                    <div className="portfolio-admin-thumbs-grid">
                      {formData.images.map((imgUrl, idx) => {
                        const isCover = imgUrl === formData.image;
                        const isVid = isVideoMedia(imgUrl);

                        return (
                          <div
                            key={idx}
                            className={`portfolio-admin-thumb-card ${isCover ? "is-cover" : ""}`}
                          >
                            {isVid ? (
                              <video src={imgUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <img src={imgUrl} alt={`Thumb ${idx + 1}`} />
                            )}

                            {isCover && (
                              <span className="cover-badge">
                                <FiStar size={10} /> Cover
                              </span>
                            )}

                            <span className="index-badge">#{idx + 1}</span>

                            <div className="thumb-actions">
                              {!isCover && (
                                <button
                                  type="button"
                                  className="thumb-action-btn star"
                                  title="Jadikan Foto Utama (Cover)"
                                  onClick={() => handleSetCoverImage(imgUrl)}
                                >
                                  <FiStar size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="thumb-action-btn"
                                title="Hapus foto dari galeri"
                                onClick={() => handleRemoveGalleryImage(idx)}
                              >
                                <FiTrash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                      Belum ada foto galeri tambahan. Foto utama akan digunakan secara otomatis.
                    </p>
                  )}
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
                  Simpan Portofolio & Aktifkan Galeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL EDIT PORTOFOLIO (MATCHING USER DETAIL)
      ================================================= */}
      {showEditModal && selectedItem && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-box admin-blog-modal-box" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Edit Portofolio Proyek</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Sesuaikan Spesifikasi & Galeri Slider Multi-Foto
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
                {/* 1. INFORMASI UTAMA PROYEK */}
                <div className="admin-form-group">
                  <label>Judul Proyek <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* ROW 1: KATEGORI & LUAS AREA */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kategori Proyek</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Masjid">Masjid & Musholla</option>
                      <option value="Hotel">Hotel & Ballroom</option>
                      <option value="Kantor">Kantor & Komersial</option>
                      <option value="Rumah">Rumah & Hunian</option>
                      <option value="Custom">Karpet Custom</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Luas Area / Spesifikasi <span className="required">*</span></label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                {/* ROW 2: LOKASI & DURASI PENGERJAAN */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Lokasi Pengerjaan <span className="required">*</span></label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Durasi Pengerjaan</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 7 Hari"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>

                {/* ROW 3: WAKTU SELESAI & TIPE MEDIA */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Waktu Selesai / Tanggal Proyek</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tipe Media Utama</label>
                    <select
                      className="admin-select"
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    >
                      <option value="image">Foto (Gambar Galeri)</option>
                      <option value="video">Video Dokumentasi</option>
                    </select>
                  </div>
                </div>

                {/* DESKRIPSI PENGERJAAN */}
                <div className="admin-form-group">
                  <label>Deskripsi Pengerjaan Proyek</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* 2. FOTO UTAMA & SLIDER MULTI-FOTO DOKUMENTASI */}
                <div className="admin-form-group">
                  <label>Foto Utama / Cover Proyek <span className="required">*</span></label>
                  <div className="admin-image-upload-row">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Masukkan URL Foto Utama (https://...)"
                      value={formData.image}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          image: val,
                          mediaType: isVideoMedia(val) ? "video" : "image",
                        });
                      }}
                    />
                    <label className="admin-upload-btn" title="Unggah foto cover dari perangkat">
                      <FiUpload size={14} />
                      <span>Ganti File</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: "none" }}
                        onChange={handleMediaUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* GALERI MULTI-FOTO MANAGER (SLIDER) */}
                <div className="portfolio-admin-gallery-box">
                  <div className="portfolio-admin-gallery-header">
                    <div className="portfolio-admin-gallery-title">
                      <FiLayers size={16} />
                      <span>Galeri Slider Dokumentasi ({formData.images.length} Foto)</span>
                    </div>

                    <label
                      className="admin-btn-secondary"
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiUpload size={13} />
                      <span>+ Unggah Multi-Foto</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        style={{ display: "none" }}
                        onChange={handleGalleryUpload}
                      />
                    </label>
                  </div>

                  {/* INPUT URL FOTO TAMBAHAN */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: "12.5px", padding: "7px 10px" }}
                      placeholder="Atau tempel URL foto tambahan (https://...)"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddGalleryUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="admin-btn-primary"
                      style={{ padding: "0 14px", fontSize: "12px", whiteSpace: "nowrap" }}
                      onClick={handleAddGalleryUrl}
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* THUMBNAIL PREVIEW GRID */}
                  {formData.images.length > 0 ? (
                    <div className="portfolio-admin-thumbs-grid">
                      {formData.images.map((imgUrl, idx) => {
                        const isCover = imgUrl === formData.image;
                        const isVid = isVideoMedia(imgUrl);

                        return (
                          <div
                            key={idx}
                            className={`portfolio-admin-thumb-card ${isCover ? "is-cover" : ""}`}
                          >
                            {isVid ? (
                              <video src={imgUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <img src={imgUrl} alt={`Thumb ${idx + 1}`} />
                            )}

                            {isCover && (
                              <span className="cover-badge">
                                <FiStar size={10} /> Cover
                              </span>
                            )}

                            <span className="index-badge">#{idx + 1}</span>

                            <div className="thumb-actions">
                              {!isCover && (
                                <button
                                  type="button"
                                  className="thumb-action-btn star"
                                  title="Jadikan Foto Utama (Cover)"
                                  onClick={() => handleSetCoverImage(imgUrl)}
                                >
                                  <FiStar size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="thumb-action-btn"
                                title="Hapus foto dari galeri"
                                onClick={() => handleRemoveGalleryImage(idx)}
                              >
                                <FiTrash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                      Belum ada foto galeri tambahan. Foto utama akan digunakan secara otomatis.
                    </p>
                  )}
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
                  Simpan Perubahan Portofolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL HAPUS KONFIRMASI
      ================================================= */}
      {showDeleteModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header danger-header">
              <h3 style={{ color: "#dc2626" }}>Hapus Portofolio</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus dokumentasi proyek <strong>"{selectedItem?.title}"</strong>? Tindakan ini akan menghapus data proyek dari database.
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
                Ya, Hapus Portofolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="admin-toast-success">
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}