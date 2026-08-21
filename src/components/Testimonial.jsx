"use client";

import { useState, useEffect } from "react";
import {
  getStoredTestimonials,
  subscribeTestimonials,
  DEFAULT_TESTIMONIALS,
} from "@/lib/testimonialStore";

function Testimonial() {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    // Ambil hanya testimonial yang berstatus "Aktif" (sudah disetujui admin)
    const loadActive = (allList) => {
      const list = Array.isArray(allList) ? allList : getStoredTestimonials();
      const activeOnly = list.filter(
        (item) => item.status === "Aktif" || !item.status
      );
      setTestimonials(
        activeOnly.length > 0 ? activeOnly : DEFAULT_TESTIMONIALS
      );
    };

    loadActive(getStoredTestimonials());
    const unsubscribe = subscribeTestimonials((updatedList) => {
      loadActive(updatedList);
    });

    return () => unsubscribe();
  }, []);

  // Safe bounds check
  const activeList =
    testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const safeIndex = current >= activeList.length ? 0 : current;
  const currentItem = activeList[safeIndex] || activeList[0];

  const currentMedia =
    currentItem?.media && currentItem.media.length > 0
      ? currentItem.media
      : [
          {
            type: "image",
            src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
          },
        ];

  const safeMediaIndex =
    mediaIndex >= currentMedia.length ? 0 : mediaIndex;

  const next = () => {
    setCurrent((safeIndex + 1) % activeList.length);
    setMediaIndex(0);
  };

  const prev = () => {
    setCurrent(safeIndex === 0 ? activeList.length - 1 : safeIndex - 1);
    setMediaIndex(0);
  };

  if (!currentItem) return null;

  return (
    <section className="testimonial-section">
      <h2>Testimoni Pelanggan</h2>

      <p className="subtitle">
        Pengalaman nyata pelanggan yang telah menggunakan produk & layanan Rumah Indah Carpet
      </p>

      <div className="testimonial-card">
        <button
          className="arrow-btn"
          onClick={prev}
          aria-label="Testimoni Sebelumnya"
        >
          ❮
        </button>

        <div className="testimonial-grid">
          <div className="testimonial-info">
            <div className="stars">
              {"⭐".repeat(Math.max(1, Math.min(5, currentItem.rating || 5)))}
            </div>

            <p className="testimonial-text">
              "{currentItem.text || currentItem.review}"
            </p>

            <div className="user">
              {currentItem.photo ? (
                <img
                  src={currentItem.photo}
                  alt={currentItem.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentItem.name
                    )}&background=0A3B25&color=fff`;
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: currentItem.avatarBg || "#0A3B25",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  {currentItem.name?.charAt(0) || "U"}
                </div>
              )}

              <div>
                <h4>{currentItem.name}</h4>
                <span>
                  {currentItem.role}
                  {currentItem.city ? ` • ${currentItem.city}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="testimonial-media">
            {currentMedia[safeMediaIndex]?.type === "image" ? (
              <img
                src={currentMedia[safeMediaIndex].src}
                alt={`Dokumentasi Karpet - ${currentItem.name}`}
              />
            ) : (
              <video controls key={currentMedia[safeMediaIndex].src}>
                <source
                  src={currentMedia[safeMediaIndex].src}
                  type="video/mp4"
                />
              </video>
            )}

            {currentMedia.length > 1 && (
              <>
                <div className="media-controls">
                  <button
                    onClick={() =>
                      setMediaIndex(
                        safeMediaIndex === 0
                          ? currentMedia.length - 1
                          : safeMediaIndex - 1
                      )
                    }
                    aria-label="Media Sebelumnya"
                  >
                    ❮
                  </button>

                  <button
                    onClick={() =>
                      setMediaIndex(
                        safeMediaIndex === currentMedia.length - 1
                          ? 0
                          : safeMediaIndex + 1
                      )
                    }
                    aria-label="Media Berikutnya"
                  >
                    ❯
                  </button>
                </div>

                <div className="media-dots">
                  {currentMedia.map((_, index) => (
                    <span
                      key={index}
                      className={
                        safeMediaIndex === index ? "dot active-dot" : "dot"
                      }
                      onClick={() => setMediaIndex(index)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          className="arrow-btn"
          onClick={next}
          aria-label="Testimoni Berikutnya"
        >
          ❯
        </button>
      </div>
    </section>
  );
}

export default Testimonial;