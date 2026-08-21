// src/components/admin/AdminAuthGuard.jsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, subscribeAuth } from "@/lib/authStore";
import BrandLogo from "@/components/BrandLogo";
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

    const checkAuthStatus = () => {
      const loggedIn = isAuthenticated();
      if (!loggedIn) {
        setAuthorized(false);
        setIsChecking(false);
        router.replace("/admin/login");
      } else {
        setAuthorized(true);
        setIsChecking(false);
      }
    };

    checkAuthStatus();
    const unsubscribe = subscribeAuth((user) => {
      if (!user && !isLoginPage) {
        setAuthorized(false);
        setIsChecking(false);
        router.replace("/admin/login");
      } else if (user) {
        setAuthorized(true);
        setIsChecking(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, isLoginPage, router]);

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

  return <>{children}</>;
}
