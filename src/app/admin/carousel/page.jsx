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
          <div
            style={{
              background: "#0A3B25",
              border: "1px solid #2A6151",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "28px",
              color: "#FCF7F0",
              boxShadow: "0 12px 35px rgba(10, 59, 37, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FiEye size={20} color="#D8C2A4" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#FCF7F0" }}>
                  Live Preview Banner Hero (Tampilan Pengunjung)
                </h3>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "1px solid #2A6151",
                    background: previewDevice === "desktop" ? "#2A6151" : "transparent",
                    color: previewDevice === "desktop" ? "#FCF7F0" : "#B2B7AA",
                    cursor: "pointer",
                  }}
                >
                  <FiMonitor size={14} />
                  <span>Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "1px solid #2A6151",
                    background: previewDevice === "mobile" ? "#2A6151" : "transparent",
                    color: previewDevice === "mobile" ? "#FCF7F0" : "#B2B7AA",
                    cursor: "pointer",
                  }}
                >
                  <FiSmartphone size={14} />
                  <span>Mobile</span>
                </button>

                <Link
                  href="/"
                  target="_blank"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "rgba(216, 194, 164, 0.15)",
                    color: "#D8C2A4",
                    border: "1px solid rgba(216, 194, 164, 0.3)",
                    textDecoration: "none",
                  }}
                >
                  <span>Buka Website Asli</span>
                  <FiExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* PREVIEW FRAME */}
            <div
              style={{
                maxWidth: previewDevice === "mobile" ? "380px" : "100%",
                margin: "0 auto",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                aspectRatio: previewDevice === "mobile" ? "9 / 12" : "16 / 7",
                minHeight: previewDevice === "mobile" ? "460px" : "320px",
                background: "#061A12",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                border: "1px solid #2A6151",
                transition: "all 0.3s ease",
              }}
            >
              {/* Background image */}
              <img
                src={
                  currentPreviewSlide.image ||
                  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600"
                }
                alt={currentPreviewSlide.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />

              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(6, 26, 18, 0.9) 0%, rgba(6, 26, 18, 0.6) 60%, rgba(6, 26, 18, 0.2) 100%)",
                }}
              />

              {/* Slide Content */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: previewDevice === "mobile" ? "24px 18px" : "40px 48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  maxWidth: previewDevice === "mobile" ? "100%" : "680px",
                  zIndex: 2,
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <span
                    style={{
                      background: "rgba(42, 97, 81, 0.9)",
                      color: "#FCF7F0",
                      border: "1px solid rgba(216, 194, 164, 0.4)",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: previewDevice === "mobile" ? "10px" : "12px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {currentPreviewSlide.badge || "KARPET PREMIUM"}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: previewDevice === "mobile" ? "18px" : "28px",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    margin: "0 0 12px 0",
                    color: "#FCF7F0",
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentPreviewSlide.title}
                </h2>

                <p
                  style={{
                    fontSize: previewDevice === "mobile" ? "12px" : "14px",
                    lineHeight: 1.5,
                    margin: "0 0 20px 0",
                    color: "#D8DED9",
                    maxHeight: previewDevice === "mobile" ? "60px" : "none",
                    overflow: "hidden",
                  }}
                >
                  {currentPreviewSlide.desc}
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {currentPreviewSlide.btnPrimaryText && (
                    <span
                      style={{
                        padding: previewDevice === "mobile" ? "8px 14px" : "10px 20px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #0A3B25 0%, #2A6151 100%)",
                        color: "#FCF7F0",
                        border: "1px solid #D8C2A4",
                        fontSize: previewDevice === "mobile" ? "11px" : "13px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {currentPreviewSlide.btnPrimaryText}
                      <FiArrowRight size={12} />
                    </span>
                  )}

                  {currentPreviewSlide.btnSecondaryText && (
                    <span
                      style={{
                        padding: previewDevice === "mobile" ? "8px 14px" : "10px 20px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.12)",
                        color: "#FCF7F0",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        fontSize: previewDevice === "mobile" ? "11px" : "13px",
                        fontWeight: 600,
                      }}
                    >
                      {currentPreviewSlide.btnSecondaryText}
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
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(6, 26, 18, 0.7)",
                      border: "1px solid rgba(216, 194, 164, 0.4)",
                      color: "#FCF7F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 3,
                    }}
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
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(6, 26, 18, 0.7)",
                      border: "1px solid rgba(216, 194, 164, 0.4)",
                      color: "#FCF7F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 3,
                    }}
                    aria-label="Slide berikutnya"
                  >
                    <FiChevronRight size={18} />
                  </button>

                  {/* Indicator dots */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "8px",
                      zIndex: 3,
                    }}
                  >
                    {activeSlides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewIndex(i)}
                        style={{
                          width: previewIndex === i ? "24px" : "8px",
                          height: "8px",
                          borderRadius: "999px",
                          background: previewIndex === i ? "#D8C2A4" : "rgba(255,255,255,0.4)",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        aria-label={`Lihat slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* GLOBAL SETTINGS CARD */}
          <div className="admin-carousel-config-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "rgba(42, 97, 81, 0.12)",
                  color: "#2A6151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiSliders size={20} />
              </div>
              <div>
                <strong className="admin-carousel-config-title">
                  Konfigurasi Pemutaran Carousel
                </strong>
                <span className="admin-carousel-config-desc">
                  Atur apakah banner berganti otomatis dan tentukan jeda durasi waktu per slide.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
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
                  style={{ width: "18px", height: "18px", accentColor: "#2A6151" }}
                />
                <span>Autoplay Aktif</span>
              </label>

              {/* Interval selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="admin-carousel-config-desc" style={{ fontWeight: 500 }}>
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
                className="admin-btn-primary"
                onClick={handleSaveGlobalSettings}
                disabled={isSavingSettings}
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </div>

          {/* FILTER & ACTION TOOLBAR */}
          <div className="admin-user-filter-bar">
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

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => fetchSlidesFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan dengan Database PostgreSQL"
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
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron DB"}</span>
              </button>

              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowResetModal(true)}
                title="Kembalikan ke slide bawaan"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 15px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <span>Reset Bawaan</span>
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleOpenAdd}
              >
                <FiPlus size={18} />
                <span>Tambah Slide Baru</span>
              </button>
            </div>
          </div>

          {/* SLIDES LIST CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            {filteredSlides.length > 0 ? (
              filteredSlides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className="admin-carousel-slide-card"
                  style={{
                    opacity: slide.status === "Nonaktif" ? 0.65 : 1,
                  }}
                >
                  {/* Order & Move buttons */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <button
                      type="button"
                      className="admin-carousel-move-btn"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, "up")}
                      title="Geser urutan ke atas"
                    >
                      <FiArrowUp size={14} />
                    </button>

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#2A6151",
                        background: "rgba(42, 97, 81, 0.12)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
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
                  <div
                    style={{
                      width: "160px",
                      height: "100px",
                      minWidth: "160px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative",
                      background: "#061A12",
                      border: "1px solid rgba(42, 97, 81, 0.3)",
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        left: "6px",
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(10, 59, 37, 0.9)",
                        color: "#FCF7F0",
                      }}
                    >
                      {slide.badge || "PRODUK"}
                    </span>
                  </div>

                  {/* Info details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#2A6151",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {slide.badge}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background:
                            slide.status === "Aktif"
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(239, 68, 68, 0.12)",
                          color:
                            slide.status === "Aktif" ? "#10b981" : "#ef4444",
                          border: `1px solid ${
                            slide.status === "Aktif" ? "#10b981" : "#ef4444"
                          }`,
                        }}
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
                      <span>
                        <strong>Tombol 1:</strong> {slide.btnPrimaryText || "-"} (
                        <code style={{ color: "#2A6151" }}>
                          {slide.btnPrimaryLink || "/catalog"}
                        </code>
                        )
                      </span>
                      <span>
                        <strong>Tombol 2:</strong> {slide.btnSecondaryText || "-"} (
                        <code style={{ color: "#2A6151" }}>
                          {slide.btnSecondaryLink || "/portofolio"}
                        </code>
                        )
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(slide)}
                      title={slide.status === "Aktif" ? "Nonaktifkan Slide" : "Aktifkan Slide"}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: slide.status === "Aktif" ? "1px solid #fde68a" : "1px solid #a7f3d0",
                        background: slide.status === "Aktif" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: slide.status === "Aktif" ? "#d97706" : "#10b981",
                        cursor: "pointer",
                      }}
                    >
                      {slide.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(slide)}
                      title="Edit Slide"
                      style={{
                        padding: "7px 12px",
                        borderRadius: "8px",
                        border: "1px solid #D8C2A4",
                        background: "rgba(216, 194, 164, 0.15)",
                        color: "#D8C2A4",
                        fontWeight: 600,
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <FiEdit2 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(slide)}
                      title="Hapus Slide"
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                    >
                      <FiTrash2 size={15} />
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
            className="admin-modal-box"
            style={{ maxWidth: "680px" }}
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
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #2A6151",
                        background: "#061A12",
                        aspectRatio: "16 / 7",
                        width: "100%",
                        maxHeight: "220px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      }}
                    >
                      <img
                        src={formData.image}
                        alt="Preview Banner Hero"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(6,26,18,0.85) 0%, transparent 60%)",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                        }}
                      >
                        <span style={{ color: "#FCF7F0", fontSize: "12px", fontWeight: 600 }}>
                          {formData.title || "Preview Banner Hero"}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
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
                    <label
                      className="admin-carousel-dropzone"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "36px 20px",
                        borderRadius: "14px",
                        textAlign: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "rgba(42, 97, 81, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#2A6151",
                        }}
                      >
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
            className="admin-modal-box"
            style={{ maxWidth: "680px" }}
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
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #2A6151",
                        background: "#061A12",
                        aspectRatio: "16 / 7",
                        width: "100%",
                        maxHeight: "220px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      }}
                    >
                      <img
                        src={formData.image}
                        alt="Preview Banner Hero"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(6,26,18,0.85) 0%, transparent 60%)",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                        }}
                      >
                        <span style={{ color: "#FCF7F0", fontSize: "12px", fontWeight: 600 }}>
                          {formData.title || "Preview Banner Hero"}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
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
                    <label
                      className="admin-carousel-dropzone"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "36px 20px",
                        borderRadius: "14px",
                        textAlign: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "rgba(42, 97, 81, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#2A6151",
                        }}
                      >
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
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0A3B25",
            color: "#FCF7F0",
            padding: "14px 22px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            border: "1px solid #2A6151",
            zIndex: 9999,
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "animFadeUp 0.3s ease",
          }}
        >
          <FiCheckCircle color="#10b981" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
