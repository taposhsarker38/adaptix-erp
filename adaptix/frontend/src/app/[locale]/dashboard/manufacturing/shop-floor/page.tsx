"use client";

import * as React from "react";
import { ShopFloorControl } from "@/components/inventory/manufacturing/shop-floor-control";

export default function ShopFloorPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Shop Floor Control
        </h2>
      </div>
      <div className="h-full">
        <ShopFloorControl />
      </div>
    </div>
  );
}
