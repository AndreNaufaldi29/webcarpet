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
  getStoredSettings,
  saveSettings,
  subscribeSettings,
  DEFAULT_SETTINGS,
} from "@/lib/settingsStore";
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
  FiCalendar,
  FiSettings,
  FiSave,
  FiRotateCcw,
  FiEye,
  FiCheck,
  FiAlertCircle,
  FiLayers,
} from "react-icons/fi";
import { FaStore, FaWhatsapp } from "react-icons/fa";

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

  // Tab Navigation: 'branches' | 'survey'
  const [activeTab, setActiveTab] = useState("branches");

  // Branches state
  const [branches, setBranches] = useState(initialBranches);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("Semua");
  const [isSyncing, setIsSyncing] = useState(false);

  // Survey & Consultation Settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);

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

  const fetchSettingsFromDB = async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings((prev) => ({
          ...prev,
          ...json.data,
          promoActive: String(json.data.promoActive),
          surveyActive: String(json.data.surveyActive ?? true),
        }));
      }
    } catch (err) {
      console.warn("Gagal sinkron settings survei:", err);
    }
  };

  // Load from database on mount & subscribe to realtime updates
  useEffect(() => {
    setBranches(getStoredBranches());
    fetchBranchesFromDB(false);

    setSettings(getStoredSettings());
    fetchSettingsFromDB();

    const unsubBranches = subscribeBranches((updated) => {
      setBranches(updated);
    });

    const unsubSettings = subscribeSettings((updated) => {
      setSettings(updated);
    });

    return () => {
      unsubBranches();
      unsubSettings();
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      city: "Sidoarjo",
      badge: "Showroom Display",
      address: "",
      phone: "0812-5223-5800",
      mapsUrl: "https://maps.google.com/?q=AB+Carpet",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
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

  // Survey & Consultation Handlers
  const handleSurveyChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSurvey = async (e) => {
    e.preventDefault();
    setIsSavingSurvey(true);
    try {
      await saveSettings(settings);
      showToast("Banner Layanan Survei & Konsultasi berhasil disimpan ke Database Prisma!");
    } catch (err) {
      console.error("Gagal simpan pengaturan survei:", err);
      showToast("Gagal menyimpan ke database, pengaturan disimpan lokal.");
    } finally {
      setIsSavingSurvey(false);
    }
  };

  const handleResetSurvey = () => {
    setSettings((prev) => ({
      ...prev,
      surveyActive: "true",
      surveyBadge: "LAYANAN SURVEI & KONSULTASI GRATIS",
      surveyTitle: "Ingin Tim Kami Datang Langsung ke Lokasi Anda?",
      surveyDescription:
        "Dapatkan layanan ukur lokasi presisi, estimasi kebutuhan karpet, dan bawa ratusan sampel bahan langsung ke masjid, kantor, atau kediaman Anda di seluruh Jawa Timur.",
      surveyButtonText: "Jadwalkan Survei Sekarang",
      surveyWhatsapp: prev.whatsapp || "08212128701",
      surveyMessage:
        "Halo Rumah Indah Carpet, saya ingin mengajukan jadwal survei lokasi dan konsultasi sampel karpet.",
    }));
    showToast("Template banner survei di-reset ke nilai standar!");
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

  const isSurveyActive = settings.surveyActive === true || settings.surveyActive === "true";

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
          title="Manajemen Cabang & Layanan Survei"
          breadcrumb="ADMIN PANEL / JARINGAN TOKO & SURVEI"
          setMobileOpen={setMobileOpen}
        />

        <div className="admin-content">
          {/* TAB SWITCHER */}
          <div className="admin-settings-tabs" style={{ marginBottom: "20px" }}>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "branches" ? "active" : ""}`}
              onClick={() => setActiveTab("branches")}
            >
              <FaStore size={15} />
              <span>Daftar Cabang Showroom ({totalBranches})</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "survey" ? "active" : ""}`}
              onClick={() => setActiveTab("survey")}
            >
              <FiCalendar size={15} />
              <span>Banner Survei & Konsultasi Gratis</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  background: isSurveyActive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: isSurveyActive ? "#4ade80" : "#f87171",
                  fontWeight: 600,
                  marginLeft: "6px",
                }}
              >
                {isSurveyActive ? "Aktif" : "Nonaktif"}
              </span>
            </button>
          </div>

          {/* =========================================================
              TAB 1: DAFTAR CABANG & SHOWROOM
          ========================================================= */}
          {activeTab === "branches" && (
            <>
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

                <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("survey")}>
                  <div className="stat-top">
                    <div className="stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                      <FiCalendar size={18} />
                    </div>
                    <span className="stat-change" style={{ color: "#059669" }}>Klik Edit</span>
                  </div>
                  <div className="stat-value" style={{ fontSize: "18px" }}>
                    {isSurveyActive ? "Survei Aktif" : "Survei Nonaktif"}
                  </div>
                  <div className="stat-title">Layanan Survei & Konsultasi ➔</div>
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
            </>
          )}

          {/* =========================================================
              TAB 2: KELOLA BANNER LAYANAN SURVEI & KONSULTASI
          ========================================================= */}
          {activeTab === "survey" && (
            <div className="admin-settings-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h3 className="admin-settings-section-title">
                    Pengaturan Banner Layanan Survei & Konsultasi Gratis
                  </h3>
                  <p className="admin-settings-section-subtitle" style={{ marginBottom: 0 }}>
                    Kelola teks ajakan survei on-site, badge penawaran, nomor WhatsApp tujuan, serta status visibilitas banner di halaman publik <code>/cabang</code>.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="seo-live-badge">
                    <span className="live-dot" /> Sinkron Realtime
                  </span>
                </div>
              </div>

              {/* LIVE VISUAL PREVIEW OF THE BANNER */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <FiEye size={14} color="#38bdf8" />
                    <span>Pratinjau Live di Halaman Publik (/cabang):</span>
                  </span>
                  {!isSurveyActive && (
                    <span style={{ fontSize: "12px", color: "#f87171", fontWeight: 600 }}>
                      ⚠️ Banner saat ini berstatus NONAKTIF (tersembunyi di web publik)
                    </span>
                  )}
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(42, 97, 81, 0.45) 0%, rgba(20, 50, 42, 0.65) 100%)",
                    border: "1px solid rgba(42, 97, 81, 0.5)",
                    borderRadius: "16px",
                    padding: "32px 36px",
                    position: "relative",
                    overflow: "hidden",
                    opacity: isSurveyActive ? 1 : 0.6,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
                    <div style={{ flex: "1 1 500px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(255, 255, 255, 0.15)",
                          backdropFilter: "blur(6px)",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#86efac",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          marginBottom: "12px",
                        }}
                      >
                        <FiCalendar size={13} />
                        <span>{settings.surveyBadge || "LAYANAN SURVEI & KONSULTASI GRATIS"}</span>
                      </span>

                      <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", margin: "0 0 10px 0", lineHeight: 1.3 }}>
                        {settings.surveyTitle || "Ingin Tim Kami Datang Langsung ke Lokasi Anda?"}
                      </h3>

                      <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6, margin: 0, maxWidth: "680px" }}>
                        {settings.surveyDescription ||
                          "Dapatkan layanan ukur lokasi presisi, estimasi kebutuhan karpet, dan bawa ratusan sampel bahan langsung ke masjid, kantor, atau kediaman Anda di seluruh Jawa Timur."}
                      </p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#fef08a",
                          color: "#1e293b",
                          fontWeight: 700,
                          fontSize: "14px",
                          padding: "12px 22px",
                          borderRadius: "10px",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                        }}
                      >
                        <FaWhatsapp size={18} color="#16a34a" />
                        <span>{settings.surveyButtonText || "Jadwalkan Survei Sekarang"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM EDIT BANNER SURVEI */}
              <form onSubmit={handleSaveSurvey}>
                <div className="admin-settings-grid">
                  {/* TOGGLE VISIBILITAS BANNER */}
                  <div className="admin-form-group">
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Status Tampilkan Banner Survei</span>
                      <span style={{ fontSize: "12px", color: isSurveyActive ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                        {isSurveyActive ? "Aktif (Tampil di Website)" : "Nonaktif (Sembunyi)"}
                      </span>
                    </label>
                    <select
                      name="surveyActive"
                      className="admin-select"
                      value={settings.surveyActive ?? "true"}
                      onChange={handleSurveyChange}
                    >
                      <option value="true">Aktif — Tampilkan Banner di Halaman Cabang</option>
                      <option value="false">Nonaktif — Sembunyikan Banner dari Halaman Cabang</option>
                    </select>
                    <span className="helper-text">
                      Jika dinonaktifkan, bagian banner survei & konsultasi ini tidak akan muncul di halaman <code>/cabang</code>.
                    </span>
                  </div>

                  {/* TEKS BADGE */}
                  <div className="admin-form-group">
                    <label>Teks Badge Tag (Label Atas)</label>
                    <input
                      type="text"
                      name="surveyBadge"
                      className="admin-input"
                      placeholder="LAYANAN SURVEI & KONSULTASI GRATIS"
                      value={settings.surveyBadge || ""}
                      onChange={handleSurveyChange}
                    />
                    <span className="helper-text">
                      Teks badge kecil dengan ikon kalender di atas judul banner.
                    </span>
                  </div>

                  {/* JUDUL UTAMA */}
                  <div className="admin-form-group">
                    <label>Judul Utama Banner <span className="required">*</span></label>
                    <input
                      type="text"
                      name="surveyTitle"
                      className="admin-input"
                      placeholder="Ingin Tim Kami Datang Langsung ke Lokasi Anda?"
                      required
                      value={settings.surveyTitle || ""}
                      onChange={handleSurveyChange}
                    />
                    <span className="helper-text">
                      Judul ajakan survei on-site untuk menarik minat calon pelanggan.
                    </span>
                  </div>

                  {/* DESKRIPSI LAYANAN */}
                  <div className="admin-form-group">
                    <label>Deskripsi Layanan & Nilai Tambah</label>
                    <textarea
                      name="surveyDescription"
                      className="admin-textarea"
                      rows={3}
                      placeholder="Dapatkan layanan ukur lokasi presisi, estimasi kebutuhan karpet..."
                      value={settings.surveyDescription || ""}
                      onChange={handleSurveyChange}
                    />
                    <span className="helper-text">
                      Jelaskan detail keunggulan tim survei (membawa sampel bahan, pengukuran akurat, dll).
                    </span>
                  </div>

                  <div className="admin-form-row">
                    {/* TEKS TOMBOL */}
                    <div className="admin-form-group">
                      <label>Teks Tombol Aksi WhatsApp</label>
                      <input
                        type="text"
                        name="surveyButtonText"
                        className="admin-input"
                        placeholder="Jadwalkan Survei Sekarang"
                        value={settings.surveyButtonText || ""}
                        onChange={handleSurveyChange}
                      />
                    </div>

                    {/* NOMOR WHATSAPP */}
                    <div className="admin-form-group">
                      <label>Nomor WhatsApp Tujuan Konsultasi</label>
                      <input
                        type="text"
                        name="surveyWhatsapp"
                        className="admin-input"
                        placeholder="Contoh: 0821-2128-701"
                        value={settings.surveyWhatsapp || ""}
                        onChange={handleSurveyChange}
                      />
                      <span className="helper-text">
                        Jika dikosongkan, otomatis menggunakan nomor WhatsApp utama toko ({settings.whatsapp || "08212128701"}).
                      </span>
                    </div>
                  </div>

                  {/* PESAN WHATSAPP OTOMATIS */}
                  <div className="admin-form-group">
                    <label>Template Pesan WhatsApp Otomatis (Saat Diklik)</label>
                    <textarea
                      name="surveyMessage"
                      className="admin-textarea"
                      rows={2}
                      placeholder="Halo Rumah Indah Carpet, saya ingin mengajukan jadwal survei lokasi dan konsultasi sampel karpet."
                      value={settings.surveyMessage || ""}
                      onChange={handleSurveyChange}
                    />
                    <span className="helper-text">
                      Teks pembuka chat WhatsApp yang otomatis terisi ketika pengunjung mengklik tombol &quot;Jadwalkan Survei&quot;.
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "24px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleResetSurvey}
                    title="Kembalikan teks ke template default"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FiRotateCcw size={14} />
                    <span>Reset ke Template Default</span>
                  </button>

                  <button
                    type="submit"
                    className="admin-btn-primary"
                    disabled={isSavingSurvey}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", minWidth: "160px", justifyContent: "center" }}
                  >
                    <FiSave size={16} />
                    <span>{isSavingSurvey ? "Menyimpan ke Prisma..." : "Simpan Banner Survei"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
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
                    <select
                      className="admin-select"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    >
                      <option value="Pusat & Gudang Utama">Pusat & Gudang Utama</option>
                      <option value="Showroom Display">Showroom Display</option>
                      <option value="Showroom & Konsultasi">Showroom & Konsultasi</option>
                      <option value="Workshop Obras">Workshop Obras</option>
                      <option value="Agen Resmi">Agen Resmi</option>
                    </select>
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
                  <label>URL Foto Gedung / Showroom</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
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
                    <select
                      className="admin-select"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    >
                      <option value="Pusat & Gudang Utama">Pusat & Gudang Utama</option>
                      <option value="Showroom Display">Showroom Display</option>
                      <option value="Showroom & Konsultasi">Showroom & Konsultasi</option>
                      <option value="Workshop Obras">Workshop Obras</option>
                      <option value="Agen Resmi">Agen Resmi</option>
                    </select>
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
                  <label>URL Foto Gedung / Showroom</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
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
