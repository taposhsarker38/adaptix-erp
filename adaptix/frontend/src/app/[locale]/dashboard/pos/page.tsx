"use client";

import * as React from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { Cart } from "@/components/pos/cart";
import { usePOSShortcuts } from "@/hooks/usePOSShortcuts";
import { LayoutGrid, ShoppingCart as CartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";

export default function POSPage() {
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [isUpdatingPrices, setIsUpdatingPrices] = React.useState(false);
  const [aiSessionId, setAiSessionId] = React.useState<string | null>(null);
  const [isOnline, setIsOnline] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"products" | "cart">(
    "products"
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const hOnline = () => setIsOnline(true);
      const hOffline = () => setIsOnline(false);
      window.addEventListener("online", hOnline);
      window.addEventListener("offline", hOffline);

      // Perform initial catalog sync to ensure local DB is fresh
      if (navigator.onLine) {
        import("@/lib/offline/CatalogSync").then(({ syncProductCatalog }) => {
          syncProductCatalog();
        });
      }

      return () => {
        window.removeEventListener("online", hOnline);
        window.removeEventListener("offline", hOffline);
      };
    }
  }, []);

  // Recalculate all item prices when customer changes
  const updateCartPrices = React.useCallback(
    async (customer: any) => {
      if (cartItems.length === 0) return;

      setIsUpdatingPrices(true);
      try {
        const updatedItems = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const res = await api.get(
                `/product/variants/${item.id}/calculate_price/`,
                {
                  params: { price_list_uuid: customer?.price_list_uuid },
                }
              );
              return { ...item, sales_price: res.data.price };
            } catch (e) {
              return item;
            }
          })
        );
        setCartItems(updatedItems);
        toast.success(`Prices updated for ${customer?.name || "Retail"}`);
      } catch (error) {
        toast.error("Failed to update pricing tiers");
      } finally {
        setIsUpdatingPrices(false);
      }
    },
    [cartItems]
  );

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    if (cartItems.length > 0) {
      updateCartPrices(customer);
    }
  };

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [quickPayAmount, setQuickPayAmount] = React.useState<number | null>(
    null
  );

  const handleQuickCheckout = (amount: number) => {
    setQuickPayAmount(amount);
    setCheckoutOpen(true);
  };

  const addToCart = async (product: any) => {
    let finalPrice = product.sales_price;

    // Check for tiered price if customer is selected
    if (selectedCustomer?.price_list_uuid) {
      try {
        const res = await api.get(
          `/product/variants/${product.id}/calculate_price/`,
          {
            params: { price_list_uuid: selectedCustomer.price_list_uuid },
          }
        );
        finalPrice = res.data.price;
      } catch (e) {
        console.error("Tiered price lookup failed, using default.");
      }
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, sales_price: finalPrice }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, sales_price: finalPrice }];
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
    setSelectedCustomer(null);
    setQuickPayAmount(null);
    setAiSessionId(null);
    toast.info("POS state reset");
  };

  // Keyboard Shortcuts Integration
  usePOSShortcuts({
    onSearch: () => {
      const input = document.querySelector(
        'input[placeholder*="Search"]'
      ) as HTMLInputElement;
      input?.focus();
      input?.select();
    },
    onCheckout: () => {
      if (cartItems.length > 0) {
        setCheckoutOpen(true);
      } else {
        toast.error("Cart is empty");
      }
    },
    onClearCart: clearCart,
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 dark:bg-black overflow-hidden relative">
      {!isOnline && (
        <div className="bg-orange-500 text-white text-[11px] font-bold py-1 px-4 flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>OFFLINE MODE ACTIVE - Using local data cache</span>
          </div>
          <span className="opacity-80 md:block hidden">
            Orders will sync automatically when connection returns
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Products Section - Visible on desktop orb active tab on mobile */}
        <div
          className={cn(
            "flex-1 h-full overflow-hidden border-r bg-white dark:bg-slate-950 shadow-xl z-0 transition-all duration-300",
            activeTab !== "products" && "hidden lg:block"
          )}
        >
          <ProductGrid onAddToCart={addToCart} />
        </div>

        {/* Cart Section - Visible on desktop or active tab on mobile */}
        <div
          className={cn(
            "w-full lg:w-[380px] xl:w-[420px] h-full bg-white dark:bg-slate-950 shadow-2xl z-10 overflow-hidden flex flex-col transition-all duration-300",
            activeTab !== "cart" && "hidden lg:flex"
          )}
        >
          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onClear={clearCart}
            onCheckoutSuccess={() => {
              if (aiSessionId) {
                api
                  .post("intelligence/vision/cart-sync/", {
                    session_id: aiSessionId,
                  })
                  .then(() => toast.success("AI Cart converted successfully"))
                  .catch((err) =>
                    console.error("Failed to convert AI cart:", err)
                  );
              }
              setCartItems([]);
              setSelectedCustomer(null);
              setQuickPayAmount(null);
              setAiSessionId(null);
              // Switch back to products after success if on mobile
              if (window.innerWidth < 1024) setActiveTab("products");
            }}
            checkoutOpen={checkoutOpen}
            onCheckoutOpenChange={setCheckoutOpen}
            onLoadAICart={(newItems, sessionId) => {
              setCartItems((prev) => [...prev, ...newItems]);
              setAiSessionId(sessionId);
              if (window.innerWidth < 1024) setActiveTab("cart");
            }}
            onQuickCheckout={handleQuickCheckout}
            quickPayAmount={quickPayAmount}
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            isUpdatingPrices={isUpdatingPrices}
            onBack={() => setActiveTab("products")}
          />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex border-t bg-white dark:bg-slate-950 h-16 shrink-0 z-50">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-all",
            activeTab === "products"
              ? "text-primary font-bold bg-primary/5"
              : "text-slate-500"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-tighter">
            Products
          </span>
        </button>
        <button
          onClick={() => setActiveTab("cart")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-all relative",
            activeTab === "cart"
              ? "text-primary font-bold bg-primary/5"
              : "text-slate-500"
          )}
        >
          <div className="relative">
            <CartIcon className="h-5 w-5" />
            {cartItems.length > 0 && (
              <Badge
                className="absolute -top-2 -right-3 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] bg-red-500 border-white"
                variant="destructive"
              >
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </Badge>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-tighter">Cart</span>
        </button>
      </div>
    </div>
  );
}
