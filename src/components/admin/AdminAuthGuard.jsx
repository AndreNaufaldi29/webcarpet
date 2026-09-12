// src/components/admin/AdminAuthGuard.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logout, subscribeAuth, verifySessionWithServer } from "@/lib/authStore";
import BrandLogo from "@/components/BrandLogo";
import { FiShield } from "react-icons/fi";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Menit auto logout jika tidak ada aktivitas
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;  // 5 Menit periodic session check

export default function AdminAuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const inactivityTimerRef = useRef(null);

  const isLoginPage = pathname === "/admin/login";

  const redirectToLogin = useCallback((reason = "") => {
    setAuthorized(false);
    setIsChecking(false);
    const redirectParam = pathname && pathname !== "/admin/login" 
      ? `?redirect=${encodeURIComponent(pathname)}${reason ? `&reason=${reason}` : ""}`
      : (reason ? `?reason=${reason}` : "");
    router.replace(`/admin/login${redirectParam}`);
  }, [pathname, router]);

  // Fungsi Reset Inactivity Timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(async () => {
      if (!isLoginPage && isAuthenticated()) {
        console.warn("Sesi admin berakhir karena tidak ada aktivitas (Inactivity Timeout).");
        await logout();
        redirectToLogin("timeout");
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, [isLoginPage, redirectToLogin]);

  // Verifikasi Keamanan Sesi
  const verifyAuth = useCallback(async () => {
    if (isLoginPage) {
      setAuthorized(true);
      setIsChecking(false);
      return;
    }

    // 1. Cek status lokal cepat
    const localAuth = isAuthenticated();
    if (!localAuth) {
      redirectToLogin();
      return;
    }

    // 2. Tampilkan UI sementara jika lokal valid
    setAuthorized(true);
    setIsChecking(false);

    // 3. Verifikasi aktif ke server (mencegah cookie kadaluwarsa/dicabut)
    try {
      const serverCheck = await verifySessionWithServer();
      if (!serverCheck.authenticated) {
        redirectToLogin();
      }
    } catch {
      // Jika offline, fallback ke auth lokal yang sudah dicek
    }
  }, [isLoginPage, redirectToLogin]);

  useEffect(() => {
    verifyAuth();

    // Subscribe ke event auth sync (misal logout dari tab lain)
    const unsubscribe = subscribeAuth((user) => {
      if (!user && !isLoginPage) {
        redirectToLogin();
      } else if (user && !isLoginPage) {
        setAuthorized(true);
        setIsChecking(false);
      }
    });

    // Cegah bypass Back-Forward Cache browser (bfcache)
    const handlePageShow = (event) => {
      if (event.persisted) {
        verifyAuth();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    // Activity tracking untuk auto-logout
    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetInactivityTimer();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });
    resetInactivityTimer();

    // Heartbeat periodic session check
    const heartbeatTimer = setInterval(() => {
      if (!isLoginPage && isAuthenticated()) {
        verifyAuth();
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      unsubscribe();
      window.removeEventListener("pageshow", handlePageShow);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      clearInterval(heartbeatTimer);
    };
  }, [verifyAuth, isLoginPage, redirectToLogin, resetInactivityTimer]);

  // Jika di halaman login, langsung render children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading screen saat verifikasi
  if (isChecking) {
    return (
      <div className="admin-auth-guard-overlay" aria-busy="true">
        <div className="admin-auth-guard-card">
          <div className="auth-guard-spinner-wrap">
            <div className="auth-guard-spinner-ring" />
            <div className="auth-guard-logo-box">
              <BrandLogo variant="icon-only" size="sm" />
            </div>
          </div>

          <div className="auth-guard-text-wrap">
            <div className="auth-guard-badge">
              <FiShield size={13} />
              <span>PROTEKSI KEAMANAN ADMIN</span>
            </div>
            <h3 className="auth-guard-title">Memverifikasi Hak Akses...</h3>
            <p className="auth-guard-subtitle">
              Sistem sedang memeriksa sesi dan otentikasi akun administrator Anda.
            </p>
          </div>

          <div className="auth-guard-dots">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
