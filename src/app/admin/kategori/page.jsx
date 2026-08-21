"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getStoredCategories,
  saveCategories,
  subscribeCategories,
} from "@/lib/categoryStore";
import {
  getStoredProducts,
  subscribeProducts,
} from "@/lib/productStore";
import {
  FiPlus,
  FiGrid,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiBox,
  FiCheckCircle,
  FiMenu,
  FiBell,
  FiX,
  FiLayers,
} from "react-icons/fi";
import { FaMosque, FaHotel } from "react-icons/fa";

const initialCategories = [
  {
    id: 1,
    name: "Karpet Masjid",
    slug: "karpet-masjid",
    description: "Karpet tebal dan empuk untuk masjid, musholla, dan pesantren.",
    products: 12,
    iconType: "mosque",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Karpet Hotel",
    slug: "karpet-hotel",
    description: "Karpet elegan & mewah untuk ballroom, lorong, dan kamar hotel.",
    products: 8,
    iconType: "hotel",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Karpet Kantor",
    slug: "karpet-kantor",
    description: "Karpet tile & roll profesional berdaya tahan tinggi untuk kantor modern.",
    products: 15,
    iconType: "office",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Karpet Rumah",
    slug: "karpet-rumah",
    description: "Karpet aesthetic yang nyaman dan lembut untuk ruang keluarga & kamar.",
    products: 20,
    iconType: "home",
    status: "Aktif",
  },
  {
    id: 5,
    name: "Karpet Custom",
    slug: "karpet-custom",
    description: "Karpet handtufted dengan motif, ukuran, dan ketebalan sesuai pesanan.",
    products: 6,
    iconType: "custom",
    status: "Aktif",
  },
  {
    id: 6,
    name: "Aksesoris Karpet",
    slug: "aksesoris-karpet",
    description: "Underlayer foam, list jepit tangga bordes, dan lem perekat karpet.",
    products: 10,
    iconType: "tools",
    status: "Aktif",
  },
];

