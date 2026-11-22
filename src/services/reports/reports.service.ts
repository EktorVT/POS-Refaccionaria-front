import type {
  ProfitsReport,
  ReportFilters,
  SaleRow,
  SalesByUserRow,
  SummaryReport
} from "../../types/reports";
import api from "../api/axios";

type Raw = Record<string, unknown>;

export const rec = (v: unknown): Raw =>
  typeof v === "object" && v !== null ? (v as Raw) : {};

export const arr = (v: unknown): Raw[] => (Array.isArray(v) ? v.map(rec) : []);

export const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clean = (filters: ReportFilters) =>
  Object.fromEntries(
    Object.entries({ from: filters.from, to: filters.to }).filter(
      ([, v]) => v !== undefined && v !== ""
    )
  );

async function fetchReport(
  path: string,
  filters: ReportFilters
): Promise<unknown> {
  const { data } = await api.get<unknown>(path, { params: clean(filters) });
  return data;
}

export async function getSummary(
  filters: ReportFilters
): Promise<SummaryReport> {
  const raw = rec(await fetchReport("/reports/summary", filters));
  const salesCount = num(raw.numberOfSales ?? raw.salesCount);
  const totalSales = num(raw.totalSales ?? raw.totalRevenue ?? raw.total);
  return {
    salesCount,
    totalSales,
    averageTicket:
      num(raw.averageTicket) || (salesCount ? totalSales / salesCount : 0),
    productsSold: num(raw.productsSold),
    profit: num(raw.profit)
  };
}

export async function getProfits(
  filters: ReportFilters
): Promise<ProfitsReport> {
  const raw = rec(await fetchReport("/reports/profits", filters));
  const totalRevenue = num(raw.totalRevenue ?? raw.totalSales ?? raw.revenue);
  const totalCost = num(raw.totalCost ?? raw.cost);
  const totalProfit = num(
    raw.totalProfit ?? raw.profit ?? totalRevenue - totalCost
  );

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    margin:
      num(raw.margin) ||
      (totalRevenue ? (totalProfit / totalRevenue) * 100 : 0),
    byDay: arr(raw.byDay ?? raw.daily).map((d) => ({
      date: String(d.date),
      revenue: num(d.revenue ?? d.total),
      cost: num(d.cost),
      profit: num(d.profit)
    })),
    byProduct: arr(raw.byProduct ?? raw.products).map((p) => ({
      productId: (p.productId ?? p.id) as number | string,
      name: String(p.name ?? p.productName ?? "Sin nombre"),
      quantity: num(p.quantity),
      revenue: num(p.revenue ?? p.total),
      cost: num(p.cost),
      profit: num(p.profit)
    }))
  };
}

export async function getSales(filters: ReportFilters): Promise<SaleRow[]> {
  const data = await fetchReport("/reports/sales", filters);
  const raw = rec(data);
  return arr(raw.sales ?? raw.items ?? data).map((s) => ({
    id: s.id as number | string,
    createdAt: String(s.createdAt ?? s.date),
    userName: String(rec(s.user).username ?? s.userName ?? "—"),
    total: num(s.total),
    profit: num(s.profit)
  }));
}

export async function getSalesByUser(
  filters: ReportFilters
): Promise<SalesByUserRow[]> {
  const data = await fetchReport("/reports/sales-by-user", filters);
  const raw = rec(data);
  return arr(raw.users ?? raw.items ?? data).map((u) => ({
    userId: (u.userId ?? u.id) as number | string,
    userName: String(u.username ?? u.userName ?? u.name ?? "—"),
    salesCount: num(u.numberOfSales ?? u.salesCount),
    total: num(u.total ?? u.totalSales),
    profit: num(u.profit ?? u.totalProfit)
  }));
}
