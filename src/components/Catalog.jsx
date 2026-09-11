"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  FiSearch,
  FiGrid,
  FiArrowRight,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiImage,
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const normalizeCat = useCallback(
    (cat) => (cat || "").toLowerCase().replace(/^karpet\s+/i, "").trim(),
    []
  );

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

  // Sync state with URL search parameters (from Beranda HeroSearch or Direct Link)
  useEffect(() => {
    const urlSearch = searchParams?.get("search") || "";
    const urlCat = searchParams?.get("category") || "";

    setSearchTerm(urlSearch);

    if (urlCat) {
      const normUrlCat = normalizeCat(urlCat);
      const foundCat = categories.find(
        (c) => normalizeCat(c) === normUrlCat || normUrlCat.includes(normalizeCat(c))
      );
      if (foundCat) {
        setSelectedCategory(foundCat);
      } else {
        setSelectedCategory(urlCat);
      }
    } else {
      setSelectedCategory("Semua");
    }

    setCurrentPage(1);
  }, [searchParams, categories, normalizeCat]);

  // Update browser URL query params gracefully
  const updateUrl = (newSearch, newCat) => {
    const params = new URLSearchParams();
    if (newSearch && newSearch.trim()) {
      params.set("search", newSearch.trim());
    }
    if (newCat && newCat !== "Semua") {
      params.set("category", normalizeCat(newCat));
    }
    const qs = params.toString();
    const targetUrl = `${pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", targetUrl);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    updateUrl(searchTerm, cat);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
    updateUrl(val, selectedCategory);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Semua");
    setCurrentPage(1);
    window.history.replaceState(null, "", pathname);
  };

  const filteredCarpets = products.filter((item) => {
    const itemCatNorm = normalizeCat(item.category);
    const selectedCatNorm = normalizeCat(selectedCategory);

    const matchCategory =
      selectedCategory === "Semua" ||
      itemCatNorm === selectedCatNorm ||
      itemCatNorm.includes(selectedCatNorm) ||
      selectedCatNorm.includes(itemCatNorm) ||
      (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

    if (!matchCategory) return false;

    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase().trim();
    const matchName = (item.name || "").toLowerCase().includes(q);
    const matchCategoryName = (item.category || "").toLowerCase().includes(q);
    const matchDesc = (item.description || "").toLowerCase().includes(q);
    const matchSpecs = Object.values(item.specifications || {}).some((spec) =>
      String(spec).toLowerCase().includes(q)
    );

    return matchName || matchCategoryName || matchDesc || matchSpecs;
  });

  const totalPages = Math.ceil(filteredCarpets.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCarpets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="catalog-section">
      {/* HEADER WITH SHIMMER BADGE */}
      <div className="catalog-header">
        <span className="section-badge animate-badge-pop">
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
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="catalog-clear-btn"
              onClick={() => handleSearchChange("")}
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
              {searchTerm && ` dengan kata kunci "${searchTerm}"`}
            </span>
            {(selectedCategory !== "Semua" || searchTerm) && (
              <button
                type="button"
                className="catalog-reset-link"
                onClick={handleResetFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2A6151",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  textDecoration: "underline",
                  marginLeft: "auto",
                }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {currentItems.length > 0 ? (
            <div className="catalog-grid">
              {currentItems.map((item, idx) => (
                <CatalogCardItem key={item.id || idx} item={item} idx={idx} />
              ))}
            </div>
          ) : (
            <div className="catalog-empty-state">
              <FiSearch size={40} className="empty-icon" />
              <h3>Produk tidak ditemukan</h3>
              <p>
                {searchTerm
                  ? `Tidak ada karpet yang cocok dengan pencarian "${searchTerm}".`
                  : "Coba kata kunci pencarian lain atau pilih kategori yang berbeda."}
              </p>
              <button
                type="button"
                className="btn-reset-filter"
                onClick={handleResetFilters}
              >
                Reset Semua Filter & Pencarian
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

function CatalogCardItem({ item, idx }) {
  const [orientation, setOrientation] = useState("landscape");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [currentImg, setCurrentImg] = useState(
    item.images?.[0] ||
      item.image ||
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"
  );

  useEffect(() => {
    setCurrentImg(
      item.images?.[0] ||
        item.image ||
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"
    );
  }, [item]);

  const handleImageLoad = (e) => {
    setImgLoaded(true);
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      if (naturalHeight > naturalWidth * 1.08) {
        setOrientation("portrait");
      } else if (naturalWidth > naturalHeight * 1.08) {
        setOrientation("landscape");
      } else {
        setOrientation("square");
      }
    }
  };

  const handleImageError = () => {
    setCurrentImg("https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200");
  };

  const galleryCount =
    Array.isArray(item.images) && item.images.length > 1
      ? item.images.length
      : 0;

  return (
    <div
      className={`catalog-card is-${orientation}`}
      style={{ animationDelay: `${idx * 0.07}s` }}
    >
      <div className={`catalog-image is-${orientation}`}>
        {/* Ambient Blur Backdrop for Seamless Multi-pixel & Multi-ratio Filling */}
        <div
          className="catalog-image-backdrop"
          style={{ backgroundImage: `url("${currentImg}")` }}
          aria-hidden="true"
        />

        <Link
          href={`/product/${item.id}`}
          className="catalog-image-link"
          aria-label={`Lihat detail ${item.name}`}
        >
          <img
            src={currentImg}
            alt={item.name}
            className={`catalog-card-img ${imgLoaded ? "loaded" : "loading"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          <div className="catalog-img-overlay" />
        </Link>

        <span className="catalog-badge">{item.category}</span>

        {galleryCount > 1 && (
          <span className="catalog-gallery-badge" title={`${galleryCount} Foto Produk`}>
            <FiImage size={12} />
            <span>{galleryCount} Foto</span>
          </span>
        )}
      </div>

      <div className="catalog-card-content">
        <h3>
          <Link href={`/product/${item.id}`} className="catalog-title-link">
            {item.name}
          </Link>
        </h3>

        <Link href={`/product/${item.id}`} className="catalog-btn">
          <span>Detail Produk</span>
          <FiArrowRight className="catalog-btn-arrow" />
        </Link>
      </div>
    </div>
  );
}

export default Catalog;