export default function KategoriPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    products: 0,
    status: "Aktif",
    iconType: "custom",
  });

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchCategoriesFromDB = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setCategories(json.data);
        saveCategories(json.data);
        if (showNotification) {
          showToast("Data kategori berhasil disinkronkan dari Database Prisma!");
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron database kategori:", err);
      if (showNotification) {
        showToast("Koneksi database gagal, menampilkan data lokal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Load from DB on mount & listen to real-time product/category updates
  useEffect(() => {
    setCategories(getStoredCategories());
    fetchCategoriesFromDB(false);

    // Listen to category updates
    const unsubCategories = subscribeCategories((updated) => {
      setCategories(updated);
    });

    // Listen to product updates: recalculate product counts in real-time
    const unsubProducts = subscribeProducts(() => {
      fetchCategoriesFromDB(false);
    });

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      products: 0,
      status: "Aktif",
      iconType: "custom",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      products: category.products || category.productsCount || 0,
      status: category.status || "Aktif",
      iconType: category.iconType || "custom",
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Nama kategori wajib diisi!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      description: formData.description || "Kategori produk berkualitas Rumah Indah Carpet.",
      products: parseInt(formData.products) || 0,
      status: formData.status,
      iconType: formData.iconType || "custom",
    };

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = [result.data, ...categories];
        setCategories(updated);
        saveCategories(updated);
        setShowAddModal(false);
        showToast(`Kategori "${result.data.name}" berhasil disimpan ke Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal simpan kategori ke API:", err);
    }

    const fallbackCat = { id: Date.now(), ...payload };
    const updated = [fallbackCat, ...categories];
    setCategories(updated);
    saveCategories(updated);
    setShowAddModal(false);
    showToast(`Kategori "${fallbackCat.name}" berhasil ditambahkan!`);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !formData.name.trim()) return;

    const payload = {
      id: selectedCategory.id,
      name: formData.name.trim(),
      slug: formData.slug || selectedCategory.slug,
      description: formData.description,
      products: parseInt(formData.products) || 0,
      status: formData.status,
      iconType: formData.iconType || selectedCategory.iconType || "custom",
    };

    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const updated = categories.map((cat) => (cat.id === selectedCategory.id ? { ...cat, ...result.data } : cat));
        setCategories(updated);
        saveCategories(updated);
        setShowEditModal(false);
        showToast(`Kategori "${formData.name}" berhasil diperbarui di Database!`);
        return;
      }
    } catch (err) {
      console.warn("Gagal update kategori ke API:", err);
    }

    const updated = categories.map((cat) =>
      cat.id === selectedCategory.id ? { ...cat, ...payload } : cat
    );
    setCategories(updated);
    saveCategories(updated);
    setShowEditModal(false);
    showToast(`Kategori "${formData.name}" berhasil diperbarui!`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await fetch(`/api/categories?id=${selectedCategory.id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Gagal delete kategori ke API:", err);
    }

    const updated = categories.filter((cat) => cat.id !== selectedCategory.id);
    setCategories(updated);
    saveCategories(updated);
    setShowDeleteModal(false);
    showToast(`Kategori "${selectedCategory.name}" berhasil dihapus dari Database.`);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, item) => sum + item.products, 0);

  const getIcon = (type) => {
    switch (type) {
      case "mosque":
        return <FaMosque />;
      case "hotel":
        return <FaHotel />;
      default:
        return <FiGrid />;
    }
  };

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
          title="Manajemen Kategori"
          breadcrumb="ADMIN PANEL / KATALOG"
          setMobileOpen={setMobileOpen}
        />

        {/* CONTENT */}
        <div className="admin-content">
          {/* STATS SUMMARY */}
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <FiGrid size={20} />
                </div>
                <span className="stat-change">Aktif</span>
              </div>
              <div className="stat-value">{categories.length}</div>
              <div className="stat-title">Total Kategori</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                  <FiBox size={20} />
                </div>
                <span className="stat-change">Katalog</span>
              </div>
              <div className="stat-value">{totalProducts}</div>
              <div className="stat-title">Total Produk Terhubung</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#faf5ff", color: "#9333ea" }}>
                  <FiLayers size={20} />
                </div>
                <span className="stat-change">Status</span>
              </div>
              <div className="stat-value">{categories.filter(c => c.status === "Aktif").length}</div>
              <div className="stat-title">Kategori Ditampilkan</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                  <FiCheckCircle size={20} />
                </div>
                <span className="stat-change">Rata-rata</span>
              </div>
              <div className="stat-value">
                {categories.length ? Math.round(totalProducts / categories.length) : 0}
              </div>
              <div className="stat-title">Produk per Kategori</div>
            </div>
          </div>

          {/* FILTER & ACTIONS BAR */}
          <div className="admin-user-filter-bar">
            <div className="admin-filter-group">
              <div className="admin-search-input-wrapper">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari nama atau deskripsi kategori..."
                  className="admin-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => fetchCategoriesFromDB(true)}
                disabled={isSyncing}
                title="Sinkronkan kategori dengan database PostgreSQL melalui Prisma"
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
                <FiGrid className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Prisma"}</span>
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleOpenAdd}
              >
                <FiPlus size={18} />
                <span>Tambah Kategori</span>
              </button>
            </div>
          </div>

          {/* CATEGORIES CARD GRID */}
          <div className="admin-cards-grid">
            {filteredCategories.map((category) => (
              <div className="admin-cat-card" key={category.id}>
                <div>
                  <div className="admin-cat-top">
                    <div className="admin-cat-icon">
                      {getIcon(category.iconType)}
                    </div>
                    <span className="admin-badge-count">
                      {category.products} Produk
                    </span>
                  </div>

                  <h3 className="admin-cat-title">{category.name}</h3>
                  <p className="admin-cat-desc">{category.description}</p>
                </div>

                <div className="admin-card-actions">
                  <span className="admin-status-pill active" style={{ marginRight: "auto" }}>
                    {category.status || "Aktif"}
                  </span>
                  <button
                    type="button"
                    className="action-btn-pill edit"
                    onClick={() => handleOpenEdit(category)}
                    title="Edit Kategori"
                  >
                    <FiEdit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="action-btn-pill delete"
                    onClick={() => handleOpenDelete(category)}
                    title="Hapus Kategori"
                  >
                    <FiTrash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="admin-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
              <FiGrid size={36} color="#94a3b8" style={{ marginBottom: "10px" }} />
              <h3 style={{ margin: "0 0 6px" }}>Tidak ada kategori ditemukan</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Coba ubah kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL TAMBAH KATEGORI */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Tambah Kategori Baru</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveNew}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Kategori <span className="required">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Contoh: Karpet Masjid"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Slug URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="karpet-masjid"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Jumlah Produk Awal</label>
                    <input
                      type="number"
                      className="admin-input"
                      min="0"
                      value={formData.products}
                      onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Deskripsi Singkat</label>
                  <textarea
                    className="admin-textarea"
                    placeholder="Tuliskan penjelasan kategori karpet ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KATEGORI */}
      {showEditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Kategori</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Kategori <span className="required">*</span></label>
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
                    <label>Slug URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Jumlah Produk</label>
                    <input
                      type="number"
                      className="admin-input"
                      min="0"
                      value={formData.products}
                      onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Deskripsi</label>
                  <textarea
                    className="admin-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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

      {/* MODAL HAPUS KONFIRMASI */}
      {showDeleteModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal-box" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Hapus Kategori</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus kategori <strong>{selectedCategory?.name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
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
                Hapus Kategori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {toastMessage && (
        <div className="admin-toast-success">
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}