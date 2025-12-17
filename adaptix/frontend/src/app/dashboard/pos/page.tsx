"use client";

import * as React from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { Cart } from "@/components/pos/cart";

export default function POSPage() {
  const [cartItems, setCartItems] = React.useState<any[]>([]);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="flex h-full h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="flex-1 overflow-hidden rounded-lg border bg-background shadow-sm">
        <ProductGrid onAddToCart={addToCart} />
      </div>
      <div className="w-[400px] flex-none rounded-lg border bg-surface shadow-sm overflow-hidden flex flex-col">
        <Cart
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onClear={clearCart}
          onCheckoutSuccess={clearCart}
        />
      </div>
    </div>
  );
}
