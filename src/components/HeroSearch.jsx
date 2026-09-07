"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiX,
  FiLayers,
} from "react-icons/fi";
import {
  getStoredCategories,
  subscribeCategories,
  syncCategoriesFromDatabase,
} from "@/lib/categoryStore";
import {
  getStoredProducts,
  subscribeProducts,
  syncProductsFromDatabase,
} from "@/lib/productStore";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600",
    badge: "KARPET MASJID & IBADAH",
    title: "Lembut, Nyaman & Elegan Untuk Rumah Ibadah Anda",
    desc:
      "Rumah Indah Carpet menyediakan berbagai pilihan karpet berkualitas tinggi untuk masjid, musholla, hotel, kantor dan kebutuhan custom lainnya.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600",
    badge: "KARPET RESIDENSIAL MEWAH",
    title: "Karpet Premium Untuk Rumah & Hunian Modern",
    desc:
      "Karpet pilihan dengan material terbaik untuk menciptakan kenyamanan maksimal dan kehangatan di setiap sudut rumah Anda.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600",
    badge: "KARPET KANTOR & KOMERSIAL",
    title: "Karpet Kantor Profesional & Ballroom Hotel",
    desc:
      "Menciptakan suasana kerja yang elegan, kedap suara, nyaman dan meningkatkan produktivitas serta prestise perusahaan.",
  },
];

const DEFAULT_CATEGORY_NAMES = [
  "Semua",
  "Karpet Masjid",
  "Karpet Hotel",
  "Karpet Kantor",
  "Karpet Rumah",
  "Karpet Custom",
  "Aksesoris",
];

