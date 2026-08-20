"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowRight, FiStar } from "react-icons/fi";
import {
  getStoredProducts,
  subscribeProducts,
  syncProductsFromDatabase,
  DEFAULT_PRODUCTS,
} from "@/lib/productStore";

function FeaturedCollection() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);

  useEffect(() => {
    // 1. Initial cached products
    setProducts(getStoredProducts());

    // 2. Fetch fresh from Prisma PostgreSQL Database
    syncProductsFromDatabase().then((dbProducts) => {
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts);
      }
    });

    // 3. Realtime subscription
    const unsubscribe = subscribeProducts((updated) => {
      setProducts(updated);
    });

    return () => unsubscribe();
  }, []);

  // Filter products: prioritized by isFeatured === true, fallback to active products
  const activeProducts = products.filter((p) => p.status !== "Nonaktif");
  const featuredOnly = activeProducts.filter((p) => Boolean(p.isFeatured));
  const displayCollections = featuredOnly.length > 0 ? featuredOnly : activeProducts.slice(0, 4);

  return (
    <section className="featured-section">
      <div className="featured-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>KOLEKSI UNGGULAN</span>
        </span>

        <h2>
          Produk Terbaik Pilihan Pelanggan AB Carpet
        </h2>

        <p>
          Berbagai koleksi karpet berkualitas tinggi yang telah dipercaya oleh ribuan pengurus masjid, hotel, dan kantor di seluruh Indonesia.
        </p>
      </div>

      <div className="featured-grid">
        {displayCollections.map((item, index) => {
          const coverImage =
            (Array.isArray(item.images) && item.images[0]) ||
            item.image ||
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

          return (
            <div
              className="featured-card"
              key={item.id || index}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="featured-image">
                <img
                  src={coverImage}
                  alt={item.name}
                  loading="lazy"
                />
              </div>

              <div className="featured-content">
                <h3>{item.name}</h3>

                <p>{item.description || "Koleksi karpet premium berkualitas tinggi dengan material terbaik."}</p>

                <Link
                  href={`/product/${item.id}`}
                  className="featured-btn"
                >
                  <span>Lihat Produk</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturedCollection;
