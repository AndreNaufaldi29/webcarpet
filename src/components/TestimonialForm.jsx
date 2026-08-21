"use client";

import { useState, useRef } from "react";
import { addTestimonial } from "@/lib/testimonialStore";
import {
  FiStar,
  FiSend,
  FiCheckCircle,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiMessageSquare,
  FiSmile,
  FiUploadCloud,
  FiImage,
  FiVideo,
  FiTrash2,
  FiFilm,
  FiAlertCircle,
} from "react-icons/fi";

export default function TestimonialForm() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "Karpet Masjid",
    city: "",
    review: "",
  });

  // State untuk menyimpan foto & video yang diunggah
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const ratingDescriptions = {
    1: "Kurang Puas",
    2: "Cukup",
    3: "Puas",
    4: "Sangat Puas",
    5: "Luar Biasa & Sangat Merekomendasikan! ⭐",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler proses pembacaan file foto / video
  const processFiles = (files) => {
    setUploadError("");
    const fileList = Array.from(files);

    if (uploadedMedia.length + fileList.length > 4) {
      setUploadError("Maksimal 4 file (foto / video) yang dapat diunggah.");
      return;
    }

    fileList.forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setUploadError("Hanya file Foto (JPG, PNG, WEBP) atau Video (MP4, WebM) yang didukung.");
        return;
      }

      // Validasi ukuran: max 15MB
      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`Ukuran file "${file.name}" melebihi batas 15 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newMediaItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: isVideo ? "video" : "image",
          src: event.target.result,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        };

        setUploadedMedia((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, newMediaItem];
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (idToRemove) => {
    setUploadedMedia((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.review.trim()) return;

    setIsSubmitting(true);

    try {
      // Simpan testimonial ke store dengan status 'Menunggu Persetujuan' beserta media foto/video
      addTestimonial({
        name: formData.name,
        role: formData.role,
        category: formData.category,
        city: formData.city,
        review: formData.review,
        rating: rating,
        status: "Menunggu Persetujuan",
        media: uploadedMedia.map(({ type, src, name }) => ({
          type,
          src,
          name,
        })),
      });
    } catch (err) {
      console.error("Gagal mengirim ulasan:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      role: "",
      category: "Karpet Masjid",
      city: "",
      review: "",
    });
    setUploadedMedia([]);
    setRating(5);
    setUploadError("");
    setSubmitted(false);
  };

  return (
    <section className="testimonial-form-section" id="kirim-testimoni">
      <div className="testimonial-form-container">
        {/* HEADER */}
        <div className="form-section-header">
          <span className="section-badge">BAGIKAN PENGALAMAN ANDA</span>
          <h2>Puas dengan Produk & Layanan Rumah Indah Carpet?</h2>
          <p>
            Ceritakan pengalaman Anda setelah memesan atau memasang karpet bersama kami. Ulasan serta dokumentasi foto dan video Anda sangat berharga bagi kami dan calon pelanggan lainnya.
          </p>
        </div>

        {/* CARD CONTAINER */}
        <div className="testimonial-form-card">
          {submitted ? (
            <div className="testimonial-success-state">
              <div className="success-icon-badge">
                <FiCheckCircle />
              </div>
              <h3>Terima Kasih Banyak atas Ulasan Anda! 🎉</h3>
              <p>
                Testimoni Anda dari <strong>{formData.name}</strong> ({rating} Bintang)
                {uploadedMedia.length > 0
                  ? ` beserta ${uploadedMedia.length} foto/video dokumentasi`
                  : ""}{" "}
                telah berhasil terkirim dan akan ditampilkan di halaman beranda setelah diverifikasi oleh tim Rumah Indah Carpet.
              </p>
              <button
                type="button"
                className="submit-review-btn secondary"
                onClick={handleReset}
              >
                Kirim Ulasan Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="testimonial-form-body">
              {/* STAR RATING PICKER */}
              <div className="form-rating-group">
                <label className="form-group-label">
                  <FiSmile /> Berapa Nilai Kepuasan Anda? <span className="req">*</span>
                </label>

                <div className="star-picker-wrapper">
                  <div className="star-picker-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-pick-btn ${
                          (hoverRating || rating) >= star ? "active" : ""
                        }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Beri rating ${star} bintang`}
                      >
                        <FiStar fill={(hoverRating || rating) >= star ? "#f59e0b" : "none"} />
                      </button>
                    ))}
                  </div>
                  <span className="star-rating-label">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* INPUT FIELDS */}
              <div className="form-grid-2col">
                <div className="form-input-field">
                  <label htmlFor="name">
                    Nama Lengkap <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <FiUser className="field-icon" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Contoh: H. Ahmad Zaki"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-input-field">
                  <label htmlFor="role">
                    Instansi / Peran / Nama Masjid
                  </label>
                  <div className="input-with-icon">
                    <FiBriefcase className="field-icon" />
                    <input
                      id="role"
                      type="text"
                      name="role"
                      placeholder="Contoh: Pengurus Masjid Al-Barokah"
                      value={formData.role}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-input-field">
                  <label htmlFor="category">
                    Kategori Karpet yang Digunakan
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Karpet Masjid">Karpet Masjid & Musholla</option>
                    <option value="Karpet Hotel">Karpet Hotel & Ballroom</option>
                    <option value="Karpet Kantor">Karpet Kantor & Komersial</option>
                    <option value="Karpet Rumah">Karpet Rumah & Residensial</option>
                    <option value="Karpet Custom">Karpet Motif Custom</option>
                    <option value="Aksesoris">Aksesoris & Lainnya</option>
                  </select>
                </div>

                <div className="form-input-field">
                  <label htmlFor="city">
                    Kota / Lokasi Pemasangan
                  </label>
                  <div className="input-with-icon">
                    <FiMapPin className="field-icon" />
                    <input
                      id="city"
                      type="text"
                      name="city"
                      placeholder="Contoh: Sidoarjo / Surabaya"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* CERITA & ULASAN */}
              <div className="form-input-field">
                <label htmlFor="review">
                  Tuliskan Cerita & Pengalaman Anda <span className="req">*</span>
                </label>
                <div className="input-with-icon textarea-wrapper">
                  <FiMessageSquare className="field-icon textarea-icon" />
                  <textarea
                    id="review"
                    name="review"
                    rows="4"
                    placeholder="Ceritakan kepuasan Anda mengenai kelembutan karpet, kerapihan pemasangan, kecepatan pelayanan, atau respon tim teknisi kami..."
                    required
                    value={formData.review}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* UPLOAD FOTO & VIDEO DOKUMENTASI */}
              <div className="form-input-field" style={{ marginTop: "8px" }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    Upload Foto & Video Pemasangan Karpet <span style={{ color: "#94a3b8", fontWeight: "normal" }}>(Opsional)</span>
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>
                    {uploadedMedia.length}/4 File
                  </span>
                </label>

                {/* HIDDEN FILE INPUT */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  multiple
                  accept="image/png, image/jpeg, image/webp, image/jpg, video/mp4, video/webm, video/quicktime"
                  style={{ display: "none" }}
                />

                {/* DROPZONE AREA */}
                <div
                  className={`form-upload-zone ${isDragging ? "drag-over" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="upload-icon-circle">
                    <FiUploadCloud />
                  </div>
                  <div className="upload-zone-text">
                    <h4>Klik atau Seret Foto & Video Karpet ke Sini</h4>
                    <p>Bagikan hasil karpet terpasang di masjid, hotel, kantor, atau rumah Anda</p>
                  </div>
                  <div className="upload-badges">
                    <span className="upload-badge">
                      <FiImage size={12} /> Foto (JPG, PNG, WEBP)
                    </span>
                    <span className="upload-badge">
                      <FiVideo size={12} /> Video (MP4, WebM)
                    </span>
                    <span className="upload-badge">Maks. 4 File (15MB)</span>
                  </div>
                </div>

                {uploadError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "8px",
                      color: "#ef4444",
                      fontSize: "0.83rem",
                      fontWeight: "600",
                    }}
                  >
                    <FiAlertCircle />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* UPLOADED PREVIEWS */}
                {uploadedMedia.length > 0 && (
                  <div className="uploaded-media-grid">
                    {uploadedMedia.map((media) => (
                      <div className="uploaded-media-card" key={media.id}>
                        {media.type === "image" ? (
                          <img src={media.src} alt={media.name || "Foto Karpet"} />
                        ) : (
                          <video src={media.src} muted />
                        )}

                        <span className="uploaded-media-type-badge">
                          {media.type === "image" ? (
                            <>
                              <FiImage size={10} /> Foto
                            </>
                          ) : (
                            <>
                              <FiFilm size={10} /> Video
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          className="uploaded-media-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMedia(media.id);
                          }}
                          title="Hapus file ini"
                          aria-label="Hapus file"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON ROW */}
              <div className="form-submit-row">
                <p className="form-note">
                  🔒 Ulasan Anda akan dipublikasikan dengan nama, instansi, dan dokumentasi yang Anda cantumkan.
                </p>
                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={isSubmitting}
                >
                  <FiSend />
                  <span>{isSubmitting ? "Mengirim Ulasan..." : "Kirim Testimoni"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
