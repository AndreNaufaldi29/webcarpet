"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredSlides,
  saveSlides,
  subscribeSlides,
  syncSlidesFromDatabase,
  getStoredCarouselSettings,
  saveCarouselSettings,
  subscribeCarouselSettings,
  DEFAULT_SLIDES,
  DEFAULT_CAROUSEL_SETTINGS,
} from "@/lib/carouselStore";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiX,
  FiImage,
  FiSliders,
  FiPlay,
  FiPause,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiRefreshCw,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
  FiMonitor,
  FiSmartphone,
  FiLayers,
  FiUpload,
} from "react-icons/fi";

export default function CarouselAdminPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Slides & Settings State
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [carouselSettings, setCarouselSettings] = useState(DEFAULT_CAROUSEL_SETTINGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Live Preview State
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // "desktop" | "mobile"

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

  // Form slide state
  const [formData, setFormData] = useState({
    title: "",
    badge: "KARPET MASJID & IBADAH",
    desc: "",
    image: "",
    btnPrimaryText: "Jelajahi Katalog",
    btnPrimaryLink: "/catalog",
    btnSecondaryText: "Lihat Portofolio",
    btnSecondaryLink: "/portofolio",
    order: 1,
    status: "Aktif",
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Handle Single Image File Upload for Banner
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file maksimal adalah 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          image: dataUrl,
        }));
        showToast("Foto banner berhasil dipilih!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 1. Fetch & Subscribe to Carousel Data from Database
  const fetchSlidesFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/carousel?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSlides(json.data);
          saveSlides(json.data);
          if (json.settings) {
            setCarouselSettings(json.settings);
            saveCarouselSettings(json.settings);
          }
          if (showNotification) {
            showToast("Data slide carousel berhasil disinkronkan dengan Database!");
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database carousel:", err);
      if (showNotification) {
        showToast("Koneksi API database gagal, menggunakan data lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setSlides(getStoredSlides());
    setCarouselSettings(getStoredCarouselSettings());
    fetchSlidesFromDB(false);

    const unsubSlides = subscribeSlides((updated) => {
      setSlides(updated);
    });

    const unsubSettings = subscribeCarouselSettings((updated) => {
      if (updated) setCarouselSettings(updated);
    });

    return () => {
      unsubSlides();
      unsubSettings();
    };
  }, []);

  // Form Change Handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal Open Handlers
  const handleOpenAdd = () => {
    setFormData({
      title: "",
      badge: "KARPET MASJID & IBADAH",
      desc: "",
      image: "",
      btnPrimaryText: "Jelajahi Katalog",
      btnPrimaryLink: "/catalog",
      btnSecondaryText: "Lihat Portofolio",
      btnSecondaryLink: "/portofolio",
      order: slides.length + 1,
      status: "Aktif",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (slide) => {
    setSelectedSlide(slide);
    setFormData({
      title: slide.title || "",
      badge: slide.badge || "KARPET PREMIUM",
      desc: slide.desc || "",
      image: slide.image || "",
      btnPrimaryText: slide.btnPrimaryText || "Jelajahi Katalog",
      btnPrimaryLink: slide.btnPrimaryLink || "/catalog",
      btnSecondaryText: slide.btnSecondaryText || "Lihat Portofolio",
      btnSecondaryLink: slide.btnSecondaryLink || "/portofolio",
      order: slide.order || 1,
      status: slide.status || "Aktif",
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (slide) => {
    setSelectedSlide(slide);
    setShowDeleteModal(true);
  };

  // Save New Slide
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.desc.trim() || !formData.image.trim()) {
      showToast("Judul, deskripsi, dan foto banner wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      badge: formData.badge.trim() || "KARPET PREMIUM",
      desc: formData.desc.trim(),
      image: formData.image.trim(),
      btnPrimaryText: formData.btnPrimaryText.trim() || "Jelajahi Katalog",
      btnPrimaryLink: formData.btnPrimaryLink.trim() || "/catalog",
      btnSecondaryText: formData.btnSecondaryText.trim() || "Lihat Portofolio",
      btnSecondaryLink: formData.btnSecondaryLink.trim() || "/portofolio",
      order: Number(formData.order) || slides.length + 1,
      status: formData.status || "Aktif",
    };

    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        const updated = [...slides, result.data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setSlides(updated);
        saveSlides(updated);
        setShowAddModal(false);
        showToast(`Slide "${result.data.title}" berhasil disimpan ke Database!`);
        return;
      } else {
        showToast(result.error || "Gagal menyimpan slide ke database.");
      }
    } catch (err) {
      console.error("Gagal simpan slide ke API:", err);
      showToast("Terjadi kesalahan saat menyimpan slide.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Edit Slide
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedSlide || !formData.title.trim() || !formData.desc.trim()) return;

    if (!formData.image.trim()) {
      showToast("Foto banner wajib diunggah!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: selectedSlide.id,
      title: formData.title.trim(),
      badge: formData.badge.trim(),
      desc: formData.desc.trim(),
      image: formData.image.trim(),
      btnPrimaryText: formData.btnPrimaryText.trim(),
      btnPrimaryLink: formData.btnPrimaryLink.trim(),
      btnSecondaryText: formData.btnSecondaryText.trim(),
      btnSecondaryLink: formData.btnSecondaryLink.trim(),
      order: Number(formData.order),
      status: formData.status,
    };

    try {
      const res = await fetch("/api/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        const updated = slides
          .map((item) => (item.id === selectedSlide.id ? { ...item, ...result.data } : item))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setSlides(updated);
        saveSlides(updated);
        setShowEditModal(false);
        showToast(`Slide "${formData.title}" berhasil diperbarui di Database!`);
        return;
      } else {
        showToast(result.error || "Gagal memperbarui slide di database.");
      }
    } catch (err) {
      console.error("Gagal update slide ke API:", err);
      showToast("Terjadi kesalahan saat memperbarui slide.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Slide
  const handleConfirmDelete = async () => {
    if (!selectedSlide) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/carousel?id=${selectedSlide.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        console.warn("Delete slide API note:", result?.error);
      }
    } catch (err) {
      console.warn("Gagal delete slide ke API:", err);
    } finally {
      setIsDeleting(false);
    }

    const updated = slides.filter((s) => s.id !== selectedSlide.id);
    setSlides(updated);
    saveSlides(updated);
    setShowDeleteModal(false);
    showToast(`Slide "${selectedSlide.title}" berhasil dihapus.`);
    if (previewIndex >= updated.length) {
      setPreviewIndex(Math.max(0, updated.length - 1));
    }
  };

  // Toggle Slide Status (Aktif / Nonaktif)
  const handleToggleStatus = async (slide) => {
    const newStatus = slide.status === "Aktif" ? "Nonaktif" : "Aktif";
    const updated = slides.map((s) =>
      s.id === slide.id ? { ...s, status: newStatus } : s
    );
    setSlides(updated);
    saveSlides(updated);

    try {
      await fetch("/api/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id, status: newStatus }),
      });
    } catch (e) {
      console.warn("Toggle status error:", e);
    }

    showToast(`Status slide diubah menjadi "${newStatus}"`);
  };

  // Reorder Slide (Move Up / Move Down)
  const handleMoveSlide = async (idx, direction) => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[idx];
    newSlides[idx] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    const reordered = newSlides.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setSlides(reordered);
    saveSlides(reordered);

    try {
      await fetch("/api/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REORDER_SLIDES", slides: reordered }),
      });
    } catch (e) {
      console.warn("Reorder error:", e);
    }

    showToast("Urutan slide berhasil diperbarui!");
  };

  // Save Global Carousel Settings
  const handleSaveGlobalSettings = async () => {
    setIsSavingSettings(true);
    try {
      saveCarouselSettings(carouselSettings);
      await fetch("/api/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SETTINGS",
          autoplay: carouselSettings.autoplay,
          interval: Number(carouselSettings.interval),
        }),
      });
      showToast("Pengaturan global carousel berhasil disimpan!");
    } catch (err) {
      console.warn("Gagal simpan pengaturan global:", err);
      showToast("Pengaturan tersimpan di sesi lokal.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Reset to Defaults (Database + LocalStorage)
  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_DEFAULTS" }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSlides(json.data);
        saveSlides(json.data);
        if (json.settings) {
          setCarouselSettings(json.settings);
          saveCarouselSettings(json.settings);
        }
        setShowResetModal(false);
        showToast("Slide carousel berhasil di-reset ke standar bawaan!");
        return;
      }
    } catch (err) {
      console.warn("Gagal reset slide via API:", err);
    } finally {
      setIsResetting(false);
    }

    setSlides(DEFAULT_SLIDES);
    saveSlides(DEFAULT_SLIDES);
    setCarouselSettings(DEFAULT_CAROUSEL_SETTINGS);
    saveCarouselSettings(DEFAULT_CAROUSEL_SETTINGS);
    setShowResetModal(false);
    showToast("Slide carousel berhasil di-reset ke standar bawaan!");
  };

  // Filtered Slides
  const filteredSlides = slides.filter((slide) => {
    const matchStatus =
      statusFilter === "Semua" || slide.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (slide.title || "").toLowerCase().includes(q) ||
      (slide.badge || "").toLowerCase().includes(q) ||
      (slide.desc || "").toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  const activeSlides = slides.filter((s) => s.status === "Aktif");
  const currentPreviewSlide =
    activeSlides[previewIndex] ||
    activeSlides[0] ||
    slides[0] ||
    DEFAULT_SLIDES[0];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN CONTENT */}
      <main className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* HEADER */}
        <AdminHeader
          title="Pengaturan Carousel & Banner Hero"
          breadcrumb="ADMIN PANEL / CAROUSEL & SLIDER"
          setMobileOpen={setMobileOpen}
        />

        <div className="admin-content">
          {/* STATS SUMMARY */}
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>
                  <FiLayers size={18} />
                </div>
                <span className="stat-change">Total</span>
              </div>
              <div className="stat-value">{slides.length}</div>
              <div className="stat-title">Total Slide Banner</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                  <FiCheckCircle size={18} />
                </div>
                <span className="stat-change">Aktif</span>
              </div>
              <div className="stat-value">{activeSlides.length}</div>
              <div className="stat-title">Slide Tayang di Beranda</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>
                  <FiSliders size={18} />
                </div>
                <span className="stat-change">Status</span>
              </div>
              <div className="stat-value" style={{ fontSize: "20px" }}>
                {carouselSettings.autoplay ? "Aktif (Auto)" : "Manual"}
              </div>
              <div className="stat-title">Mode Putar Carousel</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "rgba(168, 85, 247, 0.12)", color: "#a855f7" }}>
                  <FiClock size={18} />
                </div>
                <span className="stat-change">Interval</span>
              </div>
              <div className="stat-value">
                {((Number(carouselSettings.interval) || 6500) / 1000).toFixed(1)}s
              </div>
              <div className="stat-title">Durasi Pergantian Slide</div>
            </div>
          </div>

          {/* LIVE HERO PREVIEW SECTION */}
          <div className="admin-carousel-preview-card">
            <div className="admin-carousel-preview-header">
              <div className="admin-carousel-preview-title-wrap">
                <FiEye size={20} className="admin-carousel-preview-title-icon" />
                <h3 className="admin-carousel-preview-title">
                  Live Preview Banner Hero (Tampilan Pengunjung)
                </h3>
              </div>

              <div className="admin-carousel-preview-actions">
                <div className="admin-carousel-device-group">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`admin-carousel-device-btn ${previewDevice === "desktop" ? "active" : ""}`}
                  >
                    <FiMonitor size={14} />
                    <span>Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`admin-carousel-device-btn ${previewDevice === "mobile" ? "active" : ""}`}
                  >
                    <FiSmartphone size={14} />
                    <span>Mobile</span>
                  </button>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  className="admin-carousel-ext-link"
                >
                  <span>Buka Website Asli</span>
                  <FiExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* PREVIEW FRAME */}
            <div className="admin-carousel-preview-outer-wrap">
              <div
                className={`admin-carousel-preview-frame ${
                  previewDevice === "mobile" ? "preview-mobile-device" : "preview-desktop-device"
                }`}
              >
                {/* Mobile Smartphone Notch / Speaker */}
                {previewDevice === "mobile" && (
                  <div className="admin-carousel-phone-notch" />
                )}

                {/* Background image */}
                <img
                  src={
                    currentPreviewSlide.image ||
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600"
                  }
                  alt={currentPreviewSlide.title}
                  className="admin-carousel-preview-bg"
                />

                {/* Gradient overlay */}
                <div
                  className={`admin-carousel-preview-overlay ${
                    previewDevice === "mobile" ? "is-mobile-overlay" : "is-desktop-overlay"
                  }`}
                />

                {/* Slide Content */}
                <div
                  className={`admin-carousel-preview-content ${
                    previewDevice === "mobile" ? "is-mobile-view" : "is-desktop-view"
                  }`}
                >
                  <div className="admin-carousel-preview-badge-wrap">
                    <span className="admin-carousel-preview-badge">
                      {currentPreviewSlide.badge || "KARPET PREMIUM"}
                    </span>
                  </div>

                  <h2 className="admin-carousel-preview-headline">
                    {currentPreviewSlide.title}
                  </h2>

                  <p className="admin-carousel-preview-desc">
                    {currentPreviewSlide.desc}
                  </p>

                  <div className="admin-carousel-preview-btn-group">
                    {currentPreviewSlide.btnPrimaryText && (
                      <span className="admin-carousel-preview-btn-primary">
                        <span>{currentPreviewSlide.btnPrimaryText}</span>
                        <FiArrowRight size={13} />
                      </span>
                    )}

                    {currentPreviewSlide.btnSecondaryText && (
                      <span className="admin-carousel-preview-btn-secondary">
                        <span>{currentPreviewSlide.btnSecondaryText}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Prev / Next controls in preview */}
                {activeSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIndex((p) =>
                          p === 0 ? activeSlides.length - 1 : p - 1
                        )
                      }
                      className="admin-carousel-preview-nav-btn prev"
                      aria-label="Slide sebelumnya"
                    >
                      <FiChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIndex((p) =>
                          p === activeSlides.length - 1 ? 0 : p + 1
                        )
                      }
                      className="admin-carousel-preview-nav-btn next"
                      aria-label="Slide berikutnya"
                    >
                      <FiChevronRight size={18} />
                    </button>

                    {/* Indicator dots */}
                    <div className="admin-carousel-preview-dots">
                      {activeSlides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewIndex(i)}
                          className={`admin-carousel-preview-dot ${previewIndex === i ? "active" : ""}`}
                          aria-label={`Lihat slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* GLOBAL SETTINGS CARD */}
          <div className="admin-carousel-config-card">
            <div className="admin-carousel-config-header">
              <div className="admin-carousel-config-icon-box">
                <FiSliders size={20} />
              </div>
              <div className="admin-carousel-config-text">
                <strong className="admin-carousel-config-title">
                  Konfigurasi Pemutaran Carousel
                </strong>
                <span className="admin-carousel-config-desc">
                  Atur apakah banner berganti otomatis dan tentukan jeda durasi waktu per slide.
                </span>
              </div>
            </div>

            <div className="admin-carousel-config-divider" />

            <div className="admin-carousel-config-controls">
              {/* Autoplay toggle */}
              <label className="admin-carousel-label">
                <input
                  type="checkbox"
                  checked={carouselSettings.autoplay}
                  onChange={(e) =>
                    setCarouselSettings((prev) => ({
                      ...prev,
                      autoplay: e.target.checked,
                    }))
                  }
                  className="admin-carousel-checkbox"
                />
                <span>Autoplay Aktif</span>
              </label>

              {/* Interval selector */}
              <div className="admin-carousel-interval-box">
                <span className="admin-carousel-interval-label">
                  Durasi:
                </span>
                <select
                  className="admin-carousel-select"
                  value={carouselSettings.interval}
                  onChange={(e) =>
                    setCarouselSettings((prev) => ({
                      ...prev,
                      interval: Number(e.target.value),
                    }))
                  }
                >
                  <option value={3000}>3.0 Detik (Cepat)</option>
                  <option value={5000}>5.0 Detik (Standar)</option>
                  <option value={6500}>6.5 Detik (Optimal)</option>
                  <option value={8000}>8.0 Detik (Santai)</option>
                  <option value={10000}>10.0 Detik (Lambat)</option>
                </select>
              </div>

              <button
                type="button"
                className="admin-btn-primary admin-carousel-config-save-btn"
                onClick={handleSaveGlobalSettings}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </div>

          {/* FILTER & ACTION TOOLBAR */}
          <div className="admin-user-filter-bar admin-carousel-filter-bar">
            <div className="admin-filter-group">
              <div className="admin-search-input-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari judul slide, badge, atau deskripsi..."
                  className="admin-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="admin-select-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Status Aktif Saja</option>
                <option value="Nonaktif">Status Nonaktif Saja</option>
              </select>
            </div>

            <div className="admin-carousel-toolbar-actions">
              <button
                type="button"
                className="admin-carousel-sync-btn"
                onClick={() => fetchSlidesFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan dengan Database PostgreSQL"
              >
                <FiRefreshCw className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron DB"}</span>
              </button>

              <button
                type="button"
                className="admin-carousel-reset-btn"
                onClick={() => setShowResetModal(true)}
                title="Kembalikan ke slide bawaan"
              >
                <span>Reset Bawaan</span>
              </button>

              <button
                type="button"
                className="admin-btn-primary admin-carousel-add-btn"
                onClick={handleOpenAdd}
              >
                <FiPlus size={18} />
                <span>Tambah Slide Baru</span>
              </button>
            </div>
          </div>

          {/* SLIDES LIST CARDS */}
          <div className="admin-carousel-slides-container">
            {filteredSlides.length > 0 ? (
              filteredSlides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className={`admin-carousel-slide-card ${slide.status === "Nonaktif" ? "is-inactive" : ""}`}
                >
                  {/* Mobile Header Bar (Order + Badges) */}
                  <div className="admin-carousel-card-header">
                    <div className="admin-carousel-order-controls">
                      <button
                        type="button"
                        className="admin-carousel-move-btn"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, "up")}
                        title="Geser urutan ke atas"
                      >
                        <FiArrowUp size={14} />
                      </button>

                      <span className="admin-carousel-order-badge">
                        #{idx + 1}
                      </span>

                      <button
                        type="button"
                        className="admin-carousel-move-btn"
                        disabled={idx === filteredSlides.length - 1}
                        onClick={() => handleMoveSlide(idx, "down")}
                        title="Geser urutan ke bawah"
                      >
                        <FiArrowDown size={14} />
                      </button>
                    </div>

                    <div className="admin-carousel-header-tags">
                      <span className="admin-carousel-badge-tag">
                        {slide.badge || "PRODUK"}
                      </span>
                      <span
                        className={`admin-carousel-status-pill ${
                          slide.status === "Aktif" ? "active" : "inactive"
                        }`}
                      >
                        {slide.status}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Order Controls */}
                  <div className="admin-carousel-desktop-order">
                    <button
                      type="button"
                      className="admin-carousel-move-btn"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, "up")}
                      title="Geser urutan ke atas"
                    >
                      <FiArrowUp size={14} />
                    </button>

                    <span className="admin-carousel-order-badge">
                      #{idx + 1}
                    </span>

                    <button
                      type="button"
                      className="admin-carousel-move-btn"
                      disabled={idx === filteredSlides.length - 1}
                      onClick={() => handleMoveSlide(idx, "down")}
                      title="Geser urutan ke bawah"
                    >
                      <FiArrowDown size={14} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="admin-carousel-card-thumb">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="admin-carousel-thumb-img"
                    />
                    <span className="admin-carousel-thumb-badge">
                      {slide.badge || "PRODUK"}
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="admin-carousel-card-body">
                    <div className="admin-carousel-desktop-tags">
                      <span className="admin-carousel-badge-tag">
                        {slide.badge}
                      </span>
                      <span
                        className={`admin-carousel-status-pill ${
                          slide.status === "Aktif" ? "active" : "inactive"
                        }`}
                      >
                        {slide.status}
                      </span>
                    </div>

                    <h4 className="admin-carousel-slide-title">
                      {slide.title}
                    </h4>

                    <p className="admin-carousel-slide-desc">
                      {slide.desc}
                    </p>

                    <div className="admin-carousel-slide-meta">
                      <div className="admin-carousel-meta-chip">
                        <span className="meta-label">Tombol 1:</span>
                        <span className="meta-text">{slide.btnPrimaryText || "-"}</span>
                        <code className="meta-link">{slide.btnPrimaryLink || "/catalog"}</code>
                      </div>
                      <div className="admin-carousel-meta-chip">
                        <span className="meta-label">Tombol 2:</span>
                        <span className="meta-text">{slide.btnSecondaryText || "-"}</span>
                        <code className="meta-link">{slide.btnSecondaryLink || "/portofolio"}</code>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="admin-carousel-card-actions">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(slide)}
                      title={slide.status === "Aktif" ? "Nonaktifkan Slide" : "Aktifkan Slide"}
                      className={`admin-carousel-action-btn ${
                        slide.status === "Aktif" ? "status-active" : "status-inactive"
                      }`}
                    >
                      {slide.status === "Aktif" ? (
                        <>
                          <FiPause size={13} />
                          <span>Nonaktifkan</span>
                        </>
                      ) : (
                        <>
                          <FiPlay size={13} />
                          <span>Aktifkan</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(slide)}
                      title="Edit Slide"
                      className="admin-carousel-action-btn edit"
                    >
                      <FiEdit2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(slide)}
                      title="Hapus Slide"
                      className="admin-carousel-action-btn delete"
                    >
                      <FiTrash2 size={14} />
                      <span className="mobile-only-action-label">Hapus</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-carousel-empty-state">
                <FiSliders size={40} color="#2A6151" style={{ marginBottom: "12px" }} />
                <h4 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>
                  Tidak ada slide banner yang cocok
                </h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "13px" }}>
                  Coba ganti filter pencarian atau tambahkan slide banner baru untuk beranda.
                </p>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleOpenAdd}
                >
                  <FiPlus size={16} />
                  <span>Tambah Slide Pertama</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: TAMBAH SLIDE BARU */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="admin-modal-box admin-carousel-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                Tambah Slide Carousel Baru
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNew}>
              <div className="admin-modal-body">
                {/* Judul Headline */}
                <div className="admin-form-group">
                  <label>Judul Headline Utama *</label>
                  <input
                    type="text"
                    className="admin-input"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Contoh: Lembut, Nyaman & Elegan Untuk Rumah Ibadah Anda"
                    required
                  />
                </div>

                {/* Badge Tag & Status */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Badge / Tag Kategori</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="badge"
                      value={formData.badge}
                      onChange={handleFormChange}
                      placeholder="Contoh: KARPET MASJID & IBADAH"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Status Tayang</label>
                    <select
                      className="admin-select"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="Aktif">Aktif (Ditampilkan)</option>
                      <option value="Nonaktif">Nonaktif (Disembunyikan)</option>
                    </select>
                  </div>
                </div>

                {/* Subtitle / Deskripsi */}
                <div className="admin-form-group">
                  <label>Deskripsi Subtitle *</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    name="desc"
                    value={formData.desc}
                    onChange={handleFormChange}
                    placeholder="Tuliskan penjelasan singkat mengenai promo atau keunggulan karpet pada slide ini..."
                    required
                  />
                </div>

                {/* Upload Foto/Gambar Banner Hero */}
                <div className="admin-form-group">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Foto / Gambar Banner Hero *</span>
                    {formData.image && (
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700 }}>
                        ✓ Foto Terpilih
                      </span>
                    )}
                  </label>

                  {formData.image ? (
                    <div className="admin-carousel-modal-preview-box">
                      <img
                        src={formData.image}
                        alt="Preview Banner Hero"
                        className="admin-carousel-modal-preview-img"
                      />
                      <div className="admin-carousel-modal-preview-overlay">
                        <span className="admin-carousel-modal-preview-title">
                          {formData.title || "Preview Banner Hero"}
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <label
                            className="admin-btn-secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(10, 59, 37, 0.85)",
                              color: "#FCF7F0",
                              border: "1px solid #D8C2A4",
                            }}
                          >
                            <FiUpload size={13} />
                            <span>Ganti Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleImageUpload}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              background: "rgba(239, 68, 68, 0.2)",
                              color: "#fca5a5",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                            }}
                            title="Hapus foto ini"
                          >
                            <FiTrash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="admin-carousel-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <div className="admin-carousel-dropzone-icon">
                        <FiUpload size={22} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
                          Klik untuk Unggah Foto Banner Hero
                        </strong>
                        <span style={{ fontSize: "12px", color: "#5A6D63" }} className="admin-preset-hint">
                          Format JPG, PNG, WEBP (Maksimal 15MB). Rekomendasi rasio lanskap 16:7 / 16:9
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Tombol Utama */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Label Tombol Utama</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnPrimaryText"
                      value={formData.btnPrimaryText}
                      onChange={handleFormChange}
                      placeholder="Jelajahi Katalog"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tautan Tombol Utama</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnPrimaryLink"
                      value={formData.btnPrimaryLink}
                      onChange={handleFormChange}
                      placeholder="/catalog"
                    />
                  </div>
                </div>

                {/* Tombol Sekunder */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Label Tombol Sekunder</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnSecondaryText"
                      value={formData.btnSecondaryText}
                      onChange={handleFormChange}
                      placeholder="Lihat Portofolio"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tautan Tombol Sekunder</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnSecondaryLink"
                      value={formData.btnSecondaryLink}
                      onChange={handleFormChange}
                      placeholder="/portofolio"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Slide Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SLIDE */}
      {showEditModal && selectedSlide && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div
            className="admin-modal-box admin-carousel-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                Edit Slide Carousel (ID #{selectedSlide.id})
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                {/* Judul Headline */}
                <div className="admin-form-group">
                  <label>Judul Headline Utama *</label>
                  <input
                    type="text"
                    className="admin-input"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                {/* Badge Tag & Status */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Badge / Tag Kategori</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="badge"
                      value={formData.badge}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Status Tayang</label>
                    <select
                      className="admin-select"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="Aktif">Aktif (Ditampilkan)</option>
                      <option value="Nonaktif">Nonaktif (Disembunyikan)</option>
                    </select>
                  </div>
                </div>

                {/* Subtitle / Deskripsi */}
                <div className="admin-form-group">
                  <label>Deskripsi Subtitle *</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    name="desc"
                    value={formData.desc}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                {/* Upload Foto / Gambar Banner Hero */}
                <div className="admin-form-group">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Foto / Gambar Banner Hero *</span>
                    {formData.image && (
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700 }}>
                        ✓ Foto Terpasang
                      </span>
                    )}
                  </label>

                  {formData.image ? (
                    <div className="admin-carousel-modal-preview-box">
                      <img
                        src={formData.image}
                        alt="Preview Banner Hero"
                        className="admin-carousel-modal-preview-img"
                      />
                      <div className="admin-carousel-modal-preview-overlay">
                        <span className="admin-carousel-modal-preview-title">
                          {formData.title || "Preview Banner Hero"}
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <label
                            className="admin-btn-secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(10, 59, 37, 0.85)",
                              color: "#FCF7F0",
                              border: "1px solid #D8C2A4",
                            }}
                          >
                            <FiUpload size={13} />
                            <span>Ganti Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleImageUpload}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              background: "rgba(239, 68, 68, 0.2)",
                              color: "#fca5a5",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                            }}
                            title="Hapus foto ini"
                          >
                            <FiTrash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="admin-carousel-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <div className="admin-carousel-dropzone-icon">
                        <FiUpload size={22} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
                          Klik untuk Unggah Foto Banner Hero
                        </strong>
                        <span style={{ fontSize: "12px", color: "#5A6D63" }} className="admin-preset-hint">
                          Format JPG, PNG, WEBP (Maksimal 15MB). Rekomendasi rasio lanskap 16:7 / 16:9
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Tombol Utama */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Label Tombol Utama</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnPrimaryText"
                      value={formData.btnPrimaryText}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tautan Tombol Utama</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnPrimaryLink"
                      value={formData.btnPrimaryLink}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                {/* Tombol Sekunder */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Label Tombol Sekunder</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnSecondaryText"
                      value={formData.btnSecondaryText}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tautan Tombol Sekunder</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="btnSecondaryLink"
                      value={formData.btnSecondaryLink}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Perbarui Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS */}
      {showDeleteModal && selectedSlide && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#ef4444" }}>
                Hapus Slide Carousel
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus slide <strong>"{selectedSlide.title}"</strong>? Slide ini tidak akan ditampilkan lagi di beranda.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Slide"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET KE STANDAR */}
      {showResetModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#ef4444" }}>
                Reset Slide Bawaan
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowResetModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
                Tindakan ini akan mengembalikan susunan dan isi slide carousel ke 3 slide default Rumah Indah Carpet baik di database maupun tampilan. Lanjutkan?
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                disabled={isResetting}
                onClick={handleResetToDefault}
              >
                {isResetting ? "Mereset..." : "Ya, Reset Bawaan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="admin-toast-notification">
          <FiCheckCircle color="#10b981" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
