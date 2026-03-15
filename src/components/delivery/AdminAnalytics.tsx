import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBillsByStatus } from "@/services/laundryItemService";
import { getAllCustomers } from "@/services/customerService";
import { toast } from "@/hooks/use-toast";
import { Download, TrendingUp, Users, ReceiptText, AlertTriangle } from "lucide-react";

const chartColors = ["#0ea5e9", "#22c55e", "#f97316", "#ef4444", "#6366f1"];

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatMoney = (amount: number) => `₹${amount.toFixed(2)}`;

const buildRange = (
  preset: string,
  custom: { from?: string; to?: string }
): { from: Date; to: Date } => {
  const now = new Date();
  if (preset === "7d") {
    return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now };
  }
  if (preset === "30d") {
    return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
  }
  if (preset === "90d") {
    return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now };
  }
  if (preset === "1y") {
    return { from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), to: now };
  }
  const from = custom.from ? new Date(custom.from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const to = custom.to ? new Date(custom.to) : now;
  return { from, to };
};

const getGranularity = (from: Date, to: Date) => {
  const diffDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));
  if (diffDays <= 31) return "day";
  if (diffDays <= 180) return "week";
  return "month";
};

const bucketLabel = (date: Date, granularity: string) => {
  if (granularity === "day") return format(date, "MMM d");
  if (granularity === "week") return `Wk ${format(date, "II")}`;
  return format(date, "MMM yyyy");
};

