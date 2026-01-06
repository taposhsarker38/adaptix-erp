import Dexie, { type Table } from "dexie";

export interface SyncItem {
  id?: number;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  data: any;
  timestamp: number;
  status: "pending" | "syncing" | "failed";
}

export interface CacheItem {
  key: string; // URL
  data: any;
  expiresAt: number;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  sales_price: number;
  category: any;
  stock_quantity: number;
  [key: string]: any;
}

export interface CategoryItem {
  id: string;
  name: string;
  [key: string]: any;
}

export class OfflineDB extends Dexie {
  syncQueue!: Table<SyncItem>;
  cache!: Table<CacheItem>;
  products!: Table<ProductItem>;
  categories!: Table<CategoryItem>;

  constructor() {
    super("AdaptixOfflineDB");
    this.version(2).stores({
      syncQueue: "++id, status, timestamp",
      cache: "key, expiresAt",
      products: "id, name, sku, category",
      categories: "id, name",
    });
  }
}

export const db = new OfflineDB();
