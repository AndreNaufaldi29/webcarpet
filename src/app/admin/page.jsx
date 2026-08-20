"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { INITIAL_PORTFOLIOS } from "@/lib/data";
import { getStoredProducts, subscribeProducts, DEFAULT_PRODUCTS } from "@/lib/productStore";
import { getStoredTestimonials, subscribeTestimonials } from "@/lib/testimonialStore";

import {
  FiHome,
  FiBox,
  FiGrid,
  FiImage,
  FiMessageSquare,
  FiSettings,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiPlus,
  FiArrowRight,
  FiMapPin,
} from "react-icons/fi";

export default function AdminDashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsList, setProductsList] = useState(DEFAULT_PRODUCTS);
  const [testimonialsCount, setTestimonialsCount] = useState(4);

  useEffect(() => {
    setProductsList(getStoredProducts());
    setTestimonialsCount(getStoredTestimonials().length);

    const unsubProd = subscribeProducts((updated) => {
      setProductsList(updated);
    });

    const unsubTesti = subscribeTestimonials((updated) => {
      setTestimonialsCount(updated.length);
    });

    return () => {
      unsubProd();
      unsubTesti();
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
      change: "+1",
      color: "green",
      Icon: FiGrid,
    },
    {
      title: "Portfolio Proyek",
      value: INITIAL_PORTFOLIOS.length.toString(),
      change: "+8%",
      color: "purple",
      Icon: FiImage,
    },
    {
      title: "Testimonial Pelanggan",
      value: testimonialsCount.toString(),
      change: "+15%",
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
          title="Dashboard AB Carpet"
          breadcrumb="ADMIN PANEL"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT CONTAINER */}
        <div className="admin-content">
          {/* BANNER WELCOME */}
          <div className="admin-welcome-banner">
            <div>
              <h2>Selamat Datang di Admin Panel AB Carpet! 👋</h2>
              <p>Kelola katalog produk, portofolio pengerjaan, testimonial, dan manajemen pengguna aplikasi secara terpusat.</p>
            </div>
            <Link
              href="/admin/produk"
              className="primary-button"
            >
              <FiPlus /> Tambah Produk Baru
            </Link>
          </div>

          {/* STATS GRID */}
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
                <Link href="/admin/produk" className="secondary-button" style={{ textDecoration: "none" }}>
                  Lihat Semua
                </Link>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Kategori</th>
                      <th>Stok</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.slice(0, 5).map((prod) => (
                      <tr key={prod.id}>
                        <td style={{ fontWeight: "600" }}>{prod.name}</td>
                        <td>
                          <span className="badge-role">{prod.category}</span>
                        </td>
                        <td>{prod.stock} unit</td>
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
            </div>

            {/* RIGHT: QUICK ACTIONS & PORTFOLIO RINGKASAN */}
            <div className="admin-dashboard-sidebar">
              <div className="products-card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Akses Cepat Admin</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Link
                    href="/admin/user"
                    className="admin-quick-link"
                  >
                    <FiUsers className="quick-link-icon blue" size={18} />
                    <span>Manajemen User</span>
                  </Link>

                  <Link
                    href="/admin/produk"
                    className="admin-quick-link"
                  >
                    <FiBox className="quick-link-icon blue" size={18} />
                    <span>Kelola Produk</span>
                  </Link>

                  <Link
                    href="/admin/portfolio"
                    className="admin-quick-link"
                  >
                    <FiImage className="quick-link-icon blue" size={18} />
                    <span>Kelola Portofolio</span>
                  </Link>

                  <Link
                    href="/admin/testimonial"
                    className="admin-quick-link"
                  >
                    <FiMessageSquare className="quick-link-icon blue" size={18} />
                    <span>Kelola Testimonial</span>
                  </Link>

                  <Link
                    href="/admin/cabang"
                    className="admin-quick-link"
                  >
                    <FiMapPin className="quick-link-icon blue" size={18} />
                    <span>Kelola Cabang & Showroom</span>
                  </Link>
                </div>
              </div>

              {/* RECENT PORTFOLIO */}
              <div className="products-card" style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Proyek Terbaru</h3>
                  <Link href="/admin/portfolio" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>
                    Detail →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {INITIAL_PORTFOLIOS.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="admin-project-item-card"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.title}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.location} • {item.area}</span>
                      </div>
                    </div>
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