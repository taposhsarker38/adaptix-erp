import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, TrendingUp, History } from "lucide-react";
import { format } from "date-fns";
import * as React from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface LoyaltyViewProps {
  customerId: string;
}

export function LoyaltyView({ customerId }: LoyaltyViewProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [adjustPoints, setAdjustPoints] = React.useState("");
  const [adjustReason, setAdjustReason] = React.useState("");
  const [adjusting, setAdjusting] = React.useState(false);

  const fetchLoyalty = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/customer/loyalty/accounts/by-customer/${customerId}/`
      );
      setData(res.data);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!data?.id || !adjustPoints || !adjustReason) return;

    try {
      setAdjusting(true);
      const response = await api.post(
        `/customer/loyalty/accounts/${data.id}/adjust/`,
        {
          points: parseInt(adjustPoints),
          reason: adjustReason,
        }
      );

      toast.success("Points adjusted successfully!");

      // Show tier upgrade message if applicable
      if (response.data.tier_upgraded) {
        toast.success(`🎉 ${response.data.tier_message}`, { duration: 5000 });
      }

      setAdjustPoints("");
      setAdjustReason("");
      await fetchLoyalty();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to adjust points");
    } finally {
      setAdjusting(false);
    }
  };

  React.useEffect(() => {
    fetchLoyalty();
  }, [customerId]);

  if (loading) return <div>Loading loyalty...</div>;
  if (!data)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-400">
            Loyalty Program Not Active
          </CardTitle>
        </CardHeader>
      </Card>
    );

  const nextTierPoints = 1000; // Hardcoded for demo or derived
  const progress = (data.lifetime_points / nextTierPoints) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Points
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.balance}</div>
            <p className="text-xs text-muted-foreground">Available to redeem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lifetime_points}</div>
            <p className="text-xs text-muted-foreground">Since joining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tier Status</CardTitle>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-yellow-200 to-yellow-500 text-yellow-900 border-0"
            >
              {data.tier_name || "Member"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.lifetime_points} / {nextTierPoints} to next tier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Point Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Adjust Points (Admin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Points</label>
              <Input
                type="number"
                placeholder="e.g. +100 or -50"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Reason</label>
              <Input
                placeholder="e.g. Bonus reward, Correction"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAdjustPoints}
                disabled={!adjustPoints || !adjustReason || adjusting}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {adjusting ? "Adjusting..." : "Adjust Points"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_transactions?.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {format(new Date(tx.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {tx.transaction_type}
                  </TableCell>
                  <TableCell
                    className={
                      tx.points > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {tx.points > 0 ? "+" : ""}
                    {tx.points}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.description || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {!data.recent_transactions?.length && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No history yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
