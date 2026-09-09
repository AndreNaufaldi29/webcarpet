import ProductDetail from "../../../views/ProductDetail";
import { INITIAL_PRODUCTS } from "@/lib/data";
import prisma from "@/lib/prisma";

export const revalidate = 180;
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const productId = Number(resolvedParams?.id);

  let product = INITIAL_PRODUCTS.find((p) => p.id === productId);

  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (dbProduct) {
      product = {
        ...dbProduct,
        images: Array.isArray(dbProduct.images)
          ? dbProduct.images
          : typeof dbProduct.images === "string"
          ? JSON.parse(dbProduct.images)
          : [],
      };
    }
  } catch (e) {
    // Gunakan fallback static data jika database offline saat build
  }

  if (!product) {
    return {
      title: "Detail Produk Karpet | Rumah Indah Carpet",
      description: "Pilihan karpet premium berkualitas tinggi dari Rumah Indah Carpet.",
      alternates: {
        canonical: `/product/${resolvedParams?.id || ""}`,
        languages: {
          "id-ID": `/product/${resolvedParams?.id || ""}`,
        },
      },
    };
  }

  const title = `${product.name} - Karpet Premium Berkualitas | Rumah Indah Carpet`;
  const description =
    product.description ||
    `Pilihan karpet ${product.category || "premium"} berkualitas tinggi dengan material terbaik dan layanan pasang rapi dari Rumah Indah Carpet.`;
  const imageUrl =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200";

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      "karpet masjid",
      "karpet hotel",
      "karpet kantor",
      "rumah indah carpet",
    ].filter(Boolean),
    alternates: {
      canonical: `/product/${product.id}`,
      languages: {
        "id-ID": `/product/${product.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/product/${product.id}`,
      siteName: "Rumah Indah Carpet",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProductPage() {
  return <ProductDetail />;
}
