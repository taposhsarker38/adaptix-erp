import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentSalesProps {
  topProducts: any[];
}

export function RecentSales({ topProducts }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {topProducts.length === 0 && (
        <div className="text-center text-muted-foreground text-sm">
          No sales data yet.
        </div>
      )}
      {topProducts.map((product) => (
        <div
          className="flex items-center"
          key={product.id || product.product_name}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {product.product_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {product.product_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Units Sold: {product.total_sold}
            </p>
          </div>
          {/* <div className="ml-auto font-medium">+$1,999.00</div>  Revenue per product not tracked in simple model yet */}
        </div>
      ))}
    </div>
  );
}
