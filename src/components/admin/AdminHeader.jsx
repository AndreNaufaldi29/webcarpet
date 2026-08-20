"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMenu,
  FiBell,
  FiSun,
  FiMoon,
  FiUser,
  FiSettings,
  FiLogOut,
  FiExternalLink,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiChevronDown,
  FiShield,
  FiX,
  FiPackage,
} from "react-icons/fi";
import { getStoredTestimonials, subscribeTestimonials } from "@/lib/testimonialStore";
import { getStoredProducts, subscribeProducts } from "@/lib/productStore";
import { getCurrentUser, logout, subscribeAuth } from "@/lib/authStore";

export default function AdminHeader({
  title = "Dashboard",
  breadcrumb = "ADMIN PANEL",
  setMobileOpen,
}) {
  const router = useRouter();

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // Current logged in admin user
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // Dropdowns state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Realtime Data for Notifications
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Sync current user on mount & on auth change
  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const unsubAuth = subscribeAuth(() => {
      setCurrentUser(getCurrentUser());
    });
    return () => unsubAuth();
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      document.body.classList.contains("dark");
    setDarkMode(isDark);
    document.body.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    document.body.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("abcarpet:theme_changed", { detail: nextDark ? "dark" : "light" })
    );
  };

  // Load and subscribe to store updates for real-time notifications
  useEffect(() => {
    const updateNotifs = () => {
      const testimonials = getStoredTestimonials();
      const pending = testimonials.filter((t) => t.status === "Menunggu Persetujuan");
      setPendingTestimonials(pending);

      const prods = getStoredProducts();
      const lowStock = prods.filter((p) => Number(p.stock) <= 10);
      setLowStockProducts(lowStock);
    };

    updateNotifs();
    const unsubTesti = subscribeTestimonials(updateNotifs);
    const unsubProds = subscribeProducts(updateNotifs);

    return () => {
      unsubTesti();
      unsubProds();
    };
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const totalAlerts = pendingTestimonials.length + lowStockProducts.length;

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace("/admin/login");
  };


  return (
    <>
      <header className="admin-header">
        {/* LEFT: MOBILE TOGGLE & BREADCRUMB / TITLE */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setMobileOpen?.(true)}
            title="Buka Menu Sidebar"
            aria-label="Buka Menu Sidebar"
          >
            <FiMenu size={20} />
          </button>

          <div className="admin-header-title-box">
            <span className="breadcrumb">{breadcrumb}</span>
            <h1 className="admin-page-heading-title">{title}</h1>
          </div>
        </div>

        {/* RIGHT: THEME TOGGLE, NOTIFICATIONS & SUPER ADMIN USER PROFILE */}
        <div className="header-right">
          {/* THEME TOGGLE (WHITE MODE / DARK MODE) */}
          <button
            type="button"
            className="admin-theme-toggle-btn"
            onClick={toggleTheme}
            title={darkMode ? "Beralih ke Light Mode (Mode Terang)" : "Beralih ke Dark Mode (Mode Gelap)"}
            aria-label="Toggle White Mode and Dark Mode"
          >
            {darkMode ? (
              <>
                <FiSun size={17} className="theme-icon sun" />
                <span className="theme-text">Light</span>
              </>
            ) : (
              <>
                <FiMoon size={17} className="theme-icon moon" />
                <span className="theme-text">Dark</span>
              </>
            )}
          </button>

          {/* NOTIFICATION BELL DROPDOWN */}
          <div className="admin-header-dropdown-wrap" ref={notifRef}>
            <button
              type="button"
              className={`notification-button ${showNotifications ? "active" : ""}`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              title="Notifikasi Aktivitas & Review"
              aria-label="Notifikasi"
            >
              <FiBell size={18} />
              {totalAlerts > 0 && hasUnread && (
                <span className="notif-badge-pulse" />
              )}
            </button>

            {/* NOTIFICATIONS POPOVER */}
            {showNotifications && (
              <div className="admin-popover notif-popover">
                <div className="popover-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiBell size={16} />
                    <strong>Notifikasi Admin</strong>
                    {totalAlerts > 0 && (
                      <span className="popover-count-pill">{totalAlerts} Baru</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="popover-action-link"
                    onClick={() => setHasUnread(false)}
                  >
                    Tandai dibaca
                  </button>
                </div>

                <div className="popover-list">
                  {/* PENDING TESTIMONIAL NOTIF */}
                  {pendingTestimonials.length > 0 && (
                    <Link
                      href="/admin/testimonial"
                      className="popover-item alert"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="popover-item-icon orange">
                        <FiClock size={16} />
                      </div>
                      <div className="popover-item-content">
                        <strong>
                          {pendingTestimonials.length} Testimoni Baru Menunggu Persetujuan!
                        </strong>
                        <p>
                          Ulasan dari "{pendingTestimonials[0]?.name}" dan lainnya siap ditinjau.
                        </p>
                        <span className="popover-time">Perlu tindakan sekarang</span>
                      </div>
                    </Link>
                  )}

                  {/* LOW STOCK NOTIF */}
                  {lowStockProducts.length > 0 && (
                    <Link
                      href="/admin/produk"
                      className="popover-item warning"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="popover-item-icon yellow">
                        <FiAlertTriangle size={16} />
                      </div>
                      <div className="popover-item-content">
                        <strong>
                          {lowStockProducts.length} Produk Karpet Stok Menipis (≤10)
                        </strong>
                        <p>
                          "{lowStockProducts[0]?.name}" sisa {lowStockProducts[0]?.stock} unit.
                        </p>
                        <span className="popover-time">Katalog Produk</span>
                      </div>
                    </Link>
                  )}

                  {/* SYSTEM HEALTH NOTIF */}
                  <div className="popover-item info">
                    <div className="popover-item-icon blue">
                      <FiCheckCircle size={16} />
                    </div>
                    <div className="popover-item-content">
                      <strong>Sistem & Sinkronisasi Aktif</strong>
                      <p>Katalog produk, testimoni, dan portofolio terhubung optimal.</p>
                      <span className="popover-time">Status Sistem Normal</span>
                    </div>
                  </div>
                </div>

                <div className="popover-footer">
                  <Link
                    href="/admin/testimonial"
                    onClick={() => setShowNotifications(false)}
                  >
                    Lihat Semua Aktivitas Testimoni →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* SUPER ADMIN USER PROFILE DROPDOWN */}
          <div className="admin-header-dropdown-wrap" ref={profileRef}>
            <div
              className={`admin-profile ${showProfileMenu ? "active" : ""}`}
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              title={`Profil ${currentUser?.name || "Administrator"}`}
              role="button"
              tabIndex={0}
            >
              <div className="profile-avatar">
                <span>{currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A")}</span>
                <span className="avatar-online-dot" />
              </div>

              <div className="profile-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {currentUser?.name || "Administrator"}
                  <FiChevronDown size={13} style={{ color: "#94a3b8" }} />
                </strong>
                <small>{currentUser?.role || "Super Admin"}</small>
              </div>
            </div>

            {/* SUPER ADMIN PROFILE DROPDOWN MENU */}
            {showProfileMenu && (
              <div className="admin-popover profile-popover">
                {/* PROFILE CARD BANNER */}
                <div className="profile-dropdown-card">
                  <div className="profile-card-avatar">
                    {currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A")}
                  </div>
                  <div className="profile-card-info">
                    <h4>{currentUser?.name || "Administrator"}</h4>
                    <span className="profile-badge-super">
                      <FiShield size={11} /> {currentUser?.role || "Admin"}
                    </span>
                    <p>{currentUser?.email || "admin@abcarpet.com"}</p>
                  </div>
                </div>

                {/* THEME QUICK SWITCH INSIDE MENU */}
                <div className="profile-dropdown-theme-row">
                  <span>Tema Tampilan</span>
                  <div className="theme-segmented-control">
                    <button
                      type="button"
                      className={`theme-segment ${!darkMode ? "active" : ""}`}
                      onClick={() => darkMode && toggleTheme()}
                    >
                      <FiSun size={13} /> Light
                    </button>
                    <button
                      type="button"
                      className={`theme-segment ${darkMode ? "active" : ""}`}
                      onClick={() => !darkMode && toggleTheme()}
                    >
                      <FiMoon size={13} /> Dark
                    </button>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                {/* MENU LINKS */}
                <div className="profile-dropdown-links">
                  <Link
                    href="/admin/user"
                    className="profile-dropdown-link"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiUser size={15} />
                    <span>Manajemen User & Akun</span>
                  </Link>

                  <Link
                    href="/admin/pengaturan"
                    className="profile-dropdown-link"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiSettings size={15} />
                    <span>Pengaturan Website</span>
                  </Link>

                  <Link
                    href="/"
                    target="_blank"
                    className="profile-dropdown-link"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FiExternalLink size={15} />
                    <span>Kunjungi Website Publik</span>
                  </Link>
                </div>

                <div className="profile-dropdown-divider" />

                {/* LOGOUT BUTTON */}
                <button
                  type="button"
                  className="profile-dropdown-logout-btn"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <FiLogOut size={15} />
                  <span>Keluar dari Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONFIRM LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Konfirmasi Keluar</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowLogoutModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin keluar dari sesi <strong>{currentUser?.name || "Administrator"} ({currentUser?.role || "Admin"})</strong>?
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
