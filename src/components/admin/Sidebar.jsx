"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout, subscribeAuth } from "@/lib/authStore";
import BrandLogo from "../BrandLogo";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiGrid,
  FiImage,
  FiSliders,
  FiMessageSquare,
  FiBookOpen,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiGlobe,
} from "react-icons/fi";

export default function Sidebar({
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const unsubAuth = subscribeAuth(() => {
      setCurrentUser(getCurrentUser());
    });
    return () => unsubAuth();
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    window.location.replace("/admin/login?reason=logout");
  };

  const handleLogoutToWebsite = async () => {
    setShowLogoutModal(false);
    await logout();
    window.location.replace("/");
  };

  const menus = [
    {
      name: "Dashboard",
      path: "/admin",
      Icon: FiHome,
    },
    {
      name: "Carousel & Banner",
      path: "/admin/carousel",
      Icon: FiSliders,
    },
    {
      name: "Manajemen User",
      path: "/admin/user",
      Icon: FiUsers,
    },
    {
      name: "Produk",
      path: "/admin/produk",
      Icon: FiBox,
    },
    {
      name: "Kategori",
      path: "/admin/kategori",
      Icon: FiGrid,
    },
    {
      name: "Portfolio",
      path: "/admin/portfolio",
      Icon: FiImage,
    },
    {
      name: "Testimonial",
      path: "/admin/testimonial",
      Icon: FiMessageSquare,
    },
    {
      name: "Blog & Artikel",
      path: "/admin/blog",
      Icon: FiBookOpen,
    },
    {
      name: "Cabang",
      path: "/admin/cabang",
      Icon: FiMapPin,
    },
    {
      name: "Pengaturan",
      path: "/admin/pengaturan",
      Icon: FiSettings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "open" : ""
        }`}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          type="button"
          className="sidebar-collapse"
          onClick={() => setCollapsed?.(!collapsed)}
          title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>

        {/* LOGO & BRAND HEADER */}
        <div className="sidebar-logo">
          <div className="sidebar-brand">
            <div className="logo-box">
              <BrandLogo variant="icon-only" size="sm" />
            </div>
            {!collapsed && (
              <div className="logo-text">
                <strong>Rumah Indah</strong>
                <span>ADMIN PANEL</span>
              </div>
            )}
          </div>

          {/* Mobile Close Button (Mobile Only) */}
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={() => setMobileOpen?.(false)}
            aria-label="Tutup Sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* MENU NAVIGATION */}
        <div className="sidebar-section">
          {!collapsed && <span className="sidebar-label">NAVIGASI UTAMA</span>}

          <nav className="sidebar-menu">
            {menus.map((menu) => {
              const isActive =
                menu.path === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(menu.path);
              const MenuIcon = menu.Icon;

              return (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  onClick={() => setMobileOpen?.(false)}
                  title={collapsed ? menu.name : undefined}
                >
                  <span className="sidebar-icon">
                    <MenuIcon size={18} />
                  </span>
                  {!collapsed && <span>{menu.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM / LOGOUT */}
        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link logout"
            onClick={() => setShowLogoutModal(true)}
            title={collapsed ? "Keluar" : undefined}
          >
            <span className="sidebar-icon">
              <FiLogOut size={18} />
            </span>
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* CONFIRM LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                Konfirmasi Keluar
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowLogoutModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda ingin keluar dari sesi <strong>{currentUser?.name || "Administrator"} ({currentUser?.role || "Super Admin"})</strong>?
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Sesi admin akan ditutup dan akun akan dikunci secara aman.
              </p>
            </div>

            <div className="admin-modal-footer" style={{ gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={handleLogoutToWebsite}
              >
                <FiGlobe size={14} />
                <span>Keluar & Buka Website</span>
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleLogout}
              >
                <FiLogOut size={14} />
                <span>Keluar ke Login</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}