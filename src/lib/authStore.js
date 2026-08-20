// src/lib/authStore.js
"use client";

// Daftar akun admin default untuk AB Carpet
export const DEFAULT_ADMIN_ACCOUNTS = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    email: "admin@abcarpet.com",
    password: "admin123",
    role: "Super Admin",
    status: "active",
    avatar: "A",
    phone: "0812-3456-7890",
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi.santoso@abcarpet.com",
    password: "manager123",
    role: "Manager",
    status: "active",
    avatar: "B",
    phone: "0819-8765-4321",
  },
  {
    id: 3,
    name: "Hendra Wijaya",
    email: "hendra.staff@abcarpet.com",
    password: "staff123",
    role: "Staff",
    status: "active",
    avatar: "H",
    phone: "0838-4455-6677",
  },
];

const AUTH_STORAGE_KEY = "abcarpet_admin_auth";
const COOKIE_NAME = "abcarpet_admin_session";

/**
 * Mendapatkan cookie di browser
 */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Menyimpan cookie di browser
 */
function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

/**
 * Menghapus cookie di browser
 */
function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Mendapatkan sesi admin yang tersimpan
 */
export function getStoredAuth() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Coba periksa cookie jika localStorage kosong
      const cookieSession = getCookie(COOKIE_NAME);
      if (cookieSession) {
        const parsedCookie = JSON.parse(cookieSession);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsedCookie));
        return parsedCookie;
      }
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Memeriksa apakah admin sedang login
 */
export function isAuthenticated() {
  const auth = getStoredAuth();
  return Boolean(auth && auth.email && auth.token);
}

/**
 * Mendapatkan data pengguna admin yang sedang aktif
 */
export function getCurrentUser() {
  const auth = getStoredAuth();
  if (auth && auth.user) {
    return auth.user;
  }
  // Fallback default jika terautentikasi
  if (auth && auth.email) {
    return (
      DEFAULT_ADMIN_ACCOUNTS.find((a) => a.email.toLowerCase() === auth.email.toLowerCase()) || {
        name: "Administrator",
        email: auth.email,
        role: "Super Admin",
        avatar: "A",
      }
    );
  }
  return null;
}

/**
 * Fungsi Login Admin
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function login(email, password, rememberMe = true) {
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();

  if (!trimmedEmail || !trimmedPassword) {
    return {
      success: false,
      message: "Email dan kata sandi wajib diisi!",
    };
  }

  // 1. Coba autentikasi langsung ke database Prisma melalui API
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        password: trimmedPassword,
        rememberMe,
      }),
    });

    const data = await res.json();
    if (data.success && data.user) {
      const authPayload = {
        token: data.token,
        email: data.user.email,
        loginAt: new Date().toISOString(),
        rememberMe,
        user: data.user,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
        const expiryDays = rememberMe ? 30 : 1;
        setCookie(COOKIE_NAME, JSON.stringify(authPayload), expiryDays);
        window.dispatchEvent(new CustomEvent("abcarpet:auth_changed", { detail: authPayload }));
      }

      return {
        success: true,
        user: data.user,
        message: data.message || `Selamat datang kembali, ${data.user.name}!`,
      };
    } else if (res.status === 401 || res.status === 403 || res.status === 400) {
      return {
        success: false,
        message: data.error || "Email atau kata sandi yang Anda masukkan salah!",
      };
    }
  } catch (err) {
    console.warn("Koneksi API login database gagal, mencoba verifikasi lokal:", err);
  }

  // 2. Fallback offline jika server database tidak merespons
  const matchedAccount = DEFAULT_ADMIN_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === trimmedEmail &&
      acc.password === trimmedPassword
  );

  if (!matchedAccount) {
    return {
      success: false,
      message: "Email atau kata sandi yang Anda masukkan salah!",
    };
  }

  if (matchedAccount.status !== "active") {
    return {
      success: false,
      message: "Akun Anda sedang dinonaktifkan. Hubungi Super Admin.",
    };
  }

  const sessionToken = `ab_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const authPayload = {
    token: sessionToken,
    email: matchedAccount.email,
    loginAt: new Date().toISOString(),
    rememberMe,
    user: {
      id: matchedAccount.id,
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: matchedAccount.role,
      avatar: matchedAccount.avatar,
      phone: matchedAccount.phone,
    },
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
    const expiryDays = rememberMe ? 30 : 1;
    setCookie(COOKIE_NAME, JSON.stringify(authPayload), expiryDays);
    window.dispatchEvent(new CustomEvent("abcarpet:auth_changed", { detail: authPayload }));
  }

  return {
    success: true,
    user: authPayload.user,
    message: `Selamat datang kembali, ${matchedAccount.name}!`,
  };
}

/**
 * Fungsi Logout Admin
 */
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    deleteCookie(COOKIE_NAME);
    window.dispatchEvent(new CustomEvent("abcarpet:auth_changed", { detail: null }));
  }
}

/**
 * Subscribe ke perubahan status autentikasi
 */
export function subscribeAuth(callback) {
  if (typeof window === "undefined") return () => {};

  const handler = (e) => {
    callback(e.detail);
  };

  window.addEventListener("abcarpet:auth_changed", handler);
  window.addEventListener("storage", (e) => {
    if (e.key === AUTH_STORAGE_KEY) {
      callback(getStoredAuth());
    }
  });

  return () => {
    window.removeEventListener("abcarpet:auth_changed", handler);
  };
}
