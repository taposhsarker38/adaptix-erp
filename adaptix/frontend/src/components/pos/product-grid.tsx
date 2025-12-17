"use client";

import * as React from "react";
import { Search } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProductGridProps {
  onAddToCart: (product: any) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart }) => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get("/product/products/"),
        api.get("/product/categories/"),
      ]);

      const prods = Array.isArray(prodRes.data.data)
        ? prodRes.data.data
        : Array.isArray(prodRes.data)
        ? prodRes.data
        : [];

      const cats = Array.isArray(catRes.data.data)
        ? catRes.data.data
        : Array.isArray(catRes.data)
        ? catRes.data
        : [];

      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      String(p.category) === categoryFilter ||
      String(p.category?.id) === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-center p-8 text-muted-foreground">
            Loading products...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative cursor-pointer overflow-hidden rounded-md border bg-card shadow-sm hover:shadow-md transition-all active:scale-95"
                onClick={() => onAddToCart(product)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
                  {/* Placeholder for Image */}
                  {product.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(product.sales_price || 0)}
                    </span>
                    {product.sku && (
                      <Badge variant="outline" className="text-xs">
                        {product.sku}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center p-8 text-muted-foreground">
                No products found.
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
