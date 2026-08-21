"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredPortfolios,
  savePortfolios,
  subscribePortfolios,
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
} from "react-icons/fi";

const initialPortfolios = [
  {
    id: 1,
    title: "Pemasangan Karpet Masjid Al-Ikhlas",
    category: "Masjid",
    location: "Sidoarjo, Jawa Timur",
    area: "450 m²",
    date: "Januari 2026",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
    mediaType: "image",
    description: "Instalasi karpet masjid tebal 14mm custom motif shaf hijau zamrud dengan list kiblat emas.",
  },
  {
    id: 2,
    title: "Grand Ballroom Karpet Hotel Majapahit",
    category: "Hotel",
    location: "Surabaya, Jawa Timur",
    area: "850 m²",
    date: "Desember 2025",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
    mediaType: "image",
    description: "Karpet axminster motif klasik royal blue peredam kebisingan untuk area ballroom utama.",
  },
  {
    id: 3,
    title: "Karpet Tile Kantor Telkom Regional",
    category: "Kantor",
    location: "Surabaya, Jawa Timur",
    area: "620 m²",
    date: "Februari 2026",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    mediaType: "image",
    description: "Pemasangan karpet tile 50x50 cm warna abu-abu modern untuk ruang open space dan meeting.",
  },
  {
    id: 4,
    title: "Karpet Rumah Tinggal Mewah Minimalis",
    category: "Rumah",
    location: "Puri Indah, Sidoarjo",
    area: "120 m²",
    date: "Maret 2026",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    mediaType: "image",
    description: "Karpet handtufted super soft wool untuk ruang tamu utama dan master bedroom.",
  },
];

const isVideoMedia = (url = "", mediaType = "") => {
  if (mediaType === "video") return true;
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("data:video") ||
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov") ||
    url.includes("video/mp4")
  );
};

