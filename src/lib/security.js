// src/lib/security.js
import crypto from "crypto";

const SECRET_KEY =
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  "abcarpet_secure_hmac_secret_2026_rumahindahcarpet_superkey";

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

// ==========================================
// 1. PASSWORD HASHING & VERIFICATION (PBKDF2)
// ==========================================

/**
 * Membuat hash password yang aman menggunakan PBKDF2 + salt acak
 * @param {string} password
 * @returns {string} format: "pbkdf2:100000:<salt_hex>:<hash_hex>"
 */
export function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password harus berupa string valid");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return `pbkdf2:${PBKDF2_ITERATIONS}:${salt}:${hash}`;
}

/**
 * Memverifikasi password input terhadap password yang tersimpan
 * Mendukung format hash PBKDF2 dan transparent fallback untuk akun legacy plaintext
 * @param {string} inputPassword
 * @param {string} storedPassword
 * @returns {{ isValid: boolean, needsRehash: boolean }}
 */
export function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) {
    return { isValid: false, needsRehash: false };
  }

  // Format PBKDF2 hash: pbkdf2:iterations:salt:hash
  if (storedPassword.startsWith("pbkdf2:")) {
    const parts = storedPassword.split(":");
    if (parts.length !== 4) {
      return { isValid: false, needsRehash: false };
    }
    const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
    const salt = parts[2];
    const originalHash = parts[3];

    const inputHash = crypto
      .pbkdf2Sync(inputPassword, salt, iterations, PBKDF2_KEYLEN, PBKDF2_DIGEST)
      .toString("hex");

    const originalBuf = Buffer.from(originalHash, "hex");
    const inputBuf = Buffer.from(inputHash, "hex");

    if (originalBuf.length !== inputBuf.length) {
      return { isValid: false, needsRehash: false };
    }

    const isValid = crypto.timingSafeEqual(originalBuf, inputBuf);
    return { isValid, needsRehash: false };
  }

  // Fallback untuk legacy plaintext password (dengan constant-time compare)
  const inputBuf = Buffer.from(inputPassword, "utf-8");
  const storedBuf = Buffer.from(storedPassword, "utf-8");

  if (inputBuf.length !== storedBuf.length) {
    return { isValid: false, needsRehash: false };
  }

  const isValid = crypto.timingSafeEqual(inputBuf, storedBuf);
  // Jika valid tapi masih format plaintext, tandai perlu rehash ke PBKDF2
  return { isValid, needsRehash: isValid };
}

// ==========================================
// 2. CRYPTOGRAPHICALLY SIGNED SESSION TOKENS
// ==========================================

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

/**
 * Membuat signed session token berbasis HMAC-SHA256
 * @param {object} payload data sesi
 * @param {number} expiresInSeconds masa berlaku dalam detik (default: 7 hari)
 * @returns {string} format: "<base64_payload>.<signature>"
 */
export function signSessionToken(payload, expiresInSeconds = 7 * 24 * 60 * 60) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const data = {
    ...payload,
    iat,
    exp,
    jti: crypto.randomBytes(12).toString("hex"),
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(data));
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payloadEncoded)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${payloadEncoded}.${signature}`;
}

/**
 * Memverifikasi dan mem-parse signed session token
 * @param {string} tokenString
 * @returns {object|null}
 */
export function verifySessionToken(tokenString) {
  if (!tokenString || typeof tokenString !== "string") return null;

  const parts = tokenString.split(".");
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  // Verifikasi HMAC signature dengan constant-time comparison
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payloadEncoded)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const sigBuf = Buffer.from(signature, "utf-8");
  const expSigBuf = Buffer.from(expectedSignature, "utf-8");

  if (sigBuf.length !== expSigBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expSigBuf)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);

    // Cek apakah token sudah expired
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ==========================================
// 3. RATE LIMITING & BRUTE-FORCE PROTECTION
// ==========================================

// In-memory tracker untuk failed login attempts
// Format: key -> { attempts: number, firstAttempt: number, lastAttempt: number, lockedUntil: number }
const loginAttempts = new Map();

// Bersihkan data lama setiap 30 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (data.lockedUntil && data.lockedUntil < now) {
      loginAttempts.delete(key);
    } else if (now - data.lastAttempt > 30 * 60 * 1000) {
      loginAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 menit terkunci

/**
 * Memeriksa status rate limit untuk IP atau email tertentu
 * @param {string} key identifier (IP atau email)
 * @returns {{ isLocked: boolean, remainingAttempts: number, lockRemainingSeconds: number }}
 */
export function checkRateLimit(key) {
  if (!key) return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockRemainingSeconds: 0 };

  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockRemainingSeconds: 0 };
  }

  // Cek apakah masih dalam masa lockout
  if (record.lockedUntil && record.lockedUntil > now) {
    const lockRemainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingAttempts: 0, lockRemainingSeconds };
  }

  // Jika jendela waktu sudah lewat, reset counter
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(key);
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockRemainingSeconds: 0 };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts);
  return { isLocked: remainingAttempts === 0, remainingAttempts, lockRemainingSeconds: 0 };
}

/**
 * Mencatat percobaan login yang gagal
 * @param {string} key identifier (IP atau email)
 * @returns {{ isLocked: boolean, remainingAttempts: number, lockRemainingSeconds: number }}
 */
export function recordFailedAttempt(key) {
  if (!key) return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, lockRemainingSeconds: 0 };

  const now = Date.now();
  let record = loginAttempts.get(key);

  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    record = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
      lockedUntil: 0,
    };
  } else {
    record.attempts += 1;
    record.lastAttempt = now;
  }

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, record);
    return { isLocked: true, remainingAttempts: 0, lockRemainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  loginAttempts.set(key, record);
  return {
    isLocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
    lockRemainingSeconds: 0,
  };
}

/**
 * Me-reset catatan percobaan gagal setelah login berhasil
 * @param {string} key
 */
export function resetRateLimit(key) {
  if (key) {
    loginAttempts.delete(key);
  }
}

// ==========================================
// 4. CLIENT IP EXTRACTION
// ==========================================

export function getClientIp(request) {
  if (!request) return "127.0.0.1";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
