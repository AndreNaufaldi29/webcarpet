// Store & Helper Interaktif Blog Rumah Indah Carpet

import { ARTICLES, BLOG_CATEGORIES, getAllArticles, getArticleBySlug, getRelatedArticles } from "./blogData";

const STORAGE_KEY = "abcarpet_blog_articles_v1";

export function getStoredArticles() {
  if (typeof window === "undefined") return ARTICLES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ARTICLES));
      return ARTICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return ARTICLES;
  } catch (e) {
    console.error("Gagal membaca artikel dari storage:", e);
    return ARTICLES;
  }
}

export function saveArticles(articles) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    window.dispatchEvent(
      new CustomEvent("abcarpet:articles_updated", {
        detail: articles,
      })
    );
  } catch (e) {
    console.error("Gagal menyimpan artikel:", e);
  }
}

export function subscribeArticles(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getStoredArticles());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getStoredArticles());
    }
  };

  window.addEventListener("abcarpet:articles_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("abcarpet:articles_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

export async function incrementArticleViews(slug) {
  if (typeof window === "undefined" || !slug) return;
  try {
    // 1. Optimistic update local storage
    const articles = getStoredArticles();
    const optimisticArticles = articles.map((art) => {
      if (art.slug === slug || String(art.id) === String(slug)) {
        return { ...art, views: (art.views || 0) + 1 };
      }
      return art;
    });
    saveArticles(optimisticArticles);

    // 2. Real-time atomic increment in Prisma PostgreSQL Database
    const res = await fetch("/api/articles/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const json = await res.json();
    if (json.success && json.data?.views !== undefined) {
      const currentList = getStoredArticles();
      const synced = currentList.map((art) => {
        if (art.slug === slug || String(art.id) === String(slug)) {
          return { ...art, views: json.data.views };
        }
        return art;
      });
      saveArticles(synced);
    }
  } catch (e) {
    console.warn("Increment views error:", e);
  }
}

export function addStoredArticle(article) {
  const current = getStoredArticles();
  const newItem = {
    id: article.id || Date.now(),
    views: 0,
    status: "Dipublikasikan",
    publishedAt: "Maret 2026",
    readTime: "5 Menit Baca",
    ...article,
  };
  const updated = [newItem, ...current];
  saveArticles(updated);
  return newItem;
}

export function updateStoredArticle(id, data) {
  const current = getStoredArticles();
  const updated = current.map((item) =>
    item.id === id || item.slug === id ? { ...item, ...data } : item
  );
  saveArticles(updated);
  return updated.find((item) => item.id === id || item.slug === id);
}

export function deleteStoredArticle(id) {
  const current = getStoredArticles();
  const updated = current.filter((item) => item.id !== id && item.slug !== id);
  saveArticles(updated);
  return updated;
}

export async function syncArticlesFromDatabase() {
  if (typeof window === "undefined") return getStoredArticles();
  try {
    const res = await fetch(`/api/articles?t=${Date.now()}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      saveArticles(json.data);
      return json.data;
    }
  } catch (e) {
    console.warn("Sync articles failed:", e);
  }
  return getStoredArticles();
}

export { ARTICLES, BLOG_CATEGORIES, getAllArticles, getArticleBySlug, getRelatedArticles };
