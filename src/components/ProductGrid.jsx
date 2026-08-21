import products from "../data/products";
import ProductCard from "./ProductCard";

function ProductGrid() {
  return (
    <section className="product-section">
      <div className="section-header">
        <h2>Produk Unggulan</h2>
        <p>
          Koleksi karpet terbaik
          Rumah Indah Carpet
        </p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;