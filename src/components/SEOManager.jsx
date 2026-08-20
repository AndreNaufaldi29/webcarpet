"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";
import { getStoredProducts } from "@/lib/productStore";

// Helper untuk memperbarui atau membuat tag <meta> di <head>
function updateMetaTag(attributeName, attributeValue, contentValue) {
  if (typeof document === "undefined") return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", contentValue || "");
}

// Helper untuk memperbarui tag <link rel="canonical"> di <head>
function updateCanonicalLink(url) {
  if (typeof document === "undefined") return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url || window.location.href);
}

// Helper untuk menyisipkan Schema.org JSON-LD Structured Data
function updateStructuredData(schemaData) {
  if (typeof document === "undefined") return;
  const scriptId = "abcarpet-schema-jsonld";
  let script = document.getElementById(scriptId);
  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData);
}

export default function SEOManager() {
  const pathname = usePathname();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Jangan ubah SEO jika sedang di dalam area admin
    if (pathname?.startsWith("/admin")) return;

    const baseUrl =
      settings.canonicalUrl ||
      (typeof window !== "undefined" ? window.location.origin : "https://abcarpet.co.id");
    const currentUrl = typeof window !== "undefined" ? window.location.href : baseUrl;

    let pageTitle = settings.metaTitle || `${settings.companyName} | Karpet Premium`;
    let pageDescription = settings.metaDescription || settings.description;
    let pageKeywords = settings.metaKeywords || "";
    let pageImage = settings.ogImage || "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

    // Dynamic SEO data per route
    if (pathname === "/") {
      pageTitle = settings.metaTitle || `${settings.companyName} - Produsen & Toko Karpet Masjid & Hotel Premium`;
      pageDescription = settings.metaDescription || settings.description;
    } else if (pathname === "/catalog") {
      pageTitle = `Katalog Produk Karpet Lengkap | ${settings.companyName}`;
      pageDescription = `Jelajahi berbagai pilihan karpet masjid tebal, karpet ballroom hotel, karpet tile kantor, hingga karpet custom motif dari ${settings.companyName}.`;
      pageKeywords = `katalog karpet, ${settings.metaKeywords}`;
    } else if (pathname?.startsWith("/product/")) {
      const parts = pathname.split("/");
      const productId = Number(parts[parts.length - 1]);
      const products = getStoredProducts();
      const product = products.find((p) => p.id === productId);

      if (product) {
        pageTitle = `${product.name} - Karpet Premium Berkualitas | ${settings.companyName}`;
        pageDescription = product.description || pageDescription;
        if (product.images?.[0]) pageImage = product.images[0];
        pageKeywords = `${product.name}, ${product.category}, ${settings.metaKeywords}`;
      } else {
        pageTitle = `Detail Produk Karpet | ${settings.companyName}`;
      }
    } else if (pathname === "/portofolio" || pathname === "/portfolio") {
      pageTitle = `Portofolio Proyek Pemasangan Karpet | ${settings.companyName}`;
      pageDescription = `Dokumentasi hasil pengerjaan pemasangan karpet masjid, hotel berbintang, dan gedung perkantoran oleh tim ahli ${settings.companyName}.`;
      pageKeywords = `portofolio karpet, pasang karpet masjid, proyek karpet hotel, ${settings.metaKeywords}`;
    } else if (pathname?.startsWith("/portfolio/") || pathname?.startsWith("/portofolio/")) {
      pageTitle = `Dokumentasi Proyek Karpet | ${settings.companyName}`;
      pageDescription = `Spesifikasi detail dan dokumentasi pemasangan karpet bergaransi oleh ${settings.companyName}.`;
    } else if (pathname === "/cabang") {
      pageTitle = `Cabang & Workshop Kami | ${settings.companyName}`;
      pageDescription = `Temukan lokasi kantor, workshop, dan showroom ${settings.companyName} di Sidoarjo, Surabaya, dan kota lainnya. Siap melayani seluruh Indonesia.`;
      pageKeywords = `lokasi toko karpet, alamat pabrik karpet, ab carpet sidoarjo, ${settings.metaKeywords}`;
    }

    // 1. Terapkan Title Dokumen
    document.title = pageTitle;

    // 2. Terapkan Standard Meta Tags
    updateMetaTag("name", "description", pageDescription);
    updateMetaTag("name", "keywords", pageKeywords);
    updateMetaTag("name", "author", settings.metaAuthor || settings.companyName);
    updateMetaTag("name", "robots", settings.robotsIndex || "index, follow");

    // 3. Terapkan Open Graph Tags (Facebook, WhatsApp, LinkedIn)
    updateMetaTag("property", "og:title", pageTitle);
    updateMetaTag("property", "og:description", pageDescription);
    updateMetaTag("property", "og:image", pageImage);
    updateMetaTag("property", "og:url", currentUrl);
    updateMetaTag("property", "og:type", "website");
    updateMetaTag("property", "og:site_name", settings.companyName);
    updateMetaTag("property", "og:locale", "id_ID");

    // 4. Terapkan Twitter Cards
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", pageTitle);
    updateMetaTag("name", "twitter:description", pageDescription);
    updateMetaTag("name", "twitter:image", pageImage);

    // 5. Terapkan Canonical Link
    updateCanonicalLink(currentUrl);

    // 6. Injeksi Schema.org JSON-LD Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": `${baseUrl}/#localbusiness`,
          name: settings.companyName,
          image: pageImage,
          telephone: settings.phone,
          email: settings.email,
          url: baseUrl,
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressLocality: "Sidoarjo",
            addressRegion: "Jawa Timur",
            postalCode: "61257",
            addressCountry: "ID",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: -7.3512,
            longitude: 112.7285,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "08:00",
              closes: "17:00",
            },
          ],
          sameAs: [
            settings.instagram,
            settings.facebook,
            settings.tiktok,
            settings.youtube,
          ].filter(Boolean),
        },
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: settings.companyName,
          description: settings.metaDescription,
          publisher: {
            "@id": `${baseUrl}/#localbusiness`,
          },
          inLanguage: "id-ID",
        },
      ],
    };

    updateStructuredData(schemaData);
  }, [pathname, settings]);

  return null;
}
