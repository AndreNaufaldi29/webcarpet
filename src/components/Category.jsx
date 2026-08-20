"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiHome,
  FiBriefcase,
  FiGrid,
  FiTool,
  FiArrowRight,
  FiStar,
  FiLayers,
} from "react-icons/fi";
import {
  FaMosque,
  FaHotel,
} from "react-icons/fa";
import {
  getStoredCategories,
  subscribeCategories,
  syncCategoriesFromDatabase,
  getCategoryColor,
} from "@/lib/categoryStore";

function getIconForCategory(cat) {
  const iconType = (cat?.iconType || "").toLowerCase();
  const name = (cat?.name || "").toLowerCase();

  if (iconType === "mosque" || name.includes("masjid") || name.includes("musholla")) {
    return <FaMosque />;
  }
  if (iconType === "hotel" || name.includes("hotel") || name.includes("ballroom")) {
    return <FaHotel />;
  }
  if (iconType === "office" || name.includes("kantor") || name.includes("meeting")) {
    return <FiBriefcase />;
  }
  if (iconType === "home" || name.includes("rumah") || name.includes("keluarga")) {
    return <FiHome />;
  }
  if (iconType === "custom" || name.includes("custom") || name.includes("motif")) {
    return <FiGrid />;
  }
  if (iconType === "tools" || name.includes("aksesoris") || name.includes("underlayer")) {
    return <FiTool />;
  }
  return <FiLayers />;
}

function Category() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 1. Initial cached categories
    setCategories(getStoredCategories().filter((c) => c.status !== "Nonaktif"));

    // 2. Fetch fresh categories from Prisma PostgreSQL database
    syncCategoriesFromDatabase().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data.filter((c) => c.status !== "Nonaktif"));
      }
    });

    // 3. Realtime subscription
    const unsubscribe = subscribeCategories((updated) => {
      setCategories(updated.filter((c) => c.status !== "Nonaktif"));
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="category-section" id="kategori">
      <div className="section-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>KATEGORI PRODUK</span>
        </span>

        <h2>
          Temukan Karpet Sesuai Kebutuhan Anda
        </h2>

        <p>
          Berbagai pilihan karpet berkualitas tinggi untuk masjid, hotel, kantor, rumah, hingga kebutuhan motif custom.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((item, index) => {
          const color = getCategoryColor(item, index);
          const icon = getIconForCategory(item);
          const categorySlug = item.name.replace(/^Karpet\s+/i, "");
          const productCount = item.products || item.productsCount || 0;

          return (
            <Link
              key={item.id || index}
              href={`/catalog?category=${encodeURIComponent(categorySlug)}`}
              className={`category-card ${color}`}
              title={`Lihat koleksi ${item.name}`}
            >
              <div className="category-card-top">
                <div className={`category-icon ${color}`}>
                  {icon}
                </div>
                <span className="category-count">
                  {productCount} Produk
                </span>
              </div>

              <div className="category-card-body">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>

              <div className="category-card-footer">
                <span>Jelajahi Koleksi</span>
                <FiArrowRight className="arrow-icon" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Category;