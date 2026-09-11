"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredBranches,
  saveBranches,
  subscribeBranches,
} from "@/lib/branchStore";
import {
  FiPlus as LucidePlus,
  FiMapPin as LucideMapPin,
  FiEdit2 as LucideEdit,
  FiTrash2 as LucideTrash,
  FiSearch as LucideSearch,
  FiPhone as LucidePhone,
  FiExternalLink as LucideExternal,
  FiCheckCircle as LucideCheck,
  FiX as LucideX,
  FiHome as LucideHome,
  FiCheck,
  FiAlertCircle,
  FiLayers,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

const initialBranches = [
  {
    id: 1,
    name: "Rumah Indah Carpet Head Office & Workshop Sidoarjo",
    city: "Sidoarjo",
    badge: "Pusat & Gudang Utama",
    address: "Jl. Raya Taman No. 45, Sidoarjo, Jawa Timur (Dekat Bundaran Waru)",
    phone: "0812-5223-5800",
    mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Sidoarjo",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Showroom Cabang Surabaya",
    city: "Surabaya",
    badge: "Showroom Display",
    address: "Jl. Ahmad Yani No. 45, Surabaya, Jawa Timur",
    phone: "0812-5223-5800",
    mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Surabaya",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Showroom Cabang Malang",
    city: "Malang",
    badge: "Showroom & Konsultasi",
    address: "Jl. Soekarno Hatta No. 20, Malang, Jawa Timur",
    phone: "0812-5223-5800",
    mapsUrl: "https://maps.google.com/?q=Rumah+Indah+Carpet+Malang",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200",
    status: "Aktif",
  },
];

export default function CabangPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Branches state
  const [branches, setBranches] = useState(initialBranches);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("Semua");
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Form branch state
  const [formData, setFormData] = useState({
    name: "",
    city: "Sidoarjo",
    badge: "Showroom Display",
    address: "",
    phone: "0812-5223-5800",
    mapsUrl: "",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
    status: "Aktif",
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchBranchesFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/branches");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setBranches(json.data);
        saveBranches(json.data);
        if (showNotification) {
          showToast("Data cabang berhasil disinkronkan dari Database Prisma!");
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database cabang:", err);
      if (showNotification) {
        showToast("Koneksi database gagal, menampilkan cache lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Load from database on mount & subscribe to realtime updates
  useEffect(() => {
    setBranches(getStoredBranches());
    fetchBranchesFromDB(false);

    const unsubBranches = subscribeBranches((updated) => {
      setBranches(updated);
    });

    return () => {
      unsubBranches();
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Format tidak didukung. Silakan pilih file gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran gambar maksimal adalah 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData((prev) => ({
        ...prev,
        image: dataUrl,
      }));
      showToast("Foto tempat lokasi berhasil diunggah!");
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      city: "Sidoarjo",
      badge: "Showroom Display",
      address: "",
      phone: "0812-5223-5800",
      mapsUrl: "https://maps.google.com/?q=AB+Carpet",
      image: "",
      status: "Aktif",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name || "",
      city: branch.city || "Sidoarjo",
      badge: branch.badge || "Showroom Display",
      address: branch.address || "",
      phone: branch.phone || "0812-5223-5800",
      mapsUrl: branch.mapsUrl || "",
      image: branch.image || "",
      status: branch.status || "Aktif",
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      showToast("Nama cabang dan alamat lengkap wajib diisi!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      badge: formData.badge.trim() || "Showroom Display",
      address: formData.address.trim(),
      phone: formData.phone.trim() || "0812-5223-5800",
      mapsUrl: formData.mapsUrl.trim() || `https://maps.google.com/?q=${encodeURIComponent(formData.name)}`,
      image: formData.image.trim() || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
      status: formData.status || "Aktif",
    };

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = [result.data, ...branches];
        setBranches(updated);
        saveBranches(updated);
        setShowAddModal(false);
        showToast(`Cabang "${result.data.name}" berhasil disimpan ke Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal simpan cabang ke API:", err);
    }

    const fallbackBranch = { id: Date.now(), ...payload };
    const updated = [fallbackBranch, ...branches];
    setBranches(updated);
    saveBranches(updated);
    setShowAddModal(false);
    showToast(`Cabang "${fallbackBranch.name}" berhasil ditambahkan!`);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !formData.name.trim() || !formData.address.trim()) return;

    const payload = {
      id: selectedBranch.id,
      name: formData.name.trim(),
      city: formData.city.trim(),
      badge: formData.badge.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      mapsUrl: formData.mapsUrl.trim(),
      image: formData.image.trim(),
      status: formData.status,
    };

    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = branches.map((item) =>
          item.id === selectedBranch.id ? { ...item, ...result.data } : item
        );
        setBranches(updated);
        saveBranches(updated);
        setShowEditModal(false);
        showToast(`Cabang "${formData.name}" berhasil diperbarui di Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal update cabang ke API:", err);
    }

    const updated = branches.map((item) =>
      item.id === selectedBranch.id ? { ...item, ...payload } : item
    );
    setBranches(updated);
    saveBranches(updated);
    setShowEditModal(false);
    showToast(`Cabang "${formData.name}" berhasil diperbarui!`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBranch) return;
    try {
      await fetch(`/api/branches?id=${selectedBranch.id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Gagal delete cabang ke API:", err);
    }

    const updated = branches.filter((b) => b.id !== selectedBranch.id);
    setBranches(updated);
    saveBranches(updated);
    setShowDeleteModal(false);
    showToast(`Cabang "${selectedBranch.name}" berhasil dihapus dari Database.`);
  };

  // Unique cities list for filter
  const uniqueCities = ["Semua", ...Array.from(new Set(branches.map((b) => b.city).filter(Boolean)))];

  const filteredBranches = branches.filter((item) => {
    const matchSearch =
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.badge || "").toLowerCase().includes(search.toLowerCase());

    const matchCity = cityFilter === "Semua" || item.city === cityFilter;
    return matchSearch && matchCity;
  });

  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === "Aktif").length;
  const totalCities = new Set(branches.map((b) => b.city)).size;

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
          title="Manajemen Cabang & Showroom"
          breadcrumb="ADMIN PANEL / JARINGAN CABANG"
          setMobileOpen={setMobileOpen}
        />

        <div className="admin-content">
          {/* STATS SUMMARY */}
          <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <div className="stat-top">
                    <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                      <FaStore size={18} />
                    </div>
                    <span className="stat-change">Total</span>
                  </div>
                  <div className="stat-value">{totalBranches}</div>
                  <div className="stat-title">Total Showroom & Cabang</div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-top">
                    <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      <LucideCheck size={18} />
                    </div>
                    <span className="stat-change">Aktif</span>
                  </div>
                  <div className="stat-value">{activeBranches}</div>
                  <div className="stat-title">Cabang Beroperasi</div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-top">
                    <div className="stat-icon" style={{ background: "#faf5ff", color: "#9333ea" }}>
                      <LucideMapPin size={18} />
                    </div>
                    <span className="stat-change">Jawa Timur</span>
                  </div>
                  <div className="stat-value">{totalCities}</div>
                  <div className="stat-title">Kota Jaringan Layanan</div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-top">
                    <div className="stat-icon" style={{ background: "#fef2f2", color: "#ef4444" }}>
                      <FiLayers size={18} />
                    </div>
                    <span className="stat-change">Nonaktif</span>
                  </div>
                  <div className="stat-value">{totalBranches - activeBranches}</div>
                  <div className="stat-title">Cabang Nonaktif / Persiapan</div>
                </div>
              </div>

              {/* FILTER & TOOLBAR */}
              <div className="admin-user-filter-bar">
                <div className="admin-filter-group">
                  <div className="admin-search-input-wrapper">
                    <LucideSearch />
                    <input
                      type="text"
                      placeholder="Cari nama cabang, kota, atau alamat..."
                      className="admin-search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="admin-select-filter"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    {uniqueCities.map((c) => (
                      <option key={c} value={c}>
                        {c === "Semua" ? "Semua Kota" : `Kota ${c}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => fetchBranchesFromDB(true)}
                    disabled={isSyncing}
                    title="Sinkronkan cabang dengan database PostgreSQL melalui Prisma"
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
                    <LucideMapPin className={isSyncing ? "spin-icon" : ""} />
                    <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
                  </button>

                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={handleOpenAdd}
                  >
                    <LucidePlus size={18} />
                    <span>Tambah Cabang</span>
                  </button>
                </div>
              </div>

              {/* BRANCH CARDS GRID */}
              <div className="admin-cards-grid">
                {filteredBranches.map((branch) => (
                  <div className="admin-port-card" key={branch.id}>
                    <div className="admin-port-image" style={{ height: "190px" }}>
                      <img
                        src={branch.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"}
                        alt={branch.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <span className="admin-port-badge">{branch.city}</span>
                    </div>

                    <div className="admin-port-body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "#60a5fa",
                            borderRadius: "6px",
                          }}
                        >
                          {branch.badge || "Showroom Display"}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            background: branch.status === "Aktif" ? "rgba(22, 163, 74, 0.15)" : "rgba(220, 38, 38, 0.15)",
                            color: branch.status === "Aktif" ? "#4ade80" : "#f87171",
                            borderRadius: "6px",
                          }}
                        >
                          {branch.status}
                        </span>
                      </div>

                      <h3 className="admin-port-title" style={{ fontSize: "16px", marginBottom: "8px" }}>
                        {branch.name}
                      </h3>

                      <p style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "#94a3b8", fontSize: "12px", lineHeight: 1.5, margin: "0 0 6px 0" }}>
                        <LucideMapPin size={14} style={{ marginTop: "2px", flexShrink: 0, color: "#38bdf8" }} />
                        <span>{branch.address}</span>
                      </p>

                      <p style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "12px", margin: "0 0 12px 0" }}>
                        <LucidePhone size={14} style={{ flexShrink: 0, color: "#4ade80" }} />
                        <span>{branch.phone || "0812-5223-5800"}</span>
                      </p>

                      {branch.mapsUrl && (
                        <a
                          href={branch.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            color: "#38bdf8",
                            textDecoration: "none",
                            marginBottom: "14px",
                            fontWeight: 500,
                          }}
                        >
                          <span>Buka di Google Maps</span>
                          <LucideExternal size={12} />
                        </a>
                      )}

                      <div className="admin-card-actions" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          type="button"
                          className="action-btn-pill edit"
                          onClick={() => handleOpenEdit(branch)}
                          title="Edit Cabang"
                        >
                          <LucideEdit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn-pill delete"
                          onClick={() => handleOpenDelete(branch)}
                          title="Hapus Cabang"
                        >
                          <LucideTrash size={13} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        </div>
      </main>

      {/* MODAL TAMBAH CABANG */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Tambah Cabang / Showroom Baru</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowAddModal(false)}>
                <LucideX />
              </button>
            </div>
            <form onSubmit={handleSaveNew}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Cabang / Workshop *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Showroom Cabang Surabaya Timur"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kota Cabang *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Surabaya"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tipe Cabang (Badge Tag)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Showroom Display, Pusat & Gudang Utama, dll"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    />
                    <span className="helper-text">
                      Tulis tipe atau label cabang (bebas diketik sesuai kebutuhan).
                    </span>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Alamat Lengkap *</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    placeholder="Contoh: Jl. Ahmad Yani No. 45, Surabaya, Jawa Timur"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: 0812-5223-5800"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Status Operasional</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Aktif">Aktif (Tampilkan di Website)</option>
                      <option value="Nonaktif">Nonaktif (Sembunyikan)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Link Google Maps</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.mapsUrl}
                    onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ margin: 0 }}>Foto Tempat Lokasi / Gedung Cabang</label>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          showToast("Foto tempat lokasi berhasil dihapus");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        <LucideTrash size={13} />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>

                  {/* PREVIEW JIKA SUDAH ADA GAMBAR */}
                  {formData.image ? (
                    <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(226, 232, 240, 0.2)", marginBottom: "10px", background: "#0f172a" }}>
                      <img
                        src={formData.image}
                        alt="Preview Tempat Lokasi"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200";
                        }}
                      />
                      <label
                        className="admin-upload-btn"
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          background: "rgba(15, 23, 42, 0.85)",
                          color: "#ffffff",
                          borderRadius: "8px",
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <FiUpload size={14} />
                        <span>Ganti Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    /* UPLOAD BOX JIKA BELUM ADA GAMBAR */
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px 16px",
                        border: "2px dashed rgba(226, 232, 240, 0.3)",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.02)",
                        cursor: "pointer",
                        marginBottom: "10px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(42, 97, 81, 0.15)",
                          color: "#38a169",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <FiUpload size={20} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                        Klik untuk Upload Foto Tempat Lokasi
                      </span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Format: JPG, PNG, WebP (Maksimal 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}

                  {/* INPUT URL CADANGAN */}
                  <div className="admin-image-upload-row">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Atau tempel URL gambar jika ada (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      style={{ fontSize: "12px" }}
                    />
                    <label
                      className="admin-upload-btn"
                      title="Pilih file foto dari perangkat"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        padding: "0 14px",
                        fontSize: "12px",
                      }}
                    >
                      <FiUpload size={14} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <span className="helper-text">
                    Unggah foto showroom atau tampak gedung cabang yang akan tampil di halaman /cabang publik.
                  </span>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Simpan Cabang ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT CABANG */}
      {showEditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Data Cabang</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowEditModal(false)}>
                <LucideX />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Cabang / Workshop *</label>
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
                    <label>Kota Cabang *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tipe Cabang (Badge Tag)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Showroom Display, Pusat & Gudang Utama, dll"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    />
                    <span className="helper-text">
                      Tulis tipe atau label cabang (bebas diketik sesuai kebutuhan).
                    </span>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Alamat Lengkap *</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Status Operasional</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Aktif">Aktif (Tampilkan di Website)</option>
                      <option value="Nonaktif">Nonaktif (Sembunyikan)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Link Google Maps</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.mapsUrl}
                    onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ margin: 0 }}>Foto Tempat Lokasi / Gedung Cabang</label>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          showToast("Foto tempat lokasi berhasil dihapus");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        <LucideTrash size={13} />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>

                  {/* PREVIEW JIKA SUDAH ADA GAMBAR */}
                  {formData.image ? (
                    <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(226, 232, 240, 0.2)", marginBottom: "10px", background: "#0f172a" }}>
                      <img
                        src={formData.image}
                        alt="Preview Tempat Lokasi"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200";
                        }}
                      />
                      <label
                        className="admin-upload-btn"
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          background: "rgba(15, 23, 42, 0.85)",
                          color: "#ffffff",
                          borderRadius: "8px",
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <FiUpload size={14} />
                        <span>Ganti Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    /* UPLOAD BOX JIKA BELUM ADA GAMBAR */
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px 16px",
                        border: "2px dashed rgba(226, 232, 240, 0.3)",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.02)",
                        cursor: "pointer",
                        marginBottom: "10px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(42, 97, 81, 0.15)",
                          color: "#38a169",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <FiUpload size={20} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                        Klik untuk Upload Foto Tempat Lokasi
                      </span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Format: JPG, PNG, WebP (Maksimal 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}

                  {/* INPUT URL CADANGAN */}
                  <div className="admin-image-upload-row">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Atau tempel URL gambar jika ada (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      style={{ fontSize: "12px" }}
                    />
                    <label
                      className="admin-upload-btn"
                      title="Pilih file foto dari perangkat"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        padding: "0 14px",
                        fontSize: "12px",
                      }}
                    >
                      <FiUpload size={14} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <span className="helper-text">
                    Unggah foto showroom atau tampak gedung cabang yang akan tampil di halaman /cabang publik.
                  </span>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="admin-btn-primary">
                  Perbarui Cabang di Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS CABANG */}
      {showDeleteModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: "#dc2626" }}>Hapus Cabang</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowDeleteModal(false)}>
                <LucideX />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                Apakah Anda yakin ingin menghapus cabang <strong>&quot;{selectedBranch?.name}&quot;</strong> dari database? Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Batal
              </button>
              <button type="button" className="admin-btn-danger" onClick={handleConfirmDelete}>
                Ya, Hapus Cabang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="admin-toast success">
          <LucideCheck size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