const AdminAnalytics = () => {
  const [preset, setPreset] = useState<string>("30d");
  const [customRange, setCustomRange] = useState<{ from?: string; to?: string }>({});
  const [paidBills, setPaidBills] = useState<any[]>([]);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [failedBills, setFailedBills] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [paid, pending, cancelled, allCustomers] = await Promise.all([
          getBillsByStatus("paid"),
          getBillsByStatus("pending"),
          getBillsByStatus("cancelled"),
          getAllCustomers(),
        ]);
        setPaidBills(paid || []);
        setPendingBills(pending || []);
        setFailedBills(cancelled || []);
        setCustomers(allCustomers || []);
      } catch (err) {
        console.error("Failed to load analytics data", err);
        toast({
          title: "Analytics error",
          description: "Unable to load analytics data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const range = useMemo(() => buildRange(preset, customRange), [preset, customRange]);

  const filteredPaid = useMemo(() => {
    return paidBills.filter((bill) => {
      const date = toDate(bill.createdAt || bill.date);
      if (!date) return false;
      return date >= range.from && date <= range.to;
    });
  }, [paidBills, range]);

  const filteredPending = useMemo(() => {
    return pendingBills.filter((bill) => {
      const date = toDate(bill.createdAt || bill.date);
      if (!date) return false;
      return date >= range.from && date <= range.to;
    });
  }, [pendingBills, range]);

  const filteredFailed = useMemo(() => {
    return failedBills.filter((bill) => {
      const date = toDate(bill.createdAt || bill.date);
      if (!date) return false;
      return date >= range.from && date <= range.to;
    });
  }, [failedBills, range]);

  const allFilteredBills = useMemo(() => {
    return [...filteredPaid, ...filteredPending, ...filteredFailed].sort((a, b) => {
      const dateA = toDate(a.createdAt || a.date) || new Date(0);
      const dateB = toDate(b.createdAt || b.date) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredPaid, filteredPending, filteredFailed]);

  const totals = useMemo(() => {
    const revenue = filteredPaid.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const pendingTotal = filteredPending.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const paidCount = filteredPaid.length;
    const failedCount = filteredFailed.length;
    const totalInvoices = allFilteredBills.length;
    const avgOrder = paidCount > 0 ? revenue / paidCount : 0;
    const successRate = totalInvoices > 0 ? (paidCount / totalInvoices) * 100 : 0;

    const customerCountMap = new Map<string, number>();
    filteredPaid.forEach((bill) => {
      const key = bill.customerName || bill.customerPhone || "Unknown";
      const current = customerCountMap.get(key) || 0;
      customerCountMap.set(key, current + 1);
    });
    const repeatCustomers = Array.from(customerCountMap.values()).filter((count) => count > 1).length;

    return {
      revenue,
      pendingTotal,
      paidCount,
      failedCount,
      totalCustomers: customers.length,
      repeatCustomers,
      avgOrder,
      totalInvoices,
      successRate,
      transactionVolume: totalInvoices,
    };
  }, [filteredPaid, filteredPending, filteredFailed, allFilteredBills, customers]);

  const revenueSeries = useMemo(() => {
    const granularity = getGranularity(range.from, range.to);
    const buckets = new Map<string, number>();
    filteredPaid.forEach((bill) => {
      const date = toDate(bill.createdAt || bill.date);
      if (!date) return;
      const key = bucketLabel(date, granularity);
      buckets.set(key, (buckets.get(key) || 0) + (bill.total || 0));
    });
    return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredPaid, range]);

  const trendSeries = useMemo(() => {
    const granularity = getGranularity(range.from, range.to);
    const buckets = new Map<string, number>();
    allFilteredBills.forEach((bill) => {
      const date = toDate(bill.createdAt || bill.date);
      if (!date) return;
      const key = bucketLabel(date, granularity);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    });
    return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
  }, [allFilteredBills, range]);

  const paymentBreakdown = useMemo(() => {
    return [
      { name: "Paid", value: filteredPaid.length },
      { name: "Pending", value: filteredPending.length },
      { name: "Failed", value: filteredFailed.length },
    ];
  }, [filteredPaid, filteredPending, filteredFailed]);

  const topCustomers = useMemo(() => {
    const totalsByCustomer = new Map<string, number>();
    filteredPaid.forEach((bill) => {
      const key = bill.customerName || bill.customerPhone || "Unknown";
      totalsByCustomer.set(key, (totalsByCustomer.get(key) || 0) + (bill.total || 0));
    });
    return Array.from(totalsByCustomer.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [filteredPaid]);

  const recentPayments = useMemo(() => {
    return [...filteredPaid]
      .sort((a, b) => {
        const dateA = toDate(a.createdAt || a.date) || new Date(0);
        const dateB = toDate(b.createdAt || b.date) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6);
  }, [filteredPaid]);

  const exportCsv = () => {
    if (!allFilteredBills.length) {
      toast({ title: "No data", description: "No invoices available to export." });
      return;
    }
    const rows = [
      ["invoiceId", "customerName", "customerPhone", "total", "status", "createdAt"],
      ...allFilteredBills.map((bill) => [
        bill.orderId || bill.id || "",
        bill.customerName || "",
        bill.customerPhone || "",
        bill.total || 0,
        bill.status || "",
        (() => {
          const date = toDate(bill.createdAt || bill.date);
          return date ? format(date, "yyyy-MM-dd HH:mm") : "";
        })(),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vk-wash-analytics-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-gray-500">Business performance for VK Wash</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={preset === "7d" ? "default" : "outline"} size="sm" onClick={() => setPreset("7d")}>Last 7 days</Button>
          <Button variant={preset === "30d" ? "default" : "outline"} size="sm" onClick={() => setPreset("30d")}>Last 30 days</Button>
          <Button variant={preset === "90d" ? "default" : "outline"} size="sm" onClick={() => setPreset("90d")}>Last 3 months</Button>
          <Button variant={preset === "1y" ? "default" : "outline"} size="sm" onClick={() => setPreset("1y")}>Last 1 year</Button>
          <Button variant={preset === "custom" ? "default" : "outline"} size="sm" onClick={() => setPreset("custom")}>Custom</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {preset === "custom" && (
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">From</span>
            <Input type="date" value={customRange.from || ""} onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">To</span>
            <Input type="date" value={customRange.to || ""} onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))} />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              Total revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totals.revenue)}</CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Pending payments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatMoney(totals.pendingTotal)}</CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <ReceiptText className="h-4 w-4 text-emerald-500" />
              Paid invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.paidCount}</CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4 text-indigo-500" />
              Total customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totals.totalCustomers}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Payment status mix</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-2">
              {paymentBreakdown.map((item, index) => (
                <Badge key={item.name} variant="outline" className="border-transparent bg-gray-100 text-gray-600">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  {item.name}: {item.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Order and payment trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top customers by spend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomers} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Operational KPIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Total invoices generated</span>
              <span className="font-semibold text-gray-900">{totals.totalInvoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment success rate</span>
              <span className="font-semibold text-gray-900">{totals.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average order value</span>
              <span className="font-semibold text-gray-900">{formatMoney(totals.avgOrder)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Repeat customers</span>
              <span className="font-semibold text-gray-900">{totals.repeatCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Failed invoices</span>
              <span className="font-semibold text-gray-900">{totals.failedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent transaction volume</span>
              <span className="font-semibold text-gray-900">{totals.transactionVolume}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-500">Loading payments...</div>
            ) : recentPayments.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div className="font-medium">{bill.customerName || "Unknown"}</div>
                        <div className="text-xs text-gray-400">{bill.customerPhone || ""}</div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatMoney(bill.total || 0)}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-gray-500">No payments in this period.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
