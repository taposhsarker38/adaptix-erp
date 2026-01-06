import api from "@/lib/api";
import { db } from "./OfflineStore";

export async function syncProductCatalog() {
  console.info("CatalogSync: Starting inventory synchronization...");
  try {
    const [prodRes, catRes] = await Promise.all([
      api.get("product/products/"),
      api.get("product/categories/"),
    ]);

    const products = Array.isArray(prodRes.data.data)
      ? prodRes.data.data
      : Array.isArray(prodRes.data)
      ? prodRes.data
      : [];

    const categories = Array.isArray(catRes.data.data)
      ? catRes.data.data
      : Array.isArray(catRes.data)
      ? catRes.data
      : [];

    // Clear and update local tables
    await db.transaction("rw", [db.products, db.categories], async () => {
      await db.products.clear();
      await db.categories.clear();

      await db.products.bulkAdd(products);
      await db.categories.bulkAdd(categories);
    });

    console.info(
      `CatalogSync: Successfully synced ${products.length} products and ${categories.length} categories.`
    );
    return true;
  } catch (error) {
    console.error("CatalogSync: Synchronization failed", error);
    return false;
  }
}

export async function getLocalProducts() {
  return await db.products.toArray();
}

export async function getLocalCategories() {
  return await db.categories.toArray();
}
