"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredTestimonials,
  subscribeTestimonials,
  approveTestimonial,
  rejectTestimonial,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/testimonialStore";

import {
  FiPlus,
  FiMessageSquare,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiSearch,
  FiCheckCircle,
  FiX,
  FiCheck,
  FiClock,
  FiUserCheck,
  FiAlertCircle,
  FiUpload,
  FiVideo,
  FiImage,
} from "react-icons/fi";

const avatarColors = [
  "#2563eb",
  "#9333ea",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#0d9488",
  "#0284c7",
];

export default function TestimonialPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [testimonials, setTestimonials] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [ratingFilter, setRatingFilter] = useState("Semua");
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "Karpet Masjid",
    city: "",
    text: "",
    rating: 5,
    status: "Aktif",
    media: [],
  });

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchTestimonialsFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const data = await syncTestimonialsFromDatabase();
      if (Array.isArray(data)) {
        setTestimonials(data);
        if (showNotification) {
          showToast("Data testimonial berhasil disinkronkan dari Database Prisma!");
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database testimoni:", err);
      if (showNotification) {
        showToast("Koneksi database gagal, menampilkan cache lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Load from store & subscribe
  useEffect(() => {
    setTestimonials(getStoredTestimonials());
    fetchTestimonialsFromDB(false);
    const unsubscribe = subscribeTestimonials((updated) => {
      setTestimonials(updated);
    });
    return () => unsubscribe();
  }, []);

  // Handle Photo & Video Upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentMedia = formData.media || [];
    const availableSlots = 6 - currentMedia.length;

    if (availableSlots <= 0) {
      showToast("Maksimal 6 file foto/video telah tercapai.");
      e.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      showToast(`Hanya ${availableSlots} file pertama yang ditambahkan (Maksimal 6 file).`);
    }

    filesToProcess.forEach((file) => {
      const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        showToast(`File "${file.name}" bukan format foto/video yang didukung.`);
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        showToast(`Ukuran file "${file.name}" melebihi 50MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setFormData((prev) => {
          const existing = prev.media || [];
          if (existing.length >= 6) return prev;
          return {
            ...prev,
            media: [
              ...existing,
              {
                type: isVideo ? "video" : "image",
                src: dataUrl,
                name: file.name,
              },
            ],
          };
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemoveMedia = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      media: (prev.media || []).filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      role: "",
      category: "Karpet Masjid",
      city: "",
      text: "",
      rating: 5,
      status: "Aktif",
      media: [],
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      role: item.role || "",
      category: item.category || "Karpet Masjid",
      city: item.city || "",
      text: item.text || item.review || "",
      rating: item.rating || 5,
      status: item.status || "Aktif",
      media: item.media ? [...item.media] : [],
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleOpenReject = (item) => {
    setSelectedItem(item);
    setShowRejectModal(true);
  };

  // Approve action
  const handleApprove = async (item) => {
    await approveTestimonial(item.id);
    showToast(`✓ Testimonial dari "${item.name}" berhasil DITERIMA di Database & kini tampil di Beranda!`);
  };

  // Reject action
  const handleConfirmReject = async () => {
    if (!selectedItem) return;
    await rejectTestimonial(selectedItem.id);
    setShowRejectModal(false);
    showToast(`Testimonial dari "${selectedItem.name}" telah DITOLAK dan dihapus dari Database.`);
  };

  // Save new testimonial
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) {
      showToast("Nama dan isi ulasan wajib diisi!");
      return;
    }

    const created = await addTestimonial({
      name: formData.name,
      role: formData.role,
      category: formData.category,
      city: formData.city,
      review: formData.text,
      rating: parseInt(formData.rating) || 5,
      status: formData.status,
      media: formData.media || [],
    });

    setShowAddModal(false);
    showToast(
      created.status === "Aktif"
        ? `Testimonial dari "${formData.name}" berhasil disimpan ke Database dan aktif di beranda!`
        : `Testimonial dari "${formData.name}" berhasil disimpan ke Database dengan status ${created.status}.`
    );
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    await updateTestimonial(selectedItem.id, {
      name: formData.name,
      role: formData.role,
      category: formData.category,
      city: formData.city,
      text: formData.text,
      rating: parseInt(formData.rating) || 5,
      status: formData.status,
      media: formData.media || [],
    });

    setShowEditModal(false);
    showToast(`Testimonial dari "${formData.name}" berhasil diperbarui di Database!`);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    await deleteTestimonial(selectedItem.id);
    setShowDeleteModal(false);
    showToast(`Testimonial dari "${selectedItem.name}" berhasil dihapus dari Database.`);
  };

  // Filtering
  const filteredTestimonials = testimonials.filter((item) => {
    const textToCheck = `${item.name} ${item.role || ""} ${item.city || ""} ${item.text || item.review || ""}`.toLowerCase();
    const matchSearch = textToCheck.includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "Semua" ||
      (statusFilter === "Aktif" && item.status === "Aktif") ||
      (statusFilter === "Menunggu Persetujuan" && item.status === "Menunggu Persetujuan") ||
      (statusFilter === "Draft" && item.status === "Draft");

    const matchRating =
      ratingFilter === "Semua" ||
      item.rating === parseInt(ratingFilter);

    return matchSearch && matchStatus && matchRating;
  });

  const pendingCount = testimonials.filter((t) => t.status === "Menunggu Persetujuan").length;
  const activeCount = testimonials.filter((t) => t.status === "Aktif").length;
  const totalCount = testimonials.length;

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
        {/* UNIFIED ADMIN HEADER */}
        <AdminHeader
          title="Manajemen Testimonial Pelanggan"
          breadcrumb="ADMIN PANEL / ULASAN & MODERASI"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT AREA */}
        <div className="admin-content">
          {/* STATS SUMMARY */}
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <FiMessageSquare size={20} />
                </div>
                <span className="stat-change">Total</span>
              </div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-title">Semua Ulasan Masuk</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                  <FiClock size={20} />
                </div>
                {pendingCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    Perlu Aksi
                  </span>
                )}
              </div>
              <div className="stat-value" style={{ color: pendingCount > 0 ? "#d97706" : "inherit" }}>
                {pendingCount}
              </div>
              <div className="stat-title">Menunggu Persetujuan</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                  <FiUserCheck size={20} />
                </div>
                <span className="stat-change" style={{ color: "#16a34a" }}>Publik</span>
              </div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-title">Tampil di Beranda</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                  <FiStar size={20} />
                </div>
                <span className="stat-change">Rating</span>
              </div>
              <div className="stat-value">5.0 / 5.0</div>
              <div className="stat-title">Kepuasan Klien</div>
            </div>
          </div>

          {/* ALERT PENDING MODERASI */}
          {pendingCount > 0 && (
            <div
              style={{
                background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FiAlertCircle size={22} color="#d97706" />
                <div>
                  <strong style={{ color: "#92400e", fontSize: "14px", display: "block" }}>
                    Ada {pendingCount} Testimonial Baru dari Formulir Beranda!
                  </strong>
                  <span style={{ color: "#b45309", fontSize: "12px" }}>
                    Silakan tinjau ulasan di bawah ini. Anda dapat <strong>Menerima</strong> agar tampil di Beranda atau <strong>Menolak</strong> untuk menghapusnya.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="action-btn-pill"
                style={{
                  background: "#d97706",
                  color: "white",
                  borderColor: "#d97706",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
                onClick={() => setStatusFilter("Menunggu Persetujuan")}
              >
                Lihat yang Menunggu ({pendingCount})
              </button>
            </div>
          )}

          {/* TOOLBAR FILTER */}
          <div className="admin-user-filter-bar">
            <div className="admin-filter-group">
              <div className="admin-search-input-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari nama, kota, atau isi testimonial..."
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
                <option value="Menunggu Persetujuan">⏳ Menunggu Persetujuan ({pendingCount})</option>
                <option value="Aktif">✓ Aktif (Beranda)</option>
                <option value="Draft">Draft (Disembunyikan)</option>
              </select>

              <select
                className="admin-select-filter"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="Semua">Semua Rating</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                <option value="3">⭐⭐⭐ (3 Bintang)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => fetchTestimonialsFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan testimonial dengan database PostgreSQL melalui Prisma"
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
                <FiMessageSquare className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleOpenAdd}
              >
                <FiPlus size={18} />
                <span>Tambah Testimonial</span>
              </button>
            </div>
          </div>

          {/* TESTIMONIAL CARDS GRID */}
          <div className="admin-cards-grid">
            {filteredTestimonials.map((item) => {
              const isPending = item.status === "Menunggu Persetujuan";
              const isActive = item.status === "Aktif";

              return (
                <div
                  className={`admin-testi-card ${isPending ? "pending-border" : ""}`}
                  key={item.id}
                  style={
                    isPending
                      ? {
                          border: "1.5px solid #f59e0b",
                          boxShadow: "0 4px 16px rgba(245, 158, 11, 0.12)",
                        }
                      : {}
                  }
                >
                  <div className="admin-testi-body">
                    <div className="admin-testi-author">
                      <div
                        className="admin-testi-avatar"
                        style={{
                          background: item.avatarBg || avatarColors[item.id % avatarColors.length],
                        }}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="admin-testi-name">{item.name}</h4>
                        <span className="admin-testi-role">
                          {item.role || "Pelanggan"} {item.city ? `• ${item.city}` : ""}
                        </span>
                        {item.category && (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "11px",
                              color: "#2563eb",
                              fontWeight: 600,
                              marginTop: "2px",
                            }}
                          >
                            🏷️ {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="admin-testi-stars">
                      {[...Array(Math.max(1, Math.min(5, item.rating || 5)))].map(
                        (_, i) => (
                          <FiStar key={i} fill="#f59e0b" color="#f59e0b" />
                        )
                      )}
                      {item.date && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "11px",
                            color: "#94a3b8",
                          }}
                        >
                          {item.date}
                        </span>
                      )}
                    </div>

                    <p className="admin-testi-quote">
                      "{item.text || item.review}"
                    </p>

                    {/* DOKUMENTASI MEDIA (FOTO & VIDEO) */}
                    {item.media && item.media.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "14px",
                          overflowX: "auto",
                          paddingBottom: "4px",
                        }}
                      >
                        {item.media.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              position: "relative",
                              flexShrink: 0,
                              border: "1.5px solid #e2e8f0",
                              background: "#0f172a",
                            }}
                            title={m.name || (m.type === "video" ? "Video Karpet" : "Foto Karpet")}
                          >
                            {m.type === "image" ? (
                              <img
                                src={m.src}
                                alt="Lampiran Foto"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <video
                                src={m.src}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            )}
                            <span
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                left: "2px",
                                fontSize: "9px",
                                background: "rgba(15, 23, 42, 0.8)",
                                color: "#ffffff",
                                borderRadius: "4px",
                                padding: "1px 4px",
                                fontWeight: "700",
                              }}
                            >
                              {m.type === "image" ? "📷" : "🎥"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-card-actions">
                    {/* STATUS PILL */}
                    {isPending ? (
                      <span className="admin-status-pill pending" style={{ marginRight: "auto" }}>
                        ⏳ Menunggu
                      </span>
                    ) : isActive ? (
                      <span className="admin-status-pill active" style={{ marginRight: "auto" }}>
                        ✓ Aktif
                      </span>
                    ) : (
                      <span className="admin-status-pill draft" style={{ marginRight: "auto" }}>
                        Draft
                      </span>
                    )}

                    {/* MODERATION BUTTONS (ACCEPT / REJECT) */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          className="action-btn-pill accept"
                          onClick={() => handleApprove(item)}
                          title="Terima & Tampilkan di Beranda"
                          style={{
                            background: "#16a34a",
                            color: "white",
                            borderColor: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          <FiCheck size={13} />
                          <span>Terima</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn-pill reject"
                          onClick={() => handleOpenReject(item)}
                          title="Tolak & Hapus Testimonial"
                          style={{
                            background: "#ef4444",
                            color: "white",
                            borderColor: "#ef4444",
                            fontWeight: 600,
                          }}
                        >
                          <FiX size={13} />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}

                    {/* REGULAR EDIT & DELETE */}
                    <button
                      type="button"
                      className="action-btn-pill edit"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Testimonial"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="action-btn-pill delete"
                      onClick={() => handleOpenDelete(item)}
                      title="Hapus Testimonial"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTestimonials.length === 0 && (
            <div className="admin-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
              <FiMessageSquare size={36} color="#94a3b8" style={{ marginBottom: "10px" }} />
              <h3 style={{ margin: "0 0 6px" }}>Tidak ada testimonial ditemukan</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                Coba sesuaikan kata kunci pencarian atau filter status ulasan Anda.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* =================================================
          MODAL TAMBAH TESTIMONIAL
      ================================================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Tambah Testimonial Klien</h3>
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
                  <label>Nama Pelanggan <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Budi Santoso"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Peran / Institusi / Masjid</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Pengurus Masjid Al-Ikhlas"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Kota / Lokasi</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Surabaya"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kategori Karpet</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Karpet Masjid">Karpet Masjid & Musholla</option>
                      <option value="Karpet Hotel">Karpet Hotel & Ballroom</option>
                      <option value="Karpet Kantor">Karpet Kantor & Komersial</option>
                      <option value="Karpet Rumah">Karpet Rumah & Residensial</option>
                      <option value="Karpet Custom">Karpet Custom</option>
                      <option value="Aksesoris">Aksesoris & Lainnya</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Rating Bintang</label>
                    <select
                      className="admin-select"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                      <option value="3">⭐⭐⭐ (3 Bintang)</option>
                      <option value="2">⭐⭐ (2 Bintang)</option>
                      <option value="1">⭐ (1 Bintang)</option>
                    </select>
                  </div>
                </div>

                {/* UPLOAD FOTO & VIDEO DOKUMENTASI */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ margin: 0 }}>
                      Foto atau Video Dokumentasi Ulasan
                    </label>
                    <span style={{ fontSize: "12px", color: (formData.media?.length || 0) >= 6 ? "#f87171" : "#94a3b8", fontWeight: 600 }}>
                      {formData.media?.length || 0} / 6 File
                    </span>
                  </div>

                  <div className="portfolio-media-upload-wrapper">
                    {/* TOMBOL PILIH FILE DARI PERANGKAT */}
                    <div
                      className={`testi-upload-area ${(formData.media?.length || 0) >= 6 ? "disabled" : ""}`}
                      onClick={() => {
                        if ((formData.media?.length || 0) < 6) {
                          document.getElementById("add-testi-file-input")?.click();
                        }
                      }}
                      title={(formData.media?.length || 0) >= 6 ? "Maksimal 6 file tercapai" : "Klik untuk memilih file foto atau video dari perangkat"}
                    >
                      <div className="testi-upload-icon-circle">
                        <FiUpload size={20} />
                      </div>
                      <div className="testi-upload-text">
                        <strong>Unggah Foto atau Video Dokumentasi</strong>
                        <span>Format: JPG, PNG, WEBP, MP4, WebM (Maks. 6 file, 50MB/file)</span>
                      </div>
                      <button
                        type="button"
                        className="testi-browse-btn"
                        disabled={(formData.media?.length || 0) >= 6}
                      >
                        Pilih File
                      </button>
                      <input
                        id="add-testi-file-input"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        disabled={(formData.media?.length || 0) >= 6}
                        style={{ display: "none" }}
                        onChange={handleMediaUpload}
                      />
                    </div>

                    {/* MEDIA PREVIEW LIST */}
                    {formData.media && formData.media.length > 0 && (
                      <div className="testi-media-grid">
                        {formData.media.map((m, idx) => (
                          <div className="testi-media-item" key={idx}>
                            {m.type === "image" ? (
                              <img src={m.src} alt={`Dokumentasi ${idx + 1}`} />
                            ) : (
                              <video src={m.src} muted playsInline />
                            )}
                            <span className="testi-media-item-badge">
                              {m.type === "image" ? <FiImage size={10} /> : <FiVideo size={10} />}
                              {m.type === "image" ? "Foto" : "Video"}
                            </span>
                            <button
                              type="button"
                              className="testi-media-item-delete"
                              onClick={() => handleRemoveMedia(idx)}
                              title="Hapus media ini"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Isi Testimonial / Ulasan <span className="required">*</span></label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Tuliskan ulasan pelanggan mengenai produk dan layanan pemasangan karpet..."
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Status Publikasi</label>
                  <select
                    className="admin-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif (Langsung tampil di Beranda)</option>
                    <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                    <option value="Draft">Draft (Disembunyikan)</option>
                  </select>
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
                  Simpan Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL EDIT TESTIMONIAL
      ================================================= */}
      {showEditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Testimonial</h3>
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
                  <label>Nama Pelanggan <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Peran / Institusi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Kota / Lokasi</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kategori Karpet</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Karpet Masjid">Karpet Masjid & Musholla</option>
                      <option value="Karpet Hotel">Karpet Hotel & Ballroom</option>
                      <option value="Karpet Kantor">Karpet Kantor & Komersial</option>
                      <option value="Karpet Rumah">Karpet Rumah & Residensial</option>
                      <option value="Karpet Custom">Karpet Custom</option>
                      <option value="Aksesoris">Aksesoris & Lainnya</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Rating Bintang</label>
                    <select
                      className="admin-select"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                      <option value="3">⭐⭐⭐ (3 Bintang)</option>
                      <option value="2">⭐⭐ (2 Bintang)</option>
                      <option value="1">⭐ (1 Bintang)</option>
                    </select>
                  </div>
                </div>

                {/* UPLOAD FOTO & VIDEO DOKUMENTASI */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ margin: 0 }}>
                      Foto atau Video Dokumentasi Ulasan
                    </label>
                    <span style={{ fontSize: "12px", color: (formData.media?.length || 0) >= 6 ? "#f87171" : "#94a3b8", fontWeight: 600 }}>
                      {formData.media?.length || 0} / 6 File
                    </span>
                  </div>

                  <div className="portfolio-media-upload-wrapper">
                    {/* TOMBOL PILIH FILE DARI PERANGKAT */}
                    <div
                      className={`testi-upload-area ${(formData.media?.length || 0) >= 6 ? "disabled" : ""}`}
                      onClick={() => {
                        if ((formData.media?.length || 0) < 6) {
                          document.getElementById("edit-testi-file-input")?.click();
                        }
                      }}
                      title={(formData.media?.length || 0) >= 6 ? "Maksimal 6 file tercapai" : "Klik untuk memilih file foto atau video dari perangkat"}
                    >
                      <div className="testi-upload-icon-circle">
                        <FiUpload size={20} />
                      </div>
                      <div className="testi-upload-text">
                        <strong>Unggah Foto atau Video Dokumentasi</strong>
                        <span>Format: JPG, PNG, WEBP, MP4, WebM (Maks. 6 file, 50MB/file)</span>
                      </div>
                      <button
                        type="button"
                        className="testi-browse-btn"
                        disabled={(formData.media?.length || 0) >= 6}
                      >
                        Pilih File
                      </button>
                      <input
                        id="edit-testi-file-input"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        disabled={(formData.media?.length || 0) >= 6}
                        style={{ display: "none" }}
                        onChange={handleMediaUpload}
                      />
                    </div>

                    {/* MEDIA PREVIEW LIST */}
                    {formData.media && formData.media.length > 0 && (
                      <div className="testi-media-grid">
                        {formData.media.map((m, idx) => (
                          <div className="testi-media-item" key={idx}>
                            {m.type === "image" ? (
                              <img src={m.src} alt={`Dokumentasi ${idx + 1}`} />
                            ) : (
                              <video src={m.src} muted playsInline />
                            )}
                            <span className="testi-media-item-badge">
                              {m.type === "image" ? <FiImage size={10} /> : <FiVideo size={10} />}
                              {m.type === "image" ? "Foto" : "Video"}
                            </span>
                            <button
                              type="button"
                              className="testi-media-item-delete"
                              onClick={() => handleRemoveMedia(idx)}
                              title="Hapus media ini"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Isi Ulasan <span className="required">*</span></label>
                  <textarea
                    className="admin-textarea"
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Status Publikasi</label>
                  <select
                    className="admin-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif (Tampilkan di Beranda)</option>
                    <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                    <option value="Draft">Draft (Disembunyikan)</option>
                  </select>
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

      {/* MODAL TOLAK TESTIMONIAL */}
      {showRejectModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header danger-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626" }}>
                <FiAlertCircle size={20} />
                <h3 style={{ margin: 0, color: "#dc2626" }}>Tolak & Hapus Testimonial</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menolak ulasan dari <strong>{selectedItem?.name}</strong>?
              </p>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#ef4444",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                ⚠️ Ulasan yang ditolak akan langsung <strong>dihapus secara permanen</strong> dan tidak akan pernah dipublikasikan di halaman beranda.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleConfirmReject}
              >
                Ya, Tolak & Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS BIASA */}
      {showDeleteModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header danger-header">
              <h3>Hapus Testimonial</h3>
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
                Apakah Anda yakin ingin menghapus ulasan dari <strong>{selectedItem?.name}</strong>? Ulasan ini akan hilang dari daftar dan Beranda.
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
                Ya, Hapus Testimonial
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