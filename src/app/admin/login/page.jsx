// src/app/admin/login/page.jsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import logoAB from "@/assets/Original-AB-Carpet-Logo.png";
import {
  login,
  DEFAULT_ADMIN_ACCOUNTS,
  isAuthenticated,
} from "@/lib/authStore";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiSun,
  FiMoon,
  FiArrowLeft,
  FiHelpCircle,
  FiCheck,
  FiUserCheck,
} from "react-icons/fi";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Cek tema saat mount
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      document.body.classList.contains("dark");
    setDarkMode(isDark);
    document.body.classList.toggle("dark", isDark);

    // Jika sudah login, alihkan langsung
    if (isAuthenticated()) {
      router.replace(redirectTarget);
    }
  }, [router, redirectTarget]);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    document.body.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        setSuccessMsg(res.message || "Login berhasil! Memuat dashboard...");
        setTimeout(() => {
          router.replace(redirectTarget);
        }, 500);
      } else {
        setErrorMsg(res.message || "Email atau kata sandi tidak sesuai.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleFillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg("");
  };

  return (
    <div className="admin-login-wrapper">
      {/* BACKGROUND AURA & GLOW */}
      <div className="admin-login-glow-1" />
      <div className="admin-login-glow-2" />

      {/* TOP BAR ACTIONS */}
      <div className="admin-login-topbar">
        <Link href="/" className="admin-login-back-btn">
          <FiArrowLeft size={16} />
          <span>Kembali ke Website</span>
        </Link>

        <button
          type="button"
          className="admin-login-theme-toggle"
          onClick={toggleTheme}
          title={darkMode ? "Ubah ke Light Mode" : "Ubah ke Dark Mode"}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
          <span>{darkMode ? "Light" : "Dark"}</span>
        </button>
      </div>

      {/* LOGIN CARD */}
      <div className="admin-login-card">
        {/* HEADER & BRANDING */}
        <div className="admin-login-header">
          <div className="admin-login-logo-wrap">
            <div className="admin-login-logo-box">
              <img
                src={logoAB.src}
                alt="AB Carpet Logo"
                className="admin-login-logo-img"
              />
            </div>
            <div className="admin-login-badge">
              <FiShield size={12} />
              <span>PORTAL KEAMANAN ADMIN</span>
            </div>
          </div>

          <h1 className="admin-login-title">Masuk ke Admin Panel</h1>
          <p className="admin-login-subtitle">
            Khusus pengelola & staf AB Carpet untuk mengelola produk, testimonial, dan konten website.
          </p>
        </div>

        {/* NOTIFICATIONS / ERROR ALERT */}
        {errorMsg && (
          <div className="admin-login-alert error" role="alert">
            <FiAlertCircle size={18} className="alert-icon" />
            <div className="alert-text">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="admin-login-alert success" role="alert">
            <FiCheckCircle size={18} className="alert-icon" />
            <div className="alert-text">{successMsg}</div>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          {/* EMAIL INPUT */}
          <div className="admin-login-field">
            <label htmlFor="admin-email">Alamat Email</label>
            <div className="admin-login-input-box">
              <span className="input-icon">
                <FiMail size={17} />
              </span>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@abcarpet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="admin-login-field">
            <div className="label-with-action">
              <label htmlFor="admin-password">Kata Sandi</label>
              <button
                type="button"
                className="btn-link-sm"
                onClick={() => setShowHelpModal(true)}
              >
                Lupa sandi?
              </button>
            </div>
            <div className="admin-login-input-box">
              <span className="input-icon">
                <FiLock size={17} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* REMEMBER ME */}
          <div className="admin-login-checkbox-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-custom">
                {rememberMe && <FiCheck size={12} />}
              </span>
              <span className="checkbox-label">Ingat sesi login saya (30 hari)</span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className={`admin-login-submit-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-btn-spinner" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <FiArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* DEMO ACCOUNTS QUICK SELECTOR */}
        <div className="admin-login-demo-section">
          <div className="demo-section-header">
            <span className="demo-badge">AKSES CEPAT PENGUJIAN</span>
            <span className="demo-desc">Pilih akun untuk mengisi otomatis:</span>
          </div>

          <div className="admin-login-demo-grid">
            {DEFAULT_ADMIN_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                className={`demo-pill-btn ${
                  email === acc.email ? "active" : ""
                }`}
                onClick={() => handleFillDemo(acc)}
                title={`Gunakan akun ${acc.name} (${acc.role})`}
              >
                <div className="demo-pill-avatar">{acc.avatar}</div>
                <div className="demo-pill-text">
                  <strong>{acc.name}</strong>
                  <span>{acc.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="admin-login-card-footer">
          <p>
            Dilindungi enkripsi sistem AB Carpet. Segala bentuk akses tanpa izin
            akan dicatat.
          </p>
        </div>
      </div>

      {/* HELP / FORGOT PASSWORD MODAL */}
      {showHelpModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiHelpCircle size={18} style={{ color: "#2563eb" }} />
                <h3>Bantuan Akses Akun</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowHelpModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ margin: "0 0 14px", fontSize: "14px", lineHeight: 1.6, color: "#475569" }}>
                Untuk keamanan data, reset kata sandi admin dilakukan secara manual oleh <strong>Super Administrator</strong> atau Tim IT AB Carpet.
              </p>
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#334155",
                }}
              >
                <div><strong>Kredensial Default Pengujian:</strong></div>
                <div style={{ marginTop: "6px" }}>• Super Admin: <code>admin@abcarpet.com</code> / <code>admin123</code></div>
                <div>• Manager: <code>budi.santoso@abcarpet.com</code> / <code>manager123</code></div>
                <div>• Staff: <code>hendra.staff@abcarpet.com</code> / <code>staff123</code></div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setShowHelpModal(false)}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-auth-guard-overlay">
          <div className="admin-auth-guard-card">
            <div className="auth-guard-spinner-wrap">
              <div className="auth-guard-spinner-ring" />
            </div>
            <h4 style={{ margin: "16px 0 0", fontSize: "15px", color: "#0f172a" }}>
              Memuat Halaman Login...
            </h4>
          </div>
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