function HeroSearch() {
  const router = useRouter();
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [categories, setCategories] = useState(DEFAULT_CATEGORY_NAMES);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync categories & products from database
  useEffect(() => {
    // 1. Initial cached categories
    const initialCats = getStoredCategories().filter((c) => c.status !== "Nonaktif");
    if (initialCats.length > 0) {
      setCategories(["Semua", ...initialCats.map((c) => c.name)]);
    }

    // 2. Fetch fresh categories
    syncCategoriesFromDatabase().then((dbCategories) => {
      if (Array.isArray(dbCategories) && dbCategories.length > 0) {
        const activeCats = dbCategories.filter((c) => c.status !== "Nonaktif");
        setCategories(["Semua", ...activeCats.map((c) => c.name)]);
      }
    });

    // 3. Subscribe categories
    const unsubCats = subscribeCategories((updated) => {
      const activeCats = updated.filter((c) => c.status !== "Nonaktif");
      setCategories(["Semua", ...activeCats.map((c) => c.name)]);
    });

    // 4. Initial cached products
    setProducts(getStoredProducts().filter((p) => p.status !== "Nonaktif"));

    // 5. Fetch fresh products
    syncProductsFromDatabase().then((dbProducts) => {
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts.filter((p) => p.status !== "Nonaktif"));
      }
    });

    // 6. Subscribe products
    const unsubProds = subscribeProducts((updated) => {
      setProducts(updated.filter((p) => p.status !== "Nonaktif"));
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  // Slide rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSlideChange = (updater) => {
    setIsTransitioning(true);
    setCurrent(updater);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Helper normalization
  const normalize = (str) => (str || "").toLowerCase().trim();
  const normalizeCat = (cat) => normalize(cat).replace(/^karpet\s+/i, "");

  // Instant matching products calculation
  const matchingProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const activeNorm = normalizeCat(activeCategory);
    const q = normalize(query);

    return products.filter((item) => {
      if (item.status === "Nonaktif") return false;

      // Category filter
      if (activeCategory && activeCategory !== "Semua") {
        const itemCatNorm = normalizeCat(item.category);
        const matchCategory =
          itemCatNorm === activeNorm ||
          itemCatNorm.includes(activeNorm) ||
          activeNorm.includes(itemCatNorm) ||
          normalize(item.category) === normalize(activeCategory);
        if (!matchCategory) return false;
      }

      // Query filter
      if (!q) return true;

      const nameMatch = normalize(item.name).includes(q);
      const categoryMatch = normalize(item.category).includes(q);
      const descMatch = normalize(item.description).includes(q);
      const specsMatch = Object.values(item.specifications || {}).some((val) =>
        normalize(String(val)).includes(q)
      );

      return nameMatch || categoryMatch || descMatch || specsMatch;
    });
  }, [products, query, activeCategory]);

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsDropdownOpen(false);

    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("search", query.trim());
    }
    if (activeCategory && activeCategory !== "Semua") {
      params.set("category", normalizeCat(activeCategory));
    }
    const queryString = params.toString();
    router.push(`/catalog${queryString ? `?${queryString}` : ""}`);
  };

  const handleCategoryClick = (item) => {
    setActiveCategory(item);
    // If query has text, keep user on home page with refreshed dropdown
    if (query.trim()) {
      setIsDropdownOpen(true);
    } else {
      // If no query typed, navigate directly to catalog of that category
      const params = new URLSearchParams();
      if (item !== "Semua") {
        params.set("category", normalizeCat(item));
      }
      const queryString = params.toString();
      router.push(`/catalog${queryString ? `?${queryString}` : ""}`);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setIsDropdownOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <section className="hero-search">
      {/* HERO SLIDE CONTAINER */}
      <div
        key={current}
        className={`hero-slide ${isTransitioning ? "slide-fade" : "slide-active"}`}
        style={{
          backgroundImage: `
          linear-gradient(
            90deg,
            rgba(0,11,88,.92) 0%,
            rgba(0,11,88,.65) 50%,
            rgba(0,11,88,.25) 100%
          ),
          url(${slides[current].image})
          `,
        }}
      >
        {/* AMBIENT FLOATING LIGHTS */}
        <div className="hero-ambient-glow" />

        <div className="hero-content">
          <div className="hero-badge animate-badge-pop">
            <span>{slides[current].badge || "KARPET BERKUALITAS PREMIUM"}</span>
          </div>

          <h1 className="hero-title-anim">{slides[current].title}</h1>

          <p className="hero-desc-anim">{slides[current].desc}</p>

          <div className="hero-actions-anim">
            <Link href="/catalog" className="hero-btn">
              <span>Jelajahi Katalog</span>
              <FiArrowRight className="hero-btn-arrow" />
            </Link>

            <Link href="/portofolio" className="hero-btn-secondary">
              <span>Lihat Portofolio</span>
            </Link>
          </div>
        </div>

        {/* SLIDE CONTROLS */}
        <button
          type="button"
          className="arrow left"
          onClick={() =>
            handleSlideChange(current === 0 ? slides.length - 1 : current - 1)
          }
          aria-label="Slide Sebelumnya"
        >
          <FiChevronLeft />
        </button>

        <button
          type="button"
          className="arrow right"
          onClick={() =>
            handleSlideChange(current === slides.length - 1 ? 0 : current + 1)
          }
          aria-label="Slide Berikutnya"
        >
          <FiChevronRight />
        </button>

        {/* SLIDE INDICATORS */}
        <div className="hero-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`indicator-dot ${current === idx ? "active" : ""}`}
              onClick={() => handleSlideChange(idx)}
              aria-label={`Pindah ke slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* SEARCH FLOATING BOX */}
      <div className="search-box animate-float-search" ref={searchContainerRef}>
        <form onSubmit={handleSearch}>
          <div className="search-row">
            <div className="search-input-wrap">
              <FiSearch className="search-icon-inside" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari nama karpet, warna, bahan, atau kebutuhan..."
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                aria-label="Cari Karpet"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={handleClearQuery}
                  aria-label="Hapus pencarian"
                >
                  <FiX />
                </button>
              )}

              {/* LIVE SEARCH AUTOCOMPLETE DROPDOWN */}
              {isDropdownOpen && query.trim() && (
                <div className="hero-search-dropdown animate-dropdown-pop">
                  <div className="hero-dropdown-header">
                    <span>
                      Hasil pencarian untuk <strong>&quot;{query}&quot;</strong>
                      {activeCategory !== "Semua" && (
                        <> di kategori <em>{activeCategory}</em></>
                      )}
                    </span>
                    <span className="hero-dropdown-count">
                      {matchingProducts.length} Karpet
                    </span>
                  </div>

                  {matchingProducts.length > 0 ? (
                    <>
                      <div className="hero-dropdown-list">
                        {matchingProducts.slice(0, 5).map((item) => {
                          const thumb =
                            item.images?.[0] ||
                            item.image ||
                            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300";

                          const specSummary =
                            item.specifications?.Material ||
                            item.specifications?.Ketebalan ||
                            (item.description
                              ? item.description.slice(0, 55) + "..."
                              : "Karpet kualitas premium");

                          return (
                            <Link
                              key={item.id}
                              href={`/product/${item.id}`}
                              className="hero-dropdown-item"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="hero-dropdown-img">
                                <img src={thumb} alt={item.name} />
                              </div>
                              <div className="hero-dropdown-info">
                                <div className="hero-dropdown-top">
                                  <span className="hero-dropdown-title">
                                    {item.name}
                                  </span>
                                  <span className="hero-dropdown-badge">
                                    {item.category}
                                  </span>
                                </div>
                                <span className="hero-dropdown-desc">
                                  {specSummary}
                                </span>
                              </div>
                              <FiArrowRight className="hero-dropdown-arrow" />
                            </Link>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="hero-dropdown-footer-btn"
                        onClick={handleSearch}
                      >
                        <span>
                          Lihat semua {matchingProducts.length} hasil di Katalog
                        </span>
                        <FiArrowRight />
                      </button>
                    </>
                  ) : (
                    <div className="hero-dropdown-empty">
                      <div className="hero-dropdown-empty-icon">
                        <FiSearch size={22} />
                      </div>
                      <p className="empty-main">
                        Tidak ditemukan karpet untuk &quot;{query}&quot;
                        {activeCategory !== "Semua" && ` pada kategori ${activeCategory}`}.
                      </p>
                      <p className="empty-sub">
                        Coba periksa ejaan kata atau jelajahi katalog lengkap kami.
                      </p>
                      <button
                        type="button"
                        className="hero-dropdown-view-all"
                        onClick={handleSearch}
                      >
                        <FiLayers size={14} />
                        <span>Buka Katalog Lengkap</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="search-btn" aria-label="Cari Produk">
              <FiSearch className="search-btn-icon" />
              <span className="search-btn-text-desktop">Cari Produk</span>
              <span className="search-btn-text-mobile">Cari</span>
            </button>
          </div>
        </form>

        {/* DYNAMIC CATEGORY FILTER PILLS UNDER SEARCH */}
        <div className="category-filter-wrap">
          <div className="category-filter" role="tablist" aria-label="Filter Kategori Karpet">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={activeCategory === item}
                className={activeCategory === item ? "active" : ""}
                onClick={() => handleCategoryClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSearch;
