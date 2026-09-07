"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getStoredProducts, subscribeProducts, DEFAULT_PRODUCTS } from "@/lib/productStore";
import { getStoredTestimonials, subscribeTestimonials } from "@/lib/testimonialStore";
import { getStoredPortfolios, subscribePortfolios, DEFAULT_PORTFOLIOS } from "@/lib/portfolioStore";

import {
  FiHome,
  FiBox,
  FiGrid,
  FiImage,
  FiMessageSquare,
  FiBookOpen,
  FiSettings,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiPlus,
  FiArrowRight,
  FiMapPin,
  FiEye,
  FiEdit2,
  FiExternalLink,
} from "react-icons/fi";

export default function AdminDashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsList, setProductsList] = useState(DEFAULT_PRODUCTS);
  const [testimonialsCount, setTestimonialsCount] = useState(4);
  const [portfoliosCount, setPortfoliosCount] = useState(4);
  const [recentPortfolios, setRecentPortfolios] = useState(DEFAULT_PORTFOLIOS);

  useEffect(() => {
    setProductsList(getStoredProducts());
    setTestimonialsCount(getStoredTestimonials().length);
    const initialPorts = getStoredPortfolios();
    setPortfoliosCount(initialPorts.length);
    setRecentPortfolios(initialPorts);

    const unsubProd = subscribeProducts((updated) => {
      setProductsList(updated);
    });

    const unsubTesti = subscribeTestimonials((updated) => {
      setTestimonialsCount(updated.length);
    });

    const unsubPort = subscribePortfolios((updated) => {
      setPortfoliosCount(updated.length);
      setRecentPortfolios(updated);
    });

    return () => {
      unsubProd();
      unsubTesti();
      unsubPort();
    };
  }, []);

  const statistics = [
    {
      title: "Total Produk",
      value: productsList.length.toString(),
      change: "+12%",
      color: "blue",
      Icon: FiPackage,
    },
    {
      title: "Kategori Karpet",
      value: "6",
      change: "Aktif",
      color: "green",
      Icon: FiGrid,
    },
    {
      title: "Portfolio Proyek",
      value: portfoliosCount.toString(),
      change: "Selesai",
      color: "purple",
      Icon: FiImage,
    },
    {
      title: "Testimonial Pelanggan",
      value: testimonialsCount.toString(),
      change: "5.0 ★",
      color: "orange",
      Icon: FiMessageSquare,
    },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN CONTENT AREA */}
      <main className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* UNIFIED ADMIN HEADER */}
        <AdminHeader
          title="Dashboard Rumah Indah Carpet"
          breadcrumb="ADMIN PANEL / OVERVIEW"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT CONTAINER */}
        <div className="admin-content">
          {/* BANNER WELCOME */}
          <div className="admin-welcome-banner">
            <div>
              <h2>Selamat Datang di Admin Panel Rumah Indah Carpet! 👋</h2>
              <p>Kelola katalog produk karpet, dokumentasi portofolio, artikel edukasi SEO, testimonial, dan cabang toko secara terpusat.</p>
            </div>
            <Link
              href="/admin/produk"
              className="primary-button"
              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
            >
              <FiPlus size={16} /> Tambah Produk Baru
            </Link>
          </div>

          {/* STATS GRID (RESPONSIVE 4-COL DESKTOP / 2X2 MOBILE) */}
          <div className="stats-grid">
            {statistics.map((stat, idx) => {
              const StatIcon = stat.Icon;
              return (
                <div key={idx} className="stat-card">
                  <div className={`stat-icon ${stat.color}`}>
                    <StatIcon size={20} />
                  </div>
                  <div>
                    <span>{stat.title}</span>
                    <strong>{stat.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TWO COLUMN GRID FOR RECENT ITEMS & QUICK ACTIONS */}
          <div className="admin-dashboard-grid">
            {/* LEFT: PRODUCTS TABLE CARD */}
            <div className="products-card">
              <div className="products-card-header">
                <div>
                  <h3>Ringkasan Katalog Produk</h3>
                  <p>Daftar produk terbaru yang aktif di situs utama</p>
                </div>
                <Link
                  href="/admin/produk"
                  className="secondary-button"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <span>Lihat Semua</span>
                  <FiArrowRight size={12} />
                </Link>
              </div>

              {/* 1. DESKTOP VIEW: FULL TABLE (> 768px) */}
              <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Kategori</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.slice(0, 6).map((prod) => (
                      <tr key={prod.id}>
                        <td style={{ fontWeight: "600" }}>{prod.name}</td>
                        <td>
                          <span className="badge-role">{prod.category}</span>
                        </td>
                        <td>
                          <span
                            className={`badge-status ${
                              prod.status === "Aktif" ? "active" : "inactive"
                            }`}
                          >
                            {prod.status || "Aktif"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. MOBILE VIEW: FLUID CARD ITEMS (<= 768px) */}
              <div className="admin-dash-prod-list">
                {productsList.slice(0, 5).map((prod) => (
                  <div key={prod.id} className="admin-dash-prod-item">
                    <div className="admin-dash-prod-info">
                      <div className="admin-dash-prod-title">{prod.name}</div>
                      <div className="admin-dash-prod-meta">
                        <span className="badge-role" style={{ fontSize: "10.5px", padding: "2px 6px" }}>
                          {prod.category}
                        </span>
                        {prod.isFeatured && (
                          <>
                            <span>•</span>
                            <span style={{ color: "#eab308", fontWeight: 600, fontSize: "11px" }}>⭐ Unggulan</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`badge-status ${
                        prod.status === "Aktif" ? "active" : "inactive"
                      }`}
                      style={{ flexShrink: 0, fontSize: "11px", padding: "3px 8px" }}
                    >
                      {prod.status || "Aktif"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: QUICK ACTIONS & PORTFOLIO RINGKASAN */}
            <div className="admin-dashboard-sidebar">
              {/* QUICK LINKS */}
              <div className="products-card" style={{ padding: "20px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700 }}>
                  Akses Cepat Admin
                </h3>
                <div className="admin-quick-links-grid">
                  <Link href="/admin/user" className="admin-quick-link-card">
                    <div className="quick-icon">
                      <FiUsers size={15} />
                    </div>
                    <span>Manajemen User</span>
                  </Link>

                  <Link href="/admin/produk" className="admin-quick-link-card">
                    <div className="quick-icon">
                      <FiBox size={15} />
                    </div>
                    <span>Kelola Produk</span>
                  </Link>

                  <Link href="/admin/portfolio" className="admin-quick-link-card">
                    <div className="quick-icon">
                      <FiImage size={15} />
                    </div>
                    <span>Kelola Portofolio</span>
                  </Link>

                  <Link href="/admin/testimonial" className="admin-quick-link-card">
                    <div className="quick-icon">
                      <FiMessageSquare size={15} />
                    </div>
                    <span>Testimonial</span>
                  </Link>

                  <Link href="/admin/blog" className="admin-quick-link-card">
                    <div className="quick-icon">
                      <FiBookOpen size={15} />
                    </div>
                    <span>Artikel & SEO</span>
                  </Link>

                  <Link href="/admin/cabang" className="admin-quick-link-card">
                    <div className="quick-icon">
                      <FiMapPin size={15} />
                    </div>
                    <span>Cabang Showroom</span>
                  </Link>
                </div>
              </div>

              {/* RECENT PORTFOLIO */}
              <div className="products-card" style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Proyek Terbaru</h3>
                  <Link
                    href="/admin/portfolio"
                    style={{
                      fontSize: "12px",
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    Semua →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recentPortfolios.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/portfolio/${item.id}`}
                      target="_blank"
                      className="admin-project-item-card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        background: "#F4F7F5",
                        border: "1px solid #e2e8f0",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            fontSize: "12.5px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "#072016",
                          }}
                        >
                          {item.title}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {item.location} • {item.area}
                        </span>
                      </div>
                      <FiExternalLink size={13} color="#94a3b8" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}