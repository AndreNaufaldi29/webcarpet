"use client";

import React from "react";

export default function BrandLogo({
  variant = "default", // 'default' | 'compact' | 'light' | 'icon-only'
  className = "",
  size = "md", // 'sm' | 'md' | 'lg'
}) {
  const iconSizes = {
    sm: 32,
    md: 42,
    lg: 52,
  };

  const currentSize = iconSizes[size] || 42;

  // Modern Luxury Geometric Carpet / Arch Monogram Icon
  const IconMark = () => (
    <svg
      width={currentSize}
      height={currentSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="brand-logo-icon"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="ricDeepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A3B25" />
          <stop offset="100%" stopColor="#2A6151" />
        </linearGradient>
        <linearGradient id="ricGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8C2A4" />
          <stop offset="100%" stopColor="#c9b190" />
        </linearGradient>
        <filter id="ricShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0A3B25" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Rounded Shield / Frame */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="22"
        fill="url(#ricDeepGrad)"
        filter="url(#ricShadow)"
      />

      {/* Gold Inner Border Accent */}
      <rect
        x="12"
        y="12"
        width="76"
        height="76"
        rx="16"
        stroke="url(#ricGoldGrad)"
        strokeWidth="2.5"
        strokeDasharray="4 2"
        fill="none"
        opacity="0.85"
      />

      {/* Geometric Carpet Arch & Monogram */}
      {/* Outer Arch */}
      <path
        d="M28 72V44C28 31.8497 37.8497 22 50 22C62.1503 22 72 31.8497 72 44V72"
        stroke="#FCF7F0"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Inner Mosque/Palace Arch & Diamond */}
      <path
        d="M38 72V47C38 40.3726 43.3726 35 50 35C56.6274 35 62 40.3726 62 47V72"
        stroke="url(#ricGoldGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Central Diamond Carpet Motif */}
      <path
        d="M50 43L56 50L50 57L44 50Z"
        fill="url(#ricGoldGrad)"
      />

      {/* Bottom Fringe Accent Line */}
      <line x1="26" y1="72" x2="74" y2="72" stroke="url(#ricGoldGrad)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  if (variant === "icon-only") {
    return <IconMark />;
  }

  const isLight = variant === "light";

  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "10px" : "14px",
        textDecoration: "none",
      }}
    >
      <IconMark />

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span
          style={{
            fontFamily: "var(--font-heading, 'Poppins', sans-serif)",
            fontWeight: 800,
            fontSize: size === "sm" ? "1.05rem" : size === "lg" ? "1.45rem" : "1.25rem",
            letterSpacing: "0.02em",
            color: isLight ? "#FCF7F0" : "var(--brand-heading, #0A3B25)",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span>Rumah Indah</span>
        </span>
        <span
          style={{
            fontSize: size === "sm" ? "0.68rem" : "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: isLight ? "#D8C2A4" : "#2A6151",
            textTransform: "uppercase",
          }}
        >
          Carpet Premium
        </span>
      </div>
    </div>
  );
}
