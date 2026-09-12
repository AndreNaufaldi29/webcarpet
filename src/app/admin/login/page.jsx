// src/app/admin/login/page.jsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  login,
  isAuthenticated,
  verifySessionWithServer,
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
  FiCheck,
} from "react-icons/fi";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Rate Limit / Lockout states
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Cek tema saat mount
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      document.body.classList.contains("dark");
    setDarkMode(isDark);
    document.body.classList.toggle("dark", isDark);

    // Cek parameter info alasan (misal: timeout, logout, atau locked)
    const reasonParam = searchParams.get("reason");
    if (reasonParam === "timeout") {
      setErrorMsg("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan masuk kembali.");
    } else if (reasonParam === "logout") {
      setSuccessMsg("Anda telah berhasil keluar dari akun administrator.");
    } else if (reasonParam === "locked") {
      setErrorMsg("Sesi admin telah dikunci demi keamanan. Silakan masukkan kata sandi Anda untuk membuka.");
    }
  }, [searchParams]);

  // Interval countdown untuk masa lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    document.body.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  };

  const formatLockTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        setSuccessMsg(res.message || "Login berhasil! Memuat dashboard...");
        setRemainingAttempts(null);
        setLockoutSeconds(0);
        setTimeout(() => {
          router.replace(redirectTarget);
        }, 500);
      } else {
        if (res.isLocked || (res.lockRemainingSeconds && res.lockRemainingSeconds > 0)) {
          setLockoutSeconds(res.lockRemainingSeconds || 900);
          setErrorMsg(
            res.message || "Akses login sementara dikunci demi keamanan sistem."
          );
        } else {
          setErrorMsg(res.message || "Email atau kata sandi tidak sesuai.");
          if (typeof res.remainingAttempts === "number") {
            setRemainingAttempts(res.remainingAttempts);
          }
        }
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const isFormLocked = lockoutSeconds > 0 || loading;

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
        {/* LOGO & TITLE */}
        <div className="admin-login-header">
          <div className="admin-login-logo-wrap">
            <div className="admin-login-logo-box">
              <BrandLogo variant="icon-only" size="md" />
            </div>
            <div className="admin-login-badge">
              <FiShield size={12} />
              <span>PORTAL KEAMANAN ADMIN</span>
            </div>
          </div>

          <h1 className="admin-login-title">Masuk ke Admin Panel</h1>
          <p className="admin-login-subtitle">
            Khusus pengelola & staf Rumah Indah Carpet untuk mengelola produk, testimonial, dan konten website.
          </p>
        </div>

        {/* NOTIFICATIONS / ERROR ALERT */}
        {lockoutSeconds > 0 ? (
          <div className="admin-login-alert error" role="alert" style={{ borderLeft: "4px solid #ef4444" }}>
            <FiAlertCircle size={20} className="alert-icon" style={{ color: "#ef4444" }} />
            <div className="alert-text">
              <strong>Akses Dikunci Sementara (Anti Brute-Force)</strong>
              <div style={{ marginTop: "4px", fontSize: "13px" }}>
                Terlalu banyak percobaan gagal. Silakan tunggu <strong>{formatLockTime(lockoutSeconds)}</strong> sebelum mencoba kembali.
              </div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="admin-login-alert error" role="alert">
            <FiAlertCircle size={18} className="alert-icon" />
            <div className="alert-text">
              <div>{errorMsg}</div>
              {remainingAttempts !== null && remainingAttempts <= 3 && remainingAttempts > 0 && (
                <div style={{ marginTop: "4px", fontSize: "12px", opacity: 0.9, fontWeight: 600 }}>
                  ⚠️ Peringatan: Sisa {remainingAttempts} percobaan sebelum akun dikunci 15 menit.
                </div>
              )}
            </div>
          </div>
        ) : null}

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
                placeholder="Masukkan alamat email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormLocked}
                autoComplete="email"
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="admin-login-field">
            <label htmlFor="admin-password">Kata Sandi</label>
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
                disabled={isFormLocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                aria-label="Toggle password visibility"
                disabled={isFormLocked}
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
                disabled={isFormLocked}
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
            className={`admin-login-submit-btn ${loading ? "loading" : ""} ${lockoutSeconds > 0 ? "locked" : ""}`}
            disabled={isFormLocked}
            style={lockoutSeconds > 0 ? { opacity: 0.6, cursor: "not-allowed" } : {}}
          >
            {loading ? (
              <>
                <span className="login-btn-spinner" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : lockoutSeconds > 0 ? (
              <>
                <FiLock size={17} />
                <span>Terkunci ({formatLockTime(lockoutSeconds)})</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <FiArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER INFO */}
        <div className="admin-login-card-footer">
          <p>
            Dilindungi enkripsi sistem Rumah Indah Carpet. Segala bentuk akses tanpa izin
            akan dicatat.
          </p>
        </div>
      </div>
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
