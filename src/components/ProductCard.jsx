function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
      />

      <div className="product-info">
        <span className="badge">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p>{product.price}</p>

        <button>
          Detail Produk
        </button>
      </div>
    </div>
  );
}

export default ProductCard;