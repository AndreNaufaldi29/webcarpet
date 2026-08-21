"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredSettings,
  saveSettings,
  resetSettings,
  subscribeSettings,
  DEFAULT_SETTINGS,
} from "@/lib/settingsStore";
import {
  FiSave,
  FiGlobe,
  FiPhone,
  FiMail,
  FiMapPin,
  FiSettings,
  FiInstagram,
  FiFacebook,
  FiCheckCircle,
  FiTag,
  FiShare2,
  FiSearch,
  FiRotateCcw,
  FiMonitor,
  FiSmartphone,
  FiImage,
  FiExternalLink,
  FiCheck,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";

export default function PengaturanPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("seo"); // default to SEO tab as per user focus
  const [toastMessage, setToastMessage] = useState("");
  const [previewDevice, setPreviewDevice] = useState("desktop"); // desktop | mobile
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State initialized from persistent store
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const fetchSettingsFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings((prev) => ({
          ...prev,
          ...json.data,
          promoActive: String(json.data.promoActive),
        }));
        if (showNotification) {
          showToast("Pengaturan berhasil disinkronkan dari Database Prisma!");
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database pengaturan:", err);
      if (showNotification) {
        showToast("Koneksi database gagal, menampilkan pengaturan lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setSettings(getStoredSettings());
    fetchSettingsFromDB(false);
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSettings(settings);
      showToast("Pengaturan website & SEO berhasil disimpan ke Database Prisma!");
    } catch (err) {
      console.error("Gagal simpan pengaturan:", err);
      showToast("Gagal menyimpan ke database, pengaturan disimpan lokal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setIsSaving(true);
    try {
      const defaultData = await resetSettings();
      setSettings(defaultData);
      setShowResetModal(false);
      showToast("Pengaturan telah di-reset ke standar bawaan di Database Prisma!");
    } catch (err) {
      console.error("Gagal reset pengaturan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // SEO Calculation Helpers
  const titleLength = settings.metaTitle?.length || 0;
  const descLength = settings.metaDescription?.length || 0;

  const getTitleStatus = (len) => {
    if (len === 0) return { label: "Kosong", color: "#ef4444", status: "empty" };
    if (len < 40) return { label: "Terlalu Pendek", color: "#f59e0b", status: "short" };
    if (len <= 65) return { label: "Sempurna (Optimal)", color: "#10b981", status: "good" };
    return { label: "Terlalu Panjang (Akan Terpotong)", color: "#ef4444", status: "long" };
  };

  const getDescStatus = (len) => {
    if (len === 0) return { label: "Kosong", color: "#ef4444", status: "empty" };
    if (len < 100) return { label: "Terlalu Pendek", color: "#f59e0b", status: "short" };
    if (len <= 165) return { label: "Sempurna (Optimal)", color: "#10b981", status: "good" };
    return { label: "Terlalu Panjang (Snippet Terpotong)", color: "#ef4444", status: "long" };
  };

  const titleStatus = getTitleStatus(titleLength);
  const descStatus = getDescStatus(descLength);

  const cleanCanonicalUrl = settings.canonicalUrl?.replace(/\/$/, "") || "https://abcarpet.co.id";

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
          title="Pengaturan Website & SEO"
          breadcrumb="ADMIN PANEL / KONFIGURASI SISTEM"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT */}
        <div className="admin-content">
          {/* TABS NAVIGATION */}
          <div className="admin-settings-tabs">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "seo" ? "active" : ""}`}
              onClick={() => setActiveTab("seo")}
            >
              <FiSearch size={16} />
              <span>SEO & Metadata Google</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              <FiSettings size={16} />
              <span>Profil Toko & Kontak</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "social" ? "active" : ""}`}
              onClick={() => setActiveTab("social")}
            >
              <FiShare2 size={16} />
              <span>Media Sosial & Maps</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === "promo" ? "active" : ""}`}
              onClick={() => setActiveTab("promo")}
            >
              <FiTag size={16} />
              <span>Pengumuman & Promo</span>
            </button>

            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => fetchSettingsFromDB(true)}
              disabled={isSyncing}
              title="Sinkronkan pengaturan dengan database PostgreSQL melalui Prisma"
              style={{
                marginLeft: "auto",
                background: "rgba(59, 130, 246, 0.12)",
                borderColor: "rgba(59, 130, 246, 0.3)",
                color: "#60a5fa",
              }}
            >
              <FiSettings size={16} className={isSyncing ? "spin-icon" : ""} />
              <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* =========================================================
                TAB 1: SEO & METADATA
            ========================================================= */}
            {activeTab === "seo" && (
              <div className="admin-settings-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <h3 className="admin-settings-section-title">Optimasi Mesin Pencari (SEO) & Open Graph</h3>
                    <p className="admin-settings-section-subtitle" style={{ marginBottom: 0 }}>
                      Konfigurasi judul, deskripsi, kata kunci pencarian, dan pratinjau kartu sosial yang terbaca oleh Google, WhatsApp, dan Facebook.
                    </p>
                  </div>
                  <span className="seo-live-badge">
                    <span className="live-dot" /> Sinkron Realtime
                  </span>
                </div>

                {/* GOOGLE SERP SIMULATOR CARD */}
                <div className="serp-preview-container">
                  <div className="serp-header">
                    <div className="serp-title-group">
                      <span className="google-logo-text">
                        <span style={{ color: "#4285F4" }}>G</span>
                        <span style={{ color: "#EA4335" }}>o</span>
                        <span style={{ color: "#FBBC05" }}>o</span>
                        <span style={{ color: "#4285F4" }}>g</span>
                        <span style={{ color: "#34A853" }}>l</span>
                        <span style={{ color: "#EA4335" }}>e</span>
                      </span>
                      <span className="serp-tag">Pratinjau Hasil Pencarian (Live SERP)</span>
                    </div>

                    <div className="serp-device-toggle">
                      <button
                        type="button"
                        className={`device-btn ${previewDevice === "desktop" ? "active" : ""}`}
                        onClick={() => setPreviewDevice("desktop")}
                      >
                        <FiMonitor size={13} /> Desktop
                      </button>
                      <button
                        type="button"
                        className={`device-btn ${previewDevice === "mobile" ? "active" : ""}`}
                        onClick={() => setPreviewDevice("mobile")}
                      >
                        <FiSmartphone size={13} /> Mobile
                      </button>
                    </div>
                  </div>

                  <div className={`serp-body ${previewDevice}`}>
                    <div className="serp-url-row">
                      <span className="serp-favicon">🏢</span>
                      <div className="serp-url-text">
                        <span className="serp-domain">{cleanCanonicalUrl}</span>
                        <span className="serp-breadcrumb"> › karpet-masjid-hotel-premium</span>
                      </div>
                    </div>

                    <h4 className="serp-title">
                      {settings.metaTitle || "Rumah Indah Carpet - Produsen & Toko Karpet Masjid & Hotel Premium Sidoarjo Surabaya"}
                    </h4>

                    <p className="serp-snippet">
                      <span className="serp-date">
                        {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} —{" "}
                      </span>
                      {settings.metaDescription ||
                        "Pusat karpet masjid, karpet hotel, karpet kantor, dan karpet custom berkualitas tinggi dengan harga distributor langsung. Gratis konsultasi & pemasangan rapi."}
                    </p>
                  </div>
                </div>

                {/* FORM FIELDS WITH LIVE CHARACTER COUNTERS */}
                <div className="admin-settings-grid" style={{ marginTop: "24px" }}>
                  {/* META TITLE */}
                  <div className="admin-form-group">
                    <div className="field-label-row">
                      <label>
                        Default Meta Title <span className="required">*</span>
                      </label>
                      <div className="char-badge" style={{ color: titleStatus.color, borderColor: titleStatus.color }}>
                        <span>{titleLength}/60 Karakter</span> • <strong>{titleStatus.label}</strong>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="metaTitle"
                      className="admin-input"
                      value={settings.metaTitle}
                      onChange={handleChange}
                      placeholder="Masukkan judul website yang menarik untuk Google..."
                      required
                    />
                    <div className="char-progress-bar">
                      <div
                        className="char-progress-fill"
                        style={{
                          width: `${Math.min((titleLength / 60) * 100, 100)}%`,
                          backgroundColor: titleStatus.color,
                        }}
                      />
                    </div>
                    <span className="helper-text">
                      Judul utama website yang muncul di tab browser dan hasil pencarian Google. Disarankan 50 - 60 karakter.
                    </span>
                  </div>

                  {/* META DESCRIPTION */}
                  <div className="admin-form-group">
                    <div className="field-label-row">
                      <label>
                        Default Meta Description <span className="required">*</span>
                      </label>
                      <div className="char-badge" style={{ color: descStatus.color, borderColor: descStatus.color }}>
                        <span>{descLength}/160 Karakter</span> • <strong>{descStatus.label}</strong>
                      </div>
                    </div>
                    <textarea
                      name="metaDescription"
                      className="admin-textarea"
                      rows={3}
                      value={settings.metaDescription}
                      onChange={handleChange}
                      placeholder="Tuliskan rangkuman bisnis yang padat, jelas, dan memikat calon pembeli..."
                      required
                    />
                    <div className="char-progress-bar">
                      <div
                        className="char-progress-fill"
                        style={{
                          width: `${Math.min((descLength / 160) * 100, 100)}%`,
                          backgroundColor: descStatus.color,
                        }}
                      />
                    </div>
                    <span className="helper-text">
                      Deskripsi singkat yang muncul di bawah judul Google. Panjang ideal antara 140 - 160 karakter.
                    </span>
                  </div>

                  {/* KEYWORDS */}
                  <div className="admin-form-group">
                    <label>Kata Kunci Utama (Meta Keywords)</label>
                    <input
                      type="text"
                      name="metaKeywords"
                      className="admin-input"
                      value={settings.metaKeywords}
                      onChange={handleChange}
                      placeholder="karpet masjid, karpet hotel, karpet kantor, karpet sidoarjo, karpet surabaya..."
                    />
                    <span className="helper-text">
                      Pisahkan setiap kata kunci dengan tanda koma (,). Kata kunci ini membantu metadata penelusuran.
                    </span>
                  </div>

                  <div className="admin-form-row">
                    {/* CANONICAL URL */}
                    <div className="admin-form-group">
                      <label>URL Kanonikal Utama (Canonical Base URL)</label>
                      <input
                        type="url"
                        name="canonicalUrl"
                        className="admin-input"
                        value={settings.canonicalUrl || ""}
                        onChange={handleChange}
                        placeholder="https://abcarpet.co.id"
                      />
                      <span className="helper-text">
                        URL domain resmi untuk mencegah masalah konten ganda di mesin pencari.
                      </span>
                    </div>

                    {/* ROBOTS INDEX */}
                    <div className="admin-form-group">
                      <label>Pengaturan Indexing Mesin Pencari (Robots)</label>
                      <select
                        name="robotsIndex"
                        className="admin-select"
                        value={settings.robotsIndex || "index, follow"}
                        onChange={handleChange}
                      >
                        <option value="index, follow">Izinkan Google Mengindeks Website (index, follow)</option>
                        <option value="noindex, nofollow">Sembunyikan dari Google (noindex, nofollow)</option>
                      </select>
                      <span className="helper-text">
                        Pilih &quot;index, follow&quot; agar website muncul dalam pencarian Google.
                      </span>
                    </div>
                  </div>

                  {/* OPEN GRAPH IMAGE (SHARE PREVIEW) */}
                  <div className="admin-form-group">
                    <label>URL Gambar Banner Berbagi Media Sosial (Open Graph Image)</label>
                    <input
                      type="url"
                      name="ogImage"
                      className="admin-input"
                      value={settings.ogImage || ""}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/... (Ukuran disarankan 1200x630px)"
                    />

                    {/* SOCIAL SHARE CARD PREVIEW */}
                    <div className="social-card-preview-box">
                      <div className="social-card-badge">
                        <FaWhatsapp size={14} color="#25D366" />
                        <span>Pratinjau Kartu Link WhatsApp / Facebook / LinkedIn</span>
                      </div>
                      <div className="social-card-body">
                        <div className="social-card-image-wrap">
                          {settings.ogImage ? (
                            <img
                              src={settings.ogImage}
                              alt="Social preview"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";
                              }}
                            />
                          ) : (
                            <div className="social-card-placeholder">
                              <FiImage size={24} />
                              <span>Belum ada gambar OG</span>
                            </div>
                          )}
                        </div>
                        <div className="social-card-info">
                          <span className="social-card-domain">RUMAHINDAHCARPET.CO.ID</span>
                          <h5 className="social-card-title">{settings.metaTitle || "Rumah Indah Carpet"}</h5>
                          <p className="social-card-desc">{settings.metaDescription || "Pusat Karpet Premium"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 2: PROFIL & KONTAK TOKO
            ========================================================= */}
            {activeTab === "general" && (
              <div className="admin-settings-card">
                <h3 className="admin-settings-section-title">Informasi & Kontak Perusahaan</h3>
                <p className="admin-settings-section-subtitle">
                  Informasi ini akan ditampilkan di navbar, footer, JSON-LD Schema Google, dan halaman kontak website.
                </p>

                <div className="admin-settings-grid">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Nama Perusahaan / Brand <span className="required">*</span></label>
                      <input
                        type="text"
                        name="companyName"
                        className="admin-input"
                        value={settings.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Tagline Bisnis</label>
                      <input
                        type="text"
                        name="tagline"
                        className="admin-input"
                        value={settings.tagline}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Nomor WhatsApp CS (Untuk Tombol Chat)</label>
                      <input
                        type="text"
                        name="whatsapp"
                        className="admin-input"
                        value={settings.whatsapp}
                        onChange={handleChange}
                        placeholder="Contoh: 08212128701"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Telepon Kantor</label>
                      <input
                        type="text"
                        name="phone"
                        className="admin-input"
                        value={settings.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Alamat Email Resmi</label>
                      <input
                        type="email"
                        name="email"
                        className="admin-input"
                        value={settings.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Jam Kerja Operasional</label>
                      <input
                        type="text"
                        name="workingHours"
                        className="admin-input"
                        value={settings.workingHours}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Alamat Toko & Workshop Utama</label>
                    <input
                      type="text"
                      name="address"
                      className="admin-input"
                      value={settings.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Deskripsi Singkat Tentang Kami</label>
                    <textarea
                      name="description"
                      className="admin-textarea"
                      rows={4}
                      value={settings.description}
                      onChange={handleChange}
                    />
                    <span className="helper-text">
                      Deskripsi ini muncul pada bagian footer dan profil Schema.org Structured Data Google.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 3: MEDIA SOSIAL & MAPS
            ========================================================= */}
            {activeTab === "social" && (
              <div className="admin-settings-card">
                <h3 className="admin-settings-section-title">Tautan Media Sosial & Google Maps</h3>
                <p className="admin-settings-section-subtitle">
                  Tautan akun resmi untuk membangun kepercayaan dan memudahkan pelanggan mengunjungi toko fisik.
                </p>

                <div className="admin-settings-grid">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Instagram URL</label>
                      <input
                        type="url"
                        name="instagram"
                        className="admin-input"
                        value={settings.instagram}
                        onChange={handleChange}
                        placeholder="https://instagram.com/..."
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Facebook Fanpage URL</label>
                      <input
                        type="url"
                        name="facebook"
                        className="admin-input"
                        value={settings.facebook}
                        onChange={handleChange}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>TikTok URL</label>
                      <input
                        type="url"
                        name="tiktok"
                        className="admin-input"
                        value={settings.tiktok}
                        onChange={handleChange}
                        placeholder="https://tiktok.com/@..."
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>YouTube Channel URL</label>
                      <input
                        type="url"
                        name="youtube"
                        className="admin-input"
                        value={settings.youtube}
                        onChange={handleChange}
                        placeholder="https://youtube.com/@..."
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Tautan Lokasi Google Maps</label>
                    <input
                      type="url"
                      name="mapsUrl"
                      className="admin-input"
                      value={settings.mapsUrl}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/..."
                    />
                    <span className="helper-text">
                      Link yang akan terbuka saat tombol navigasi Google Maps diklik di website.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 4: BANNER PROMO & PENGUMUMAN
            ========================================================= */}
            {activeTab === "promo" && (
              <div className="admin-settings-card">
                <h3 className="admin-settings-section-title">Banner Pengumuman & Promo Beranda</h3>
                <p className="admin-settings-section-subtitle">
                  Atur banner promosi berjalan atau pengumuman khusus di bagian atas seluruh halaman website.
                </p>

                {/* PROMO LIVE PREVIEW */}
                {settings.promoActive === "true" && settings.promoText && (
                  <div className="admin-promo-preview-box">
                    <span className="preview-label">Pratinjau Banner di Website Publik:</span>
                    <div className="promo-top-banner" style={{ position: "static", borderRadius: "10px", margin: "10px 0" }}>
                      <div className="promo-banner-container">
                        <div className="promo-banner-content">
                          <span className="promo-badge">
                            <FiTag size={12} />
                            <span>PROMO SPESIAL</span>
                          </span>
                          <p className="promo-text">{settings.promoText}</p>
                        </div>
                        <div className="promo-banner-actions">
                          <span className="promo-btn" style={{ pointerEvents: "none" }}>
                            Klaim Promo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="admin-settings-grid">
                  <div className="admin-form-group">
                    <label>Status Banner Promo</label>
                    <select
                      name="promoActive"
                      className="admin-select"
                      value={settings.promoActive}
                      onChange={handleChange}
                    >
                      <option value="true">Aktif (Tampilkan Pengumuman di Atas Website)</option>
                      <option value="false">Nonaktifkan (Sembunyikan Banner)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Teks Pengumuman Promo</label>
                    <textarea
                      name="promoText"
                      className="admin-textarea"
                      rows={3}
                      value={settings.promoText}
                      onChange={handleChange}
                      placeholder="🎉 Tuliskan promo atau pengumuman khusus untuk pengunjung..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tautan Tujuan Tombol Promo (Opsional)</label>
                    <input
                      type="text"
                      name="promoLink"
                      className="admin-input"
                      value={settings.promoLink || ""}
                      onChange={handleChange}
                      placeholder="https://wa.me/628212128701 atau /catalog"
                    />
                    <span className="helper-text">
                      Kosongkan untuk otomatis mengarahkan ke kontak WhatsApp resmi.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (SUBMIT & RESET) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowResetModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px" }}
              >
                <FiRotateCcw size={16} />
                <span>Reset ke Pengaturan Default</span>
              </button>

              <button
                type="submit"
                className="admin-btn-primary"
                style={{ padding: "12px 28px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FiSave size={18} />
                <span>Simpan Semua Pengaturan</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* MODAL RESET CONFIRMATION */}
      {showResetModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626" }}>
                <FiAlertCircle size={20} /> Konfirmasi Reset Pengaturan
              </h3>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                Apakah Anda yakin ingin mengembalikan semua konfigurasi website (Profil Toko, SEO Title & Description, Sosial Media, dan Promo) kembali ke pengaturan standar awal?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                style={{ background: "#dc2626" }}
                onClick={handleResetConfirm}
              >
                Ya, Reset Sekarang
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
