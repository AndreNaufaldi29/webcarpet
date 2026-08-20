"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiGrid,
  FiStar,
} from "react-icons/fi";
import {
  getStoredProducts,
  subscribeProducts,
  syncProductsFromDatabase,
  DEFAULT_PRODUCTS,
} from "@/lib/productStore";

function LatestArrival() {
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

  // Filter products: prioritized by isNew === true, fallback to latest active products
  const activeProducts = products.filter((p) => p.status !== "Nonaktif");
  const newArrivalsOnly = activeProducts.filter((p) => Boolean(p.isNew));
  const displayProducts = newArrivalsOnly.length > 0 ? newArrivalsOnly : activeProducts.slice(0, 3);

  return (
    <section className="arrival-section">
      <div className="arrival-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>PRODUK TERBARU</span>
        </span>

        <h2>
          Karpet Premium Untuk Berbagai Kebutuhan
        </h2>

        <p>
          Temukan koleksi karpet terbaru dengan kualitas terbaik untuk masjid, hotel, kantor maupun rumah.
        </p>
      </div>

      <div className="arrival-grid">
        {displayProducts.map((item, index) => {
          const coverImage =
            (Array.isArray(item.images) && item.images[0]) ||
            item.image ||
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

          return (
            <div
              className="arrival-card"
              key={item.id || index}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="arrival-image">
                <img
                  src={coverImage}
                  alt={item.name}
                  loading="lazy"
                />

                <span className="arrival-badge">
                  {item.category}
                </span>
              </div>

              <div className="arrival-card-body">
                <h3>{item.name}</h3>

                <p>{item.description || "Karpet dengan kualitas terbaik untuk masjid, hotel, kantor, dan hunian."}</p>

                <Link
                  href={`/product/${item.id}`}
                  className="arrival-btn"
                >
                  <span>Lihat Produk</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="arrival-footer">
        <Link
          href="/catalog"
          className="catalog-btn"
        >
          <FiGrid />
          <span>Lihat Semua Produk</span>
        </Link>
      </div>
    </section>
  );
}

export default LatestArrival;
