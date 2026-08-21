import heroImage from "../assets/hero.png";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <img
        src={heroImage}
        alt="Rumah Indah Carpet"
        className="hero-image"
      />

      <div className="hero-content">
        <span className="hero-tag">
          KARPET PREMIUM INDONESIA
        </span>

        <h1>
          Karpet Berkualitas
          <br />
          Untuk Masjid, Hotel,
          <br />
          Kantor & Rumah
        </h1>

        <p>
          Menyediakan berbagai pilihan
          karpet premium dengan layanan
          pemasangan profesional dan
          garansi kualitas terbaik.
        </p>

        <button>
          Lihat Katalog Produk →
        </button>
      </div>
    </section>
  );
}

export default Hero;