"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getStoredProducts,
  subscribeProducts,
  DEFAULT_PRODUCTS,
} from "@/lib/productStore";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiGrid,
} from "react-icons/fi";
import { FaWhatsapp, FaStar } from "react-icons/fa";

export default function ProductDetail() {
  const params = useParams() || {};
  const id = params.id;

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [dbProduct, setDbProduct] = useState(null);

  useEffect(() => {
    // 1. Initial cached products
    setProducts(getStoredProducts());

    // 2. Fetch specific product by ID from Prisma database API
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setDbProduct(json.data);
          }
        })
        .catch((err) => console.warn("Fetch product detail error:", err));
    }

    // 3. Subscribe to product updates
    const unsubscribe = subscribeProducts((updated) => {
      setProducts(updated);
    });
    return () => unsubscribe();
  }, [id]);

  const product =
    dbProduct ||
    products.find((item) => Number(item.id) === Number(id)) ||
    products[0] ||
    DEFAULT_PRODUCTS[0];

  const [activeImage, setActiveImage] = useState(
    product.images?.[0] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200"
  );

  useEffect(() => {
    if (product.images?.[0]) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  const handleWhatsApp = () => {
    const message = `Halo Rumah Indah Carpet, saya tertarik dengan ${product.name}. Saya ingin konsultasi & harga penawaran.`;

    window.open(
      `https://wa.me/6281252235800?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  const defaultSpecs = {
    Material: "Polypropylene Premium",
    Ketebalan: "12 mm",
    Warna: "Maroon / Hijau",
    Garansi: "1 Tahun",
    Ukuran: "Custom Sesuai Ruangan",
  };

  const specifications =
    product.specifications && Object.keys(product.specifications).length > 0
      ? product.specifications
      : defaultSpecs;

  return (
    <div className="product-detail-page-wrapper">
      <section className="product-detail-page">
        {/* BACK BUTTON */}
        <div className="product-back-wrapper">
          <Link href="/catalog" className="product-back-btn">
            <FiArrowLeft size={16} />
            <span>Kembali ke Katalog</span>
          </Link>
        </div>

        {/* MAIN PRODUCT CARD */}
        <div className="product-detail-card">
          {/* GALLERY SECTION */}
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={activeImage} alt={product.name} />
            </div>

            {product.images?.length > 1 && (
              <div className="product-thumb-list">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`product-thumb ${
                      activeImage === img ? "active" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumb ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAIL CONTENT */}
          <div className="product-detail-content">
            <div className="product-category-badge">
              {product.category ? product.category.toUpperCase() : "KARPET MASJID"}
            </div>

            <h1>{product.name}</h1>

            <div className="product-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={14} className="star-icon" />
                ))}
              </div>
              <span className="rating-count">
                ({product.reviews || 24} Ulasan Pelanggan)
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            {/* BENEFIT HIGHLIGHTS */}
            <div className="product-benefits">
              <div className="product-benefit">
                <div className="benefit-icon">
                  <FiCheckCircle size={18} />
                </div>
                <div className="benefit-content">
                  <strong>Bahan Karpet Berkualitas Tinggi</strong>
                  <span>Serat empuk, mudah dibersihkan & nyaman dipakai</span>
                </div>
              </div>

              <div className="product-benefit">
                <div className="benefit-icon">
                  <FiShield size={18} />
                </div>
                <div className="benefit-content">
                  <strong>Garansi Resmi Rumah Indah Carpet</strong>
                  <span>Terjamin mutu bahan dan hasil obras karpet</span>
                </div>
              </div>

              <div className="product-benefit">
                <div className="benefit-icon">
                  <FiTruck size={18} />
                </div>
                <div className="benefit-content">
                  <strong>Pengiriman & Instalasi</strong>
                  <span>Siap kirim & pasang ke lokasi seluruh Indonesia</span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="product-actions">
              <button
                type="button"
                className="product-whatsapp-btn"
                onClick={handleWhatsApp}
              >
                <FaWhatsapp size={18} />
                <span>Minta Penawaran / WhatsApp</span>
              </button>
              <Link href="/catalog" className="product-catalog-btn">
                <FiGrid size={16} />
                <span>Katalog Lainnya</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS SECTION */}
        <div className="product-specification-section">
          <div className="product-section-heading">
            <span className="section-sub-badge">SPESIFIKASI DETAIL</span>
            <h2>Informasi Teknis Produk</h2>
            <p>Ketahuilah detail spesifikasi karpet pilihan Anda secara rinci</p>
          </div>

          <div className="product-spec-grid">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="product-spec-card">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