export default function PortfolioPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [portfolios, setPortfolios] = useState(initialPortfolios);
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

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "Masjid",
    location: "",
    area: "",
    date: "Maret 2026",
    image: "",
    mediaType: "image",
    mediaFileName: "",
    description: "",
  });

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Handle Photo / Video File Upload
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
      setFormData((prev) => ({
        ...prev,
        image: dataUrl,
        mediaType: isVideo ? "video" : "image",
        mediaFileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: "Masjid",
      location: "",
      area: "",
      date: "Maret 2026",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
      mediaType: "image",
      mediaFileName: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      category: item.category || "Masjid",
      location: item.location || "",
      area: item.area || "",
      date: item.date || "",
      image: item.image || "",
      mediaType: item.mediaType || (isVideoMedia(item.image) ? "video" : "image"),
      mediaFileName: "",
      description: item.description || "",
    });
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

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location || "Indonesia",
      area: formData.area || "100 m²",
      date: formData.date || "2026",
      image: formData.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
      mediaType: formData.mediaType || (isVideoMedia(formData.image) ? "video" : "image"),
      description: formData.description || "Dokumentasi pengerjaan karpet Rumah Indah Carpet.",
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

    const payload = {
      id: selectedItem.id,
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location,
      area: formData.area,
      date: formData.date,
      image: formData.image,
      mediaType: formData.mediaType || (isVideoMedia(formData.image) ? "video" : "image"),
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
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
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
          breadcrumb="ADMIN PANEL / DOKUMENTASI"
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
                <FiImage className={isSyncing ? "spin-icon" : ""} />
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
                      <img src={item.image} alt={item.title} />
                    )}
                    <span className="admin-port-badge">{item.category}</span>
                  </div>

                  <div className="admin-port-body">
                    <h3 className="admin-port-title">{item.title}</h3>

                    <div className="admin-port-meta">
                      <span>
                        <FiMapPin size={13} color="#2563eb" /> {item.location}
                      </span>
                      <span>
                        <FiMaximize size={13} color="#16a34a" /> {item.area}
                      </span>
                    </div>

                    <p className="admin-port-desc">{item.description}</p>

                    <div className="admin-card-actions">
                      <span style={{ marginRight: "auto", fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FiCalendar size={12} /> {item.date}
                      </span>
                      <button
                        type="button"
                        className="action-btn-pill edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Portofolio"
                      >
                        <FiEdit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="action-btn-pill delete"
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
          MODAL TAMBAH PORTOFOLIO
      ================================================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Tambah Portofolio Proyek</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveNew}>
              <div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                <div className="admin-form-group">
                  <label>Judul Proyek <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Pemasangan Karpet Masjid Raya Al-Hidayah"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

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
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Luas Area / Spesifikasi</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 350 m²"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Lokasi Proyek</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Surabaya, Jawa Timur"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Waktu Pengerjaan</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Maret 2026"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                {/* UPLOAD FOTO & VIDEO SECTION */}
                <div className="admin-form-group">
                  <label>
                    Foto atau Video Dokumentasi Proyek <span className="required">*</span>
                  </label>

                  <div className="portfolio-media-upload-wrapper">
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Masukkan URL Foto / Video (https://...)"
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
                      <label className="admin-upload-btn" title="Unggah file foto atau video dari perangkat">
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

                    {/* MEDIA PREVIEW */}
                    {formData.image ? (
                      <div className="portfolio-preview-box">
                        {isVideoMedia(formData.image, formData.mediaType) ? (
                          <div>
                            <video
                              src={formData.image}
                              controls
                              muted
                              style={{ width: "100%", maxHeight: "200px", borderRadius: "8px", background: "#000", display: "block" }}
                            />
                            <div className="preview-media-info">
                              <span className="media-badge video">
                                <FiVideo size={12} /> Video Dokumentasi Proyek
                              </span>
                              <button
                                type="button"
                                className="preview-remove-btn"
                                onClick={() => setFormData({ ...formData, image: "", mediaType: "image", mediaFileName: "" })}
                                title="Hapus media ini"
                              >
                                <FiTrash2 size={13} /> Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ width: "100%", height: "180px", overflow: "hidden", borderRadius: "8px", background: "#0f172a" }}>
                              <img
                                src={formData.image}
                                alt="Pratinjau Foto Portofolio"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />
                            </div>
                            <div className="preview-media-info">
                              <span className="media-badge image">
                                <FiImage size={12} /> Foto Dokumentasi Proyek
                              </span>
                              <button
                                type="button"
                                className="preview-remove-btn"
                                onClick={() => setFormData({ ...formData, image: "", mediaType: "image", mediaFileName: "" })}
                                title="Hapus media ini"
                              >
                                <FiTrash2 size={13} /> Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="portfolio-empty-upload-hint">
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <FiImage /> Foto: JPG, PNG, WEBP
                          </span>
                          <span>•</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <FiVideo /> Video: MP4, WebM (Maks. 50MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Deskripsi Pengerjaan</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder="Jelaskan detail material karpet, teknik pemasangan, dan kepuasan klien..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
                  Simpan Portofolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL EDIT PORTOFOLIO
      ================================================= */}
      {showEditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Portofolio Proyek</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
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
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Luas Area / Spesifikasi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Lokasi Proyek</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Waktu Pengerjaan</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                {/* UPLOAD FOTO & VIDEO SECTION */}
                <div className="admin-form-group">
                  <label>
                    Foto atau Video Dokumentasi Proyek <span className="required">*</span>
                  </label>

                  <div className="portfolio-media-upload-wrapper">
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Masukkan URL Foto / Video (https://...)"
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
                      <label className="admin-upload-btn" title="Unggah file foto atau video dari perangkat">
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

                    {/* MEDIA PREVIEW */}
                    {formData.image ? (
                      <div className="portfolio-preview-box">
                        {isVideoMedia(formData.image, formData.mediaType) ? (
                          <div>
                            <video
                              src={formData.image}
                              controls
                              muted
                              style={{ width: "100%", maxHeight: "200px", borderRadius: "8px", background: "#000", display: "block" }}
                            />
                            <div className="preview-media-info">
                              <span className="media-badge video">
                                <FiVideo size={12} /> Video Dokumentasi Proyek
                              </span>
                              <button
                                type="button"
                                className="preview-remove-btn"
                                onClick={() => setFormData({ ...formData, image: "", mediaType: "image", mediaFileName: "" })}
                                title="Hapus media ini"
                              >
                                <FiTrash2 size={13} /> Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ width: "100%", height: "180px", overflow: "hidden", borderRadius: "8px", background: "#0f172a" }}>
                              <img
                                src={formData.image}
                                alt="Pratinjau Foto Portofolio"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />
                            </div>
                            <div className="preview-media-info">
                              <span className="media-badge image">
                                <FiImage size={12} /> Foto Dokumentasi Proyek
                              </span>
                              <button
                                type="button"
                                className="preview-remove-btn"
                                onClick={() => setFormData({ ...formData, image: "", mediaType: "image", mediaFileName: "" })}
                                title="Hapus media ini"
                              >
                                <FiTrash2 size={13} /> Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="portfolio-empty-upload-hint">
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <FiImage /> Foto: JPG, PNG, WEBP
                          </span>
                          <span>•</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <FiVideo /> Video: MP4, WebM (Maks. 50MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Deskripsi Pengerjaan</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
                  Simpan Perubahan
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
              <h3>Hapus Portofolio</h3>
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
                Apakah Anda yakin ingin menghapus dokumentasi proyek <strong>"{selectedItem?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
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