"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Beri sedikit delay untuk memastikan DOM komponen selesai ter-mount
    const timeout = setTimeout(() => {
      const observerCallback = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      };

      const observerOptions = {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08,
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);

      const targetSelectors = [
        ".reveal-on-scroll",
        "[data-reveal]",
        ".section-header",
        ".catalog-header",
        ".portfolio-header",
        ".branch-header",
        ".category-card",
        ".featured-card",
        ".arrival-card",
        ".catalog-card",
        ".portfolio-card",
        ".branch-card",
        ".stat-card",
        ".branch-map",
        ".testimonial-section",
        ".testimonial-form-section",
        ".product-detail-card",
        ".portfolio-detail-grid",
      ];

      const elements = document.querySelectorAll(targetSelectors.join(", "));

      elements.forEach((el, index) => {
        el.classList.add("reveal-init");
        if (!el.style.getPropertyValue("--stagger-delay")) {
          const staggerIndex = index % 6;
          el.style.setProperty("--stagger-delay", `${staggerIndex * 0.08}s`);
        }
        observer.observe(el);
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
