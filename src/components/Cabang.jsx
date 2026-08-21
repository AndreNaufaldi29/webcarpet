"use client";

import { useState, useEffect, useMemo } from "react";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";
import {
  getStoredBranches,
  subscribeBranches,
  syncBranchesFromDatabase,
  DEFAULT_BRANCHES,
} from "@/lib/branchStore";
import {
  FiMapPin,
  FiPhone,
  FiNavigation,
  FiStar,
  FiCheckCircle,
  FiAward,
  FiSearch,
  FiX,
  FiClock,
  FiCopy,
  FiCheck,
  FiMap,
  FiCalendar,
} from "react-icons/fi";
import { FaWhatsapp, FaStore } from "react-icons/fa";

function Cabang() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [selectedCity, setSelectedCity] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedMapBranchId, setSelectedMapBranchId] = useState(null);

  useEffect(() => {
    // 1. Settings subscription
    setSettings(getStoredSettings());
    const unsubSettings = subscribeSettings((updated) => {
      setSettings(updated);
    });

    // 2. Branches initial & DB fetch
    setBranches(getStoredBranches());
    syncBranchesFromDatabase().then((dbBranches) => {
      if (Array.isArray(dbBranches) && dbBranches.length > 0) {
        setBranches(dbBranches);
      }
    });

    // 3. Branches realtime event subscription
    const unsubBranches = subscribeBranches((updated) => {
      setBranches(updated);
    });

    return () => {
      unsubSettings();
      unsubBranches();
    };
  }, []);

  const cleanWhatsapp = (settings.whatsapp || "08212128701").replace(/[^0-9]/g, "");
  const activeBranches = useMemo(
    () => branches.filter((b) => b.status !== "Nonaktif"),
    [branches]
  );

  // Set default map branch once branches are loaded
  useEffect(() => {
    if (activeBranches.length > 0 && !selectedMapBranchId) {
      setSelectedMapBranchId(activeBranches[0].id || 1);
    }
  }, [activeBranches, selectedMapBranchId]);

  // Extract unique cities
  const cities = useMemo(() => {
    const unique = new Set();
    activeBranches.forEach((b) => {
      if (b.city && b.city.trim()) {
        unique.add(b.city.trim());
      }
    });
    return ["Semua", ...Array.from(unique)];
  }, [activeBranches]);

  // Filtered branches based on city and search query
  const filteredBranches = useMemo(() => {
    return activeBranches.filter((b) => {
      const matchCity = selectedCity === "Semua" || b.city?.toLowerCase() === selectedCity.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCity;
      const matchQuery =
        b.name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q) ||
        b.badge?.toLowerCase().includes(q);
      return matchCity && matchQuery;
    });
  }, [activeBranches, selectedCity, searchQuery]);

  const selectedMapBranch = useMemo(() => {
    return activeBranches.find((b) => b.id === selectedMapBranchId) || activeBranches[0] || null;
  }, [activeBranches, selectedMapBranchId]);

  const handleOpenMaps = (url, address, name) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      const q = encodeURIComponent(`${name}, ${address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    }
  };

  const handleWhatsApp = (branchName) => {
    const msg = `Halo ${settings.companyName || "Rumah Indah Carpet"}, saya ingin konsultasi dan berkunjung ke ${branchName}.`;
    const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCopyAddress = (id, address) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  const handleFocusMap = (branchId) => {
    setSelectedMapBranchId(branchId);
    const mapEl = document.getElementById("branch-interactive-map");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="branch-section">
      {/* HEADER WITH SHIMMER BADGE */}
      <div className="branch-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>JARINGAN & SHOWROOM RESMI</span>
        </span>

        <h2>Cabang & Showroom {settings.companyName || "Rumah Indah Carpet"}</h2>

        <p>
          Kunjungi kantor pusat, workshop, dan showroom display kami di berbagai kota strategis Jawa Timur untuk melihat langsung ratusan sampel karpet premium & konsultasi gratis.
        </p>
      </div>

      {/* STATISTIK CARDS */}
      <div className="branch-stats">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <FaStore />
          </div>
          <div className="stat-card-info">
            <h3>{activeBranches.length}+</h3>
            <span>Showroom & Cabang</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">
            <FiCheckCircle />
          </div>
          <div className="stat-card-info">
            <h3>500+</h3>
            <span>Proyek Selesai</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon orange">
            <FiAward />
          </div>
          <div className="stat-card-info">
            <h3>100%</h3>
            <span>Garansi Pemasangan</span>
          </div>
        </div>
      </div>

      {/* FLEXIBLE FILTER & SEARCH TOOLBAR */}
      <div className="branch-toolbar">
        <div className="branch-search-box">
          <FiSearch className="branch-search-icon" />
          <input
            type="text"
            placeholder="Cari nama cabang, kota, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari Cabang"
          />
          {searchQuery && (
            <button
              type="button"
              className="branch-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Hapus kata kunci"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* CITY FILTER TABS */}
        <div className="branch-city-tabs" role="tablist" aria-label="Filter Kota Cabang">
          {cities.map((city) => {
            const count = city === "Semua"
              ? activeBranches.length
              : activeBranches.filter((b) => b.city?.toLowerCase() === city.toLowerCase()).length;
            const isActive = selectedCity.toLowerCase() === city.toLowerCase();

            return (
              <button
                key={city}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`city-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setSelectedCity(city)}
              >
                <span>{city}</span>
                <span className="city-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTS COUNT & RESET HELPER */}
      <div className="branch-results-meta">
        <span>
          Menampilkan <strong>{filteredBranches.length}</strong> dari {activeBranches.length} Cabang Resmi
        </span>
        {(searchQuery || selectedCity !== "Semua") && (
          <button
            type="button"
            className="branch-reset-filter-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("Semua");
            }}
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* CABANG GRID */}
      {filteredBranches.length > 0 ? (
        <div className="branch-grid">
          {filteredBranches.map((branch, idx) => (
            <div
              key={branch.id || idx}
              className="branch-card"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="branch-image">
                <img
                  src={
                    branch.image ||
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"
                  }
                  alt={branch.name}
                  className="branch-img"
                  loading="lazy"
                />
                <div className="branch-img-overlay" />
                <span className="branch-city">{branch.city}</span>
                <div className="branch-status-pill">
                  <span className="status-dot" />
                  <span>Buka • 08:00 - 17:00</span>
                </div>
              </div>

              <div className="branch-content">
                <div className="branch-badge-row">
                  <span className="branch-type-badge">
                    {branch.badge || "Showroom Display"}
                  </span>
                  <button
                    type="button"
                    className="branch-map-quick-btn"
                    onClick={() => handleFocusMap(branch.id)}
                    title="Lihat di Peta Interaktif"
                    aria-label="Lihat di Peta"
                  >
                    <FiMap size={13} />
                    <span>Peta</span>
                  </button>
                </div>

                <h3>{branch.name}</h3>

                <div className="branch-info">
                  <div className="info-item">
                    <FiMapPin className="info-icon" />
                    <div className="info-text">
                      <span>{branch.address}</span>
                      <button
                        type="button"
                        className={`copy-address-btn ${copiedId === branch.id ? "copied" : ""}`}
                        onClick={() => handleCopyAddress(branch.id, branch.address)}
                        aria-label="Salin Alamat"
                      >
                        {copiedId === branch.id ? (
                          <>
                            <FiCheck size={12} />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <FiCopy size={12} />
                            <span>Salin Alamat</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="info-item">
                    <FiPhone className="info-icon" />
                    <div className="info-text">
                      <a
                        href={`tel:${(branch.phone || settings.phone || "0821-2128-701").replace(/[^0-9+]/g, "")}`}
                        className="phone-link"
                      >
                        {branch.phone || settings.phone || "0821-2128-701"}
                      </a>
                    </div>
                  </div>

                  <div className="info-item">
                    <FiClock className="info-icon" />
                    <div className="info-text">
                      <span>{settings.workingHours || "Senin - Sabtu: 08:00 - 17:00 WIB"}</span>
                    </div>
                  </div>
                </div>

                {/* DUAL ACTION BUTTONS (FLEXIBLE & TOUCH FRIENDLY) */}
                <div className="branch-buttons">
                  <button
                    type="button"
                    className="location-btn"
                    onClick={() => handleOpenMaps(branch.mapsUrl, branch.address, branch.name)}
                    aria-label={`Petunjuk arah ke ${branch.name}`}
                  >
                    <FiNavigation size={15} />
                    <span>Petunjuk Arah</span>
                  </button>

                  <button
                    type="button"
                    className="wa-btn"
                    onClick={() => handleWhatsApp(branch.name)}
                    aria-label={`Hubungi via WhatsApp ${branch.name}`}
                  >
                    <FaWhatsapp size={16} />
                    <span>Hubungi Cabang</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="branch-empty-state">
          <div className="empty-icon">
            <FiSearch size={32} />
          </div>
          <h3>Cabang Tidak Ditemukan</h3>
          <p>
            Tidak ada cabang yang cocok dengan kata kunci &quot;{searchQuery}&quot; di kota {selectedCity}.
          </p>
          <button
            type="button"
            className="branch-reset-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("Semua");
            }}
          >
            Tampilkan Semua Cabang
          </button>
        </div>
      )}

      {/* INTERACTIVE MAP SECTION */}
      {selectedMapBranch && (
        <div className="branch-map" id="branch-interactive-map">
          <div className="map-header">
            <div className="map-header-left">
              <span className="map-tag">PETA LOKASI INTERAKTIF</span>
              <h3>{selectedMapBranch.name}</h3>
              <p>
                <FiMapPin size={14} style={{ display: "inline", marginRight: "6px" }} />
                {selectedMapBranch.address}
              </p>
            </div>

            <div className="map-header-actions">
              <button
                type="button"
                className="map-nav-btn"
                onClick={() =>
                  handleOpenMaps(
                    selectedMapBranch.mapsUrl,
                    selectedMapBranch.address,
                    selectedMapBranch.name
                  )
                }
              >
                <FiNavigation size={14} />
                <span>Buka di Google Maps</span>
              </button>
            </div>
          </div>

          {/* QUICK MAP BRANCH PICKER PILLS */}
          <div className="map-branch-picker">
            {activeBranches.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`map-picker-pill ${selectedMapBranch.id === b.id ? "active" : ""}`}
                onClick={() => setSelectedMapBranchId(b.id)}
              >
                <span className="dot" />
                <span>{b.city}: {b.name.replace(/(Rumah Indah Carpet|AB Carpet) (Head Office & Workshop|Showroom Cabang)?/i, "").trim() || b.name}</span>
              </button>
            ))}
          </div>

          <div className="map-embed-wrapper">
            <iframe
              title={`Peta Lokasi ${selectedMapBranch.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                selectedMapBranch.address || selectedMapBranch.name
              )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* CONSULTATION & ON-SITE SURVEY CTA BANNER */}
      <div className="branch-cta-banner">
        <div className="cta-content">
          <span className="cta-badge">
            <FiCalendar size={13} />
            <span>LAYANAN SURVEI & KONSULTASI GRATIS</span>
          </span>
          <h3>Ingin Tim Kami Datang Langsung ke Lokasi Anda?</h3>
          <p>
            Dapatkan layanan ukur lokasi presisi, estimasi kebutuhan karpet, dan bawa ratusan sampel bahan langsung ke masjid, kantor, atau kediaman Anda di seluruh Jawa Timur.
          </p>
        </div>
        <div className="cta-action">
          <button
            type="button"
            className="cta-wa-btn"
            onClick={() => {
              const msg = `Halo ${settings.companyName || "Rumah Indah Carpet"}, saya ingin mengajukan jadwal survei lokasi dan konsultasi sampel karpet.`;
              const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
              window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            <FaWhatsapp size={18} />
            <span>Jadwalkan Survei Sekarang</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cabang;
