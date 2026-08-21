"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredProducts,
  saveProducts,
  subscribeProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  duplicateProduct,
} from "@/lib/productStore";
import {
  getStoredCategories,
  subscribeCategories,
  syncCategoriesFromDatabase,
} from "@/lib/categoryStore";

import {
  Search,
  Plus,
  Package,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Pencil,
  Trash2,
  Bell,
  Menu,
  X,
  ExternalLink,
  Copy,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

export default function ProductsPage() {
  /* =====================================================
     SIDEBAR STATE
  ===================================================== */
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =====================================================
     PRODUCT STATE & SUBSCRIPTION
  ===================================================== */
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  // Dropdown menu state
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Form State
  const initialFormState = {
    name: "",
    category: "Karpet Masjid",
    stock: 10,
    status: "Aktif",
    rating: 5,
    description: "",
    image: "",
    isFeatured: false,
    isNew: false,
    material: "Polypropylene Premium",
    thickness: "12 mm",
    color: "Maroon / Hijau",
    warranty: "1 Tahun",
    size: "Custom Sesuai Ruangan",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProductsFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      // Sync products
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
        saveProducts(json.data);
      }

      // Also sync categories from DB
      const dbCategories = await syncCategoriesFromDatabase();
      if (Array.isArray(dbCategories)) {
        setCategoriesList(dbCategories);
      }

      if (showNotification) {
        showToast("Data produk & kategori berhasil disinkronkan dari Database Prisma!");
      }
    } catch (err) {
      console.warn("Gagal sinkron database produk & kategori:", err);
      if (showNotification) {
        showToast("Koneksi database gagal, menampilkan cache lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Load products & categories and listen to real-time store updates
  useEffect(() => {
    setProducts(getStoredProducts());
    setCategoriesList(getStoredCategories());
    fetchProductsFromDB(false);

    const unsubProducts = subscribeProducts((updated) => {
      setProducts(updated);
    });

    const unsubCategories = subscribeCategories((updated) => {
      setCategoriesList(updated);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".more-button-container")) {
        setActiveDropdownId(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  /* =====================================================
     HANDLERS FOR MODALS & ACTIONS
  ===================================================== */
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "Karpet Masjid",
      stock: product.stock !== undefined ? product.stock : 10,
      status: product.status || "Aktif",
      rating: product.rating || 5,
      description: product.description || "",
      image: product.images?.[0] || "",
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
      material: product.specifications?.Material || "Polypropylene Premium",
      thickness: product.specifications?.Ketebalan || "12 mm",
      color: product.specifications?.Warna || "Maroon / Hijau",
      warranty: product.specifications?.Garansi || "1 Tahun",
      size: product.specifications?.Ukuran || "Custom Sesuai Ruangan",
    });
    setShowEditModal(true);
    setActiveDropdownId(null);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
    setActiveDropdownId(null);
  };

  const handleToggleStatus = async (product) => {
    await toggleProductStatus(product.id);
    const nextStatus = product.status === "Aktif" ? "Nonaktif" : "Aktif";
    showToast(`Status produk "${product.name}" diubah menjadi ${nextStatus}!`);
    setActiveDropdownId(null);
  };

  const handleDuplicate = async (product) => {
    await duplicateProduct(product.id);
    showToast(`Produk "${product.name}" berhasil diduplikat ke database!`);
    setActiveDropdownId(null);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  /* =====================================================
     SAVE NEW PRODUCT
  ===================================================== */
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Nama produk wajib diisi!");
      return;
    }

    const newProd = await addProduct({
      name: formData.name,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      status: formData.status,
      rating: Number(formData.rating) || 5,
      description: formData.description,
      images: formData.image ? [formData.image] : [],
      isFeatured: Boolean(formData.isFeatured),
      isNew: Boolean(formData.isNew),
      specifications: {
        Material: formData.material,
        Ketebalan: formData.thickness,
        Warna: formData.color,
        Garansi: formData.warranty,
        Ukuran: formData.size,
      },
    });

    setShowAddModal(false);
    showToast(`Produk "${newProd.name}" berhasil disimpan ke Database!`);
  };

  /* =====================================================
     SAVE EDIT PRODUCT
  ===================================================== */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !formData.name.trim()) return;

    await updateProduct(selectedProduct.id, {
      name: formData.name,
      category: formData.category,
      stock: Number(formData.stock) || 0,
      status: formData.status,
      rating: Number(formData.rating) || 5,
      description: formData.description,
      images: formData.image ? [formData.image] : selectedProduct.images,
      isFeatured: Boolean(formData.isFeatured),
      isNew: Boolean(formData.isNew),
      specifications: {
        Material: formData.material,
        Ketebalan: formData.thickness,
        Warna: formData.color,
        Garansi: formData.warranty,
        Ukuran: formData.size,
      },
    });

    setShowEditModal(false);
    showToast(`Produk "${formData.name}" berhasil diperbarui di Database!`);
  };

  /* =====================================================
     CONFIRM DELETE
  ===================================================== */
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct.id);
    setShowDeleteModal(false);
    showToast(`Produk "${selectedProduct.name}" berhasil dihapus dari Database.`);
  };

  /* =====================================================
     EXPORT TO CSV
  ===================================================== */
  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast("Tidak ada produk untuk diekspor.");
      return;
    }

    const headers = ["ID", "Nama Produk", "Kategori", "Stok", "Status", "Rating", "Material", "Ketebalan"];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      p.stock,
      p.status,
      p.rating || 5,
      `"${p.specifications?.Material || ""}"`,
      `"${p.specifications?.Ketebalan || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daftar_produk_abcarpet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Berhasil mengekspor ${filteredProducts.length} produk ke file CSV!`);
  };

  /* =====================================================
     FILTER PRODUCT
  ===================================================== */
  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      (product.name || "").toLowerCase().includes(searchLower) ||
      (product.id || "").toString().includes(searchLower) ||
      (product.category || "").toLowerCase().includes(searchLower);

    const matchCategory =
      category === "Semua Kategori" || product.category === category;

    const matchStatus =
      statusFilter === "Semua Status" ||
      (statusFilter === "Aktif" && product.status === "Aktif") ||
      (statusFilter === "Nonaktif" && product.status === "Nonaktif") ||
      (statusFilter === "Stok Menipis" && Number(product.stock) <= 10);

    return matchSearch && matchCategory && matchStatus;
  });

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Aktif").length;
  const lowStockProducts = products.filter((p) => Number(p.stock) <= 10).length;
  const uniqueCategories = new Set(products.map((p) => p.category)).size;

  return (
    <div className="admin-layout">
      {/* =================================================
          SIDEBAR
      ================================================= */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* =================================================
          MAIN
      ================================================= */}
      <main className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* =================================================
            HEADER
        ================================================= */}
        <AdminHeader
          title="Kelola Produk"
          breadcrumb="ADMIN / KATALOG"
          setMobileOpen={setMobileOpen}
        />

        {/* =================================================
            CONTENT
        ================================================= */}
        <section className="admin-content">
          {/* =================================================
              PAGE HEADING & ACTION
          ================================================= */}
          <div className="page-heading">
            <div>
              <h2>Katalog Produk Karpet</h2>
              <p>Kelola seluruh katalog produk karpet Rumah Indah Carpet secara terpusat.</p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => fetchProductsFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan data dengan database PostgreSQL melalui Prisma"
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
                <Package size={15} className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleOpenAdd}
              >
                <Plus size={17} />
                <span>Tambah Produk</span>
              </button>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}
          <div className="stats-grid">
            {/* TOTAL PRODUK */}
            <div className="stat-card">
              <div className="stat-icon blue">
                <Package size={21} />
              </div>
              <div>
                <span>Total Produk</span>
                <strong>{totalProducts}</strong>
              </div>
            </div>

            {/* PRODUK AKTIF */}
            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <span>Produk Aktif</span>
                <strong>{activeProducts}</strong>
              </div>
            </div>

            {/* STOK MENIPIS */}
            <div className="stat-card">
              <div className="stat-icon orange">
                <AlertTriangle size={21} />
              </div>
              <div>
                <span>Stok Menipis (≤10)</span>
                <strong>{lowStockProducts}</strong>
              </div>
            </div>

            {/* KATEGORI */}
            <div className="stat-card">
              <div className="stat-icon purple">
                <TagsIcon />
              </div>
              <div>
                <span>Kategori</span>
                <strong>{uniqueCategories || 5}</strong>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT CARD
          ================================================= */}
          <div className="products-card">
            {/* CARD HEADER */}
            <div className="products-card-header">
              <div>
                <h3>Daftar Produk Karpet</h3>
                <p>{filteredProducts.length} dari {totalProducts} produk terdaftar</p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={handleExportCSV}
                title="Ekspor daftar produk ke CSV"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>

            {/* =================================================
                TOOLBAR & FILTERS
            ================================================= */}
            <div className="product-toolbar" style={{ flexWrap: "wrap", gap: "12px" }}>
              {/* SEARCH */}
              <div className="search-box" style={{ flex: "1 1 260px" }}>
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Cari nama produk atau ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* CATEGORY SELECT */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* STATUS FILTER */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="category-select"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Aktif">✓ Status Aktif</option>
                <option value="Nonaktif">Status Nonaktif</option>
                <option value="Stok Menipis">⚠️ Stok Menipis (≤10)</option>
              </select>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const isLowStock = Number(product.stock) <= 10;
                      const isDropdownOpen = activeDropdownId === product.id;
                      const coverImg = product.images?.[0];

                      return (
                        <tr key={product.id}>
                          {/* PRODUK */}
                          <td>
                            <div className="product-info">
                              <div
                                className="product-image"
                                style={{ overflow: "hidden", position: "relative" }}
                              >
                                {coverImg ? (
                                  <img
                                    src={coverImg}
                                    alt={product.name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                ) : (
                                  <Package size={19} />
                                )}
                              </div>

                              <div>
                                <strong>{product.name}</strong>
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "2px", flexWrap: "wrap" }}>
                                  <span>ID #{product.id}</span>
                                  {product.isFeatured && (
                                    <span style={{ fontSize: "10px", background: "rgba(234, 179, 8, 0.18)", color: "#facc15", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, border: "1px solid rgba(234, 179, 8, 0.3)" }}>
                                      ⭐ Unggulan
                                    </span>
                                  )}
                                  {product.isNew && (
                                    <span style={{ fontSize: "10px", background: "rgba(34, 197, 94, 0.18)", color: "#4ade80", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                                      🔥 Terbaru
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* KATEGORI */}
                          <td>
                            <span className="category-badge">
                              {product.category}
                            </span>
                          </td>

                          {/* STOK */}
                          <td>
                            <strong className={`product-stock-text ${isLowStock ? "low-stock" : ""}`}>
                              {product.stock} unit
                              {isLowStock && (
                                <AlertTriangle size={13} className="low-stock-icon" title="Stok menipis" />
                              )}
                            </strong>
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`status ${
                                product.status === "Aktif" ? "active" : "inactive"
                              }`}
                            >
                              {product.status || "Aktif"}
                            </span>
                          </td>

                          {/* AKSI */}
                          <td>
                            <div
                              className="action-buttons"
                              style={{ justifyContent: "center", position: "relative" }}
                            >
                              {/* EDIT BUTTON */}
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() => handleOpenEdit(product)}
                                title={`Edit ${product.name}`}
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil size={15} />
                              </button>

                              {/* DELETE BUTTON */}
                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => handleOpenDelete(product)}
                                title={`Hapus ${product.name}`}
                                aria-label={`Hapus ${product.name}`}
                              >
                                <Trash2 size={15} />
                              </button>

                              {/* MORE BUTTON & DROPDOWN */}
                              <div className="more-button-container" style={{ position: "relative" }}>
                                <button
                                  type="button"
                                  className="more-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(
                                      isDropdownOpen ? null : product.id
                                    );
                                  }}
                                  title="Menu opsi lainnya"
                                  aria-label="Menu opsi lainnya"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {/* DROPDOWN MENU */}
                                {isDropdownOpen && (
                                  <div
                                    className="admin-action-menu-dropdown"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Link
                                      href={`/product/${product.id}`}
                                      target="_blank"
                                      className="admin-action-menu-item"
                                    >
                                      <ExternalLink size={14} color="#2563eb" />
                                      <span>Lihat di Website</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(product)}
                                      className="admin-action-menu-item"
                                    >
                                      {product.status === "Aktif" ? (
                                        <>
                                          <ToggleLeft size={14} color="#ea580c" />
                                          <span>Nonaktifkan</span>
                                        </>
                                      ) : (
                                        <>
                                          <ToggleRight size={14} color="#16a34a" />
                                          <span>Aktifkan Produk</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDuplicate(product)}
                                      className="admin-action-menu-item"
                                    >
                                      <Copy size={14} color="#6366f1" />
                                      <span>Duplikat Produk</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                        <Package size={36} color="#94a3b8" style={{ marginBottom: "10px" }} />
                        <h4 style={{ margin: "0 0 6px" }}>Tidak ada produk ditemukan</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                          Coba sesuaikan kata kunci pencarian atau filter kategori Anda.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* =================================================
          MODAL TAMBAH PRODUK
      ================================================= */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "620px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Tambah Produk Baru</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNew}>
              <div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {/* NAMA PRODUK */}
                <div className="admin-form-group">
                  <label>
                    Nama Produk Karpet <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Karpet Masjid Premium Turkish"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* KATEGORI & STOK */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kategori Karpet</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>
                      Jumlah Stok (Unit / Roll) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                {/* STATUS & RATING */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Status Publikasi</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Aktif">Aktif (Tampilkan di Katalog)</option>
                      <option value="Nonaktif">Nonaktif (Draft)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Rating Produk</label>
                    <select
                      className="admin-select"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                      <option value="3">⭐⭐⭐ (3 Bintang)</option>
                    </select>
                  </div>
                </div>

                {/* TAMPILAN BERANDA (KOLEKSI UNGGULAN & PRODUK TERBARU) */}
                <div className="admin-form-group" style={{ background: "rgba(59, 130, 246, 0.08)", padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.22)", marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "block" }}>
                    Penempatan di Halaman Beranda User
                  </label>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#f1f5f9", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        style={{ width: "16px", height: "16px", accentColor: "#eab308", cursor: "pointer" }}
                      />
                      <span>⭐ <strong>Koleksi Unggulan</strong> (Tampil di section Beranda)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#f1f5f9", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        style={{ width: "16px", height: "16px", accentColor: "#22c55e", cursor: "pointer" }}
                      />
                      <span>🔥 <strong>Produk Terbaru</strong> (Tampil di section Beranda)</span>
                    </label>
                  </div>
                </div>

                {/* GAMBAR PRODUK */}
                <div className="admin-form-group">
                  <label>URL Gambar atau Unggah Foto</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Masukkan URL Gambar (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <label className="admin-upload-btn">
                      <Upload size={14} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div
                      style={{
                        width: "100%",
                        height: "140px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        background: "#0f172a",
                      }}
                    >
                      <img
                        src={formData.image}
                        alt="Pratinjau Foto Produk"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>

                {/* DESKRIPSI */}
                <div className="admin-form-group">
                  <label>Deskripsi Produk</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder="Tuliskan keunggulan bahan, kelembutan, dan ketahanan karpet..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* SPESIFIKASI TEKNIS */}
                <div className="admin-specs-box">
                  <h4 className="admin-specs-heading">
                    📋 Spesifikasi Teknis Produk
                  </h4>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Material Bahan</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Contoh: Polypropylene Premium"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Ketebalan</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Contoh: 12 mm"
                        value={formData.thickness}
                        onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Pilihan Warna</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Contoh: Maroon / Hijau"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Garansi</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Contoh: 1 Tahun"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label style={{ fontSize: "11px" }}>Ukuran</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Contoh: Custom Sesuai Ruangan / Tile 50x50"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
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
                  Simpan Produk Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL EDIT PRODUK
      ================================================= */}
      {showEditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "620px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Edit Data Produk</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {/* NAMA PRODUK */}
                <div className="admin-form-group">
                  <label>
                    Nama Produk Karpet <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* KATEGORI & STOK */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Kategori Karpet</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>
                      Jumlah Stok (Unit / Roll) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                {/* STATUS & RATING */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Status Publikasi</label>
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Aktif">Aktif (Tampilkan di Katalog)</option>
                      <option value="Nonaktif">Nonaktif (Draft)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Rating Produk</label>
                    <select
                      className="admin-select"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                      <option value="3">⭐⭐⭐ (3 Bintang)</option>
                    </select>
                  </div>
                </div>

                {/* TAMPILAN BERANDA (KOLEKSI UNGGULAN & PRODUK TERBARU) */}
                <div className="admin-form-group" style={{ background: "rgba(59, 130, 246, 0.08)", padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.22)", marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "block" }}>
                    Penempatan di Halaman Beranda User
                  </label>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#f1f5f9", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        style={{ width: "16px", height: "16px", accentColor: "#eab308", cursor: "pointer" }}
                      />
                      <span>⭐ <strong>Koleksi Unggulan</strong> (Tampil di section Beranda)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#f1f5f9", fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        style={{ width: "16px", height: "16px", accentColor: "#22c55e", cursor: "pointer" }}
                      />
                      <span>🔥 <strong>Produk Terbaru</strong> (Tampil di section Beranda)</span>
                    </label>
                  </div>
                </div>

                {/* GAMBAR PRODUK */}
                <div className="admin-form-group">
                  <label>URL Gambar atau Unggah Foto</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Masukkan URL Gambar (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <label className="admin-upload-btn">
                      <Upload size={14} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div
                      style={{
                        width: "100%",
                        height: "140px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        background: "#0f172a",
                      }}
                    >
                      <img
                        src={formData.image}
                        alt="Pratinjau Foto Produk"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>

                {/* DESKRIPSI */}
                <div className="admin-form-group">
                  <label>Deskripsi Produk</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* SPESIFIKASI TEKNIS */}
                <div className="admin-specs-box">
                  <h4 className="admin-specs-heading">
                    📋 Spesifikasi Teknis Produk
                  </h4>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Material Bahan</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Ketebalan</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.thickness}
                        onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Pilihan Warna</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontSize: "11px" }}>Garansi</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label style={{ fontSize: "11px" }}>Ukuran</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
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

      {/* =================================================
          MODAL HAPUS PRODUK
      ================================================= */}
      {showDeleteModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Hapus Produk</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus produk <strong>"{selectedProduct?.name}"</strong> (ID #{selectedProduct?.id})? Tindakan ini tidak dapat dibatalkan.
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
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          TOAST NOTIFICATION
      ================================================= */}
      {toastMessage && (
        <div className="admin-toast-success">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CATEGORY ICON
========================================================= */
function TagsIcon() {
  return (
    <span
      style={{
        fontSize: "17px",
        fontWeight: 700,
      }}
    >
      #
    </span>
  );
}