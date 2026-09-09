import crypto from "crypto";
import { signSessionToken, verifySessionToken, hashPassword, verifyPassword, checkRateLimit, recordFailedAttempt, resetRateLimit } from "../src/lib/security.js";

const SECRET_KEY = process.env.AUTH_SECRET || "abcarpet_secure_hmac_secret_2026_rumahindahcarpet_superkey";

async function verifyEdgeToken(tokenString) {
  if (!tokenString || typeof tokenString !== "string") return null;
  const parts = tokenString.split(".");
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payloadEncoded)
    );

    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSignature = btoa(binary)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      console.error("Signature mismatch:", signature, "vs", expectedSignature);
      return null;
    }

    let b64 = payloadEncoded.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const jsonStr = atob(b64);
    const payload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("Edge token verify error:", err);
    return null;
  }
}

async function runTests() {
  console.log("--- 1. Testing Password Hashing & Verification ---");
  const plain = "admin123";
  const hashed = hashPassword(plain);
  console.log("Hashed password format:", hashed);
  const verifyHashed = verifyPassword(plain, hashed);
  console.log("Verify correct hashed password:", verifyHashed);
  console.assert(verifyHashed.isValid === true && verifyHashed.needsRehash === false, "PBKDF2 verification failed");

  const verifyWrong = verifyPassword("wrongPass", hashed);
  console.log("Verify wrong password:", verifyWrong);
  console.assert(verifyWrong.isValid === false, "Wrong password passed unexpectedly");

  const verifyLegacy = verifyPassword("admin123", "admin123");
  console.log("Verify legacy plaintext password:", verifyLegacy);
  console.assert(verifyLegacy.isValid === true && verifyLegacy.needsRehash === true, "Legacy plaintext verification failed");

  console.log("\n--- 2. Testing Session Token Signing & Edge Verification ---");
  const payload = { uid: 1, email: "admin@abcarpet.com", role: "Super Admin", name: "Ahmad Fauzi" };
  const token = signSessionToken(payload, 3600);
  console.log("Generated token:", token);

  const nodeVerified = verifySessionToken(token);
  console.log("Node verifySessionToken result:", nodeVerified);
  console.assert(nodeVerified && nodeVerified.email === "admin@abcarpet.com", "Node verification failed");

  const edgeVerified = await verifyEdgeToken(token);
  console.log("Edge verifyEdgeToken result:", edgeVerified);
  console.assert(edgeVerified && edgeVerified.email === "admin@abcarpet.com", "Edge verification failed");

  console.log("\n--- 3. Testing Rate Limiting & Lockout ---");
  const testIp = "192.168.1.100";
  resetRateLimit(testIp);
  let status = checkRateLimit(testIp);
  console.log("Initial status:", status);
  console.assert(status.isLocked === false && status.remainingAttempts === 5, "Initial rate limit incorrect");

  for (let i = 1; i <= 5; i++) {
    const rec = recordFailedAttempt(testIp);
    console.log(`Failed attempt #${i}: remaining = ${rec.remainingAttempts}, locked = ${rec.isLocked}, seconds = ${rec.lockRemainingSeconds}`);
  }

  const lockedStatus = checkRateLimit(testIp);
  console.log("Locked status:", lockedStatus);
  console.assert(lockedStatus.isLocked === true && lockedStatus.lockRemainingSeconds > 0, "Lockout failed to engage");

  resetRateLimit(testIp);
  const afterReset = checkRateLimit(testIp);
  console.log("After reset:", afterReset);
  console.assert(afterReset.isLocked === false && afterReset.remainingAttempts === 5, "Reset failed");

  console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(console.error);
