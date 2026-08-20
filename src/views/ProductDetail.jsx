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
  FiStar,
  FiGrid,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

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
    const message = `Halo AB Carpet, saya tertarik dengan ${product.name}. Saya ingin konsultasi & harga penawaran.`;

    window.open(
      `https://wa.me/6281252235800?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  return (
    <section className="product-detail-page">
      {/* TOP NAVIGATION */}
      <div className="product-back-wrapper">
        <Link href="/catalog" className="product-back-btn">
          <FiArrowLeft />
          Kembali ke Katalog
        </Link>
      </div>

      <div className="product-detail-card">
        {/* GALLERY */}
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={activeImage} alt={product.name} />
          </div>

          <div className="product-thumb-list">
            {product.images?.map((img, index) => (
              <button
                key={index}
                className={
                  activeImage === img
                    ? "product-thumb active"
                    : "product-thumb"
                }
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="product-information">
          <span className="product-category-badge">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <div className="product-rating">
            <div className="rating-stars">
              {[...Array(product.rating || 5)].map((_, i) => (
                <FiStar key={i} />
              ))}
            </div>
            <span className="rating-text">({product.reviews || 24} Ulasan Pelanggan)</span>
          </div>

          <p className="product-description">{product.description}</p>

          {/* BENEFITS */}
          <div className="product-benefits">
            <div className="product-benefit">
              <div className="benefit-icon">
                <FiCheckCircle size={22} />
              </div>
              <div>
                <strong>Bahan Karpet Berkualitas Tinggi</strong>
                <span>Serat empuk, mudah dibersihkan & nyaman dipakai</span>
              </div>
            </div>

            <div className="product-benefit">
              <div className="benefit-icon">
                <FiShield size={22} />
              </div>
              <div>
                <strong>Garansi Resmi AB Carpet</strong>
                <span>Terjamin mutu bahan dan hasil obras karpet</span>
              </div>
            </div>

            <div className="product-benefit">
              <div className="benefit-icon">
                <FiTruck size={22} />
              </div>
              <div>
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
              <FaWhatsapp size={20} />
              <span>Minta Penawaran / WhatsApp</span>
            </button>
            <Link href="/catalog" className="product-catalog-btn">
              <FiGrid size={18} />
              <span>Katalog Lainnya</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SPECIFICATIONS SECTION */}
      <div className="product-specification-section">
        <div className="product-section-heading">
          <span>SPESIFIKASI DETAIL</span>
          <h2>Informasi Teknis Produk</h2>
          <p>Ketahuilah detail spesifikasi karpet pilihan Anda secara rinci</p>
        </div>

        <div className="product-spec-grid">
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} className="product-spec-card">
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
