"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getStoredSettings,
  subscribeSettings,
  DEFAULT_SETTINGS,
} from "@/lib/settingsStore";

// Helper untuk menyisipkan Schema.org JSON-LD Structured Data
function updateStructuredData(schemaData) {
  if (typeof document === "undefined") return;
  const scriptId = "rumahindah-schema-jsonld";
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
    // Jangan ubah schema jika sedang di dalam area admin
    if (pathname?.startsWith("/admin")) return;

    const baseUrl =
      settings.canonicalUrl ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "https://webcarpet-p2id.vercel.app");

    const pageImage =
      settings.ogImage ||
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

    // Injeksi Schema.org JSON-LD Structured Data
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
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
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
