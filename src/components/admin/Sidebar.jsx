"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/authStore";
import BrandLogo from "../BrandLogo";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiGrid,
  FiImage,
  FiMessageSquare,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

export default function Sidebar({
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const menus = [
    {
      name: "Dashboard",
      path: "/admin",
      Icon: FiHome,
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
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin keluar dari Admin Panel?")) {
                logout();
                router.replace("/admin/login");
              }
            }}
            title={collapsed ? "Keluar" : undefined}
          >
            <span className="sidebar-icon">
              <FiLogOut size={18} />
            </span>
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}