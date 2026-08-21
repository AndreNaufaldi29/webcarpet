import Link from "next/link";
import { FiAlertCircle, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(10, 59, 37, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          color: "#0A3B25",
          marginBottom: "20px",
        }}
      >
        <FiAlertCircle />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0A3B25", margin: "0 0 10px" }}>
        404 - Halaman Tidak Ditemukan
      </h1>
      <p style={{ color: "#5A6D63", maxWidth: "460px", marginBottom: "28px", lineHeight: 1.6 }}>
        Maaf, halaman yang Anda tuju tidak ditemukan atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          borderRadius: "999px",
          background: "#0A3B25",
          color: "#ffffff",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
        }}
      >
        <FiHome />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
}
