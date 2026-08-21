"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";

import {
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";

import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

function Footer() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  const cleanWhatsapp = (settings.whatsapp || "08212128701").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp}`;

  return (
    <footer className="ab-footer">
      <div className="ab-footer-top">
        <div className="ab-footer-brand">
          <div className="ab-footer-logo-wrapper">
            <BrandLogo variant="light" size="lg" />
          </div>

          <p>
            {settings.description ||
              "Penyedia karpet premium untuk masjid, hotel, kantor dan rumah dengan kualitas terbaik serta layanan pemasangan profesional."}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="ab-footer-whatsapp"
          >
            <FaWhatsapp />
            Konsultasi WhatsApp
          </a>
        </div>

        <div className="ab-footer-column">
          <h4>Kontak & Alamat</h4>

          <p title="Telepon">
            <FiPhone />
            {settings.phone || "0821 2128 701"}
          </p>
          <p title="Email">
            <FiMail />
            {settings.email || "rumahindahkarpet1@gmail.com"}
          </p>
          <p title="Alamat">
            <FiMapPin />
            {settings.address || "Sidoarjo, Jawa Timur"}
          </p>
        </div>

        <div className="ab-footer-column">
          <h4>Navigasi</h4>

          <Link href="/">Beranda</Link>
          <Link href="/catalog">Katalog</Link>
          <Link href="/portofolio">Portofolio</Link>
          <Link href="/cabang">Cabang Kami</Link>
        </div>

        <div className="ab-footer-column">
          <h4>Ikuti Kami</h4>

          <div className="ab-footer-social">
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
                Instagram
              </a>
            )}

            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebook />
                Facebook
              </a>
            )}

            {settings.tiktok && (
              <a
                href={settings.tiktok}
                target="_blank"
                rel="noreferrer"
              >
                <FaTiktok />
                TikTok
              </a>
            )}

            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noreferrer"
              >
                <FaYoutube />
                YouTube
              </a>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="ab-footer-bottom">
        © {new Date().getFullYear()} {settings.companyName || "Rumah Indah Carpet"}. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
