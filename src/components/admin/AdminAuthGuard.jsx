// src/components/admin/AdminAuthGuard.jsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, subscribeAuth } from "@/lib/authStore";
import logoAB from "@/assets/Original-AB-Carpet-Logo.png";
import { FiShield, FiLock } from "react-icons/fi";

export default function AdminAuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Jika sedang berada di rute login admin, tidak perlu proteksi
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      setIsChecking(false);
      return;
    }

    const checkAuth = () => {
      const isAuth = isAuthenticated();
      if (isAuth) {
        setAuthorized(true);
        setIsChecking(false);
      } else {
        setAuthorized(false);
        setIsChecking(false);
        const currentPath = window.location.pathname;
        const redirectUrl =
          currentPath && currentPath !== "/admin/login"
            ? `/admin/login?redirect=${encodeURIComponent(currentPath)}`
            : "/admin/login";
        router.replace(redirectUrl);
      }
    };

    checkAuth();

    // Subscribe ke perubahan status auth
    const unsubscribe = subscribeAuth((authPayload) => {
      if (!isLoginPage && (!authPayload || !authPayload.token)) {
        setAuthorized(false);
        router.replace("/admin/login");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pathname, isLoginPage, router]);

  // Jika di halaman login, langsung render children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Jika sedang memverifikasi hak akses atau belum authorized
  if (isChecking || !authorized) {
    return (
      <div className="admin-auth-guard-overlay" aria-busy="true">
        <div className="admin-auth-guard-card">
          <div className="auth-guard-spinner-wrap">
            <div className="auth-guard-spinner-ring" />
            <div className="auth-guard-logo-box">
              <img
                src={logoAB.src}
                alt="AB Carpet Logo"
                className="auth-guard-logo-img"
              />
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

  return <>{children}</>;
}
