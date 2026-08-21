"use client";

import React from "react";
import Image from "next/image";
import logoImg from "@/assets/rumah_indah_carpet.png";

export default function BrandLogo({
  variant = "default", // 'default' | 'compact' | 'light' | 'icon-only'
  className = "",
  size = "md", // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
}) {
  const sizeMap = {
    sm: { height: 36, width: 36 },
    md: { height: 46, width: 46 },
    lg: { height: 58, width: 58 },
    xl: { height: 72, width: 72 },
  };

  const { height, width } = sizeMap[size] || sizeMap.md;
  const isLight = variant === "light";

  if (variant === "icon-only") {
    return (
      <div
        className={`brand-logo-icon-wrap ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Image
          src={logoImg}
          alt="Rumah Indah Carpet Logo"
          width={width}
          height={height}
          priority
          className="brand-logo-img"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            objectFit: "contain",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`brand-logo-container ${isLight ? "variant-light" : "variant-default"} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "10px" : "12px",
        textDecoration: "none",
      }}
    >
      <div
        className="brand-logo-icon-badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: isLight ? "rgba(252, 247, 240, 0.95)" : "transparent",
          padding: isLight ? "4px" : "0",
          borderRadius: isLight ? "10px" : "0",
          boxShadow: isLight ? "0 2px 8px rgba(0, 0, 0, 0.2)" : "none",
        }}
      >
        <Image
          src={logoImg}
          alt="Rumah Indah Carpet Logo"
          width={width}
          height={height}
          priority
          className="brand-logo-img"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            objectFit: "contain",
          }}
        />
      </div>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span
            className="brand-logo-title"
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
            className="brand-logo-sub"
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
      )}
    </div>
  );
}
