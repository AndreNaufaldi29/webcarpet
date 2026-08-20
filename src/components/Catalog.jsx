"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiGrid,
  FiArrowRight,
  FiX,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import {
  getStoredProducts,
  subscribeProducts,
  syncProductsFromDatabase,
} from "@/lib/productStore";

const DEFAULT_CATEGORIES = [
  "Semua",
  "Masjid",
  "Hotel",
  "Kantor",
  "Rumah",
  "Custom",
  "Aksesoris",
];

function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load products & categories from Database Prisma
  useEffect(() => {
    // 1. Initial cached products
    setProducts(getStoredProducts().filter((p) => p.status !== "Nonaktif"));

    // 2. Fetch fresh products from Prisma DB
    syncProductsFromDatabase().then((dbProducts) => {
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts.filter((p) => p.status !== "Nonaktif"));
      }
    });

    // 3. Fetch categories from Prisma DB
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const catNames = [
            "Semua",
            ...json.data.map((c) => c.name.replace(/^Karpet\s+/i, "")),
          ];
          const uniqueCats = Array.from(new Set(catNames));
          setCategories(uniqueCats);
        }
      })
      .catch((err) => console.warn("Fetch categories error:", err));

    // 4. Subscribe to realtime product changes
    const unsubscribe = subscribeProducts((updated) => {
      setProducts(updated.filter((p) => p.status !== "Nonaktif"));
    });
    return () => unsubscribe();
  }, []);

  const normalizeCat = (cat) => (cat || "").toLowerCase().replace(/^karpet\s+/i, "").trim();

  const filteredCarpets = products.filter((item) => {
    const itemCatNorm = normalizeCat(item.category);
    const selectedCatNorm = normalizeCat(selectedCategory);

    const matchCategory =
      selectedCategory === "Semua" ||
      itemCatNorm === selectedCatNorm ||
      item.category === selectedCategory;

    const matchSearch =
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredCarpets.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCarpets.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <section className="catalog-section">
      {/* HEADER WITH SHIMMER BADGE */}
      <div className="catalog-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>KATALOG PRODUK LENGKAP</span>
        </span>

        <h1>Temukan Karpet Terbaik Untuk Kebutuhan Anda</h1>

        <p>
          Berbagai pilihan karpet premium dengan ketebalan dan serat terbaik untuk masjid, hotel, kantor, rumah, dan proyek custom Anda tersinkronisasi langsung dari database.
        </p>
      </div>

      {/* SEARCH BAR WITH EXPANDED FOCUS GLOW */}
      <div className="catalog-search">
        <div className="search-wrapper">
          <FiSearch className="search-icon-svg" />

          <input
            type="text"
            placeholder="Cari karpet berdasarkan nama, motif, atau kategori..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          {searchTerm && (
            <button
              type="button"
              className="catalog-clear-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Bersihkan pencarian"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CATALOG LAYOUT */}
      <div className="catalog-layout">
        {/* SIDEBAR CATEGORIES */}
        <aside className="catalog-sidebar">
          <div className="sidebar-title">
            <FiGrid />
            <span>Kategori Produk</span>
          </div>

          <div className="category-btn-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(cat)}
              >
                <span>{cat}</span>
                {selectedCategory === cat && <FiCheck className="cat-check-icon" />}
              </button>
            ))}
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="catalog-content">
          <div className="catalog-status-bar">
            <span>
              Menampilkan <strong>{filteredCarpets.length}</strong> produk
              {selectedCategory !== "Semua" && ` kategori "${selectedCategory}"`}
            </span>
          </div>

          {currentItems.length > 0 ? (
            <div className="catalog-grid">
              {currentItems.map((item, idx) => {
                const displayImage =
                  item.images?.[0] ||
                  item.image ||
                  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

                return (
                  <div
                    className="catalog-card"
                    key={item.id}
                    style={{ animationDelay: `${idx * 0.07}s` }}
                  >
                    <div className="catalog-image">
                      <img src={displayImage} alt={item.name} className="catalog-card-img" />
                      <span className="catalog-badge">{item.category}</span>
                      <div className="catalog-img-overlay" />
                    </div>

                    <div className="catalog-card-content">
                      <h3>{item.name}</h3>

                      <Link href={`/product/${item.id}`} className="catalog-btn">
                        <span>Detail Produk</span>
                        <FiArrowRight className="catalog-btn-arrow" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="catalog-empty-state">
              <FiSearch size={40} className="empty-icon" />
              <h3>Produk tidak ditemukan</h3>
              <p>Coba kata kunci pencarian lain atau pilih kategori yang berbeda.</p>
              <button
                type="button"
                className="btn-reset-filter"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Semua");
                }}
              >
                Reset Semua Filter
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                aria-label="Halaman Sebelumnya"
              >
                <FiChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    currentPage === index + 1
                      ? "page-btn active-page"
                      : "page-btn"
                  }
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                aria-label="Halaman Berikutnya"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Catalog;
