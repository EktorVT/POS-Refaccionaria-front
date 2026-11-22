import type { SummaryReport } from "../../types/reports";
import api from "../api/axios";
import { getSummary, arr, num, rec } from "../reports/reports.service";

export interface LowStockProduct {
  id: number | string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
}

export interface TopProduct {
  productId: number | string;
  name: string;
  quantitySold: number;
  revenue: number;
}

/**
 * Cada sección es null si su petición falló. Así, un cajero (que no puede ver
 * reportes) simplemente no ve las tarjetas de admin, sin mostrar errores.
 */
export interface HomeData {
  today: SummaryReport | null;
  topProducts: TopProduct[] | null;
  lowStock: { total: number; items: LowStockProduct[] } | null;
}

const LOW_STOCK_PREVIEW = 6;
const TOP_PRODUCTS_LIMIT = 5;

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

async function getTopProducts(from: string, to: string): Promise<TopProduct[]> {
  const { data } = await api.get<unknown>("/reports/top-products", {
    params: { from, to, limit: TOP_PRODUCTS_LIMIT }
  });

  return arr(data).map((p) => ({
    productId: (p.productId ?? p.id) as number | string,
    name: String(p.productName ?? p.name ?? "Sin nombre"),
    quantitySold: num(p.quantitySold),
    revenue: num(p.revenue)
  }));
}

async function getLowStock(): Promise<NonNullable<HomeData["lowStock"]>> {
  const { data } = await api.get<unknown>("/products");
  const raw = rec(data);
  const list = Array.isArray(data)
    ? data
    : (raw.items ?? raw.data ?? raw.products);

  const low = arr(list)
    .map((p) => ({
      id: p.id as number | string,
      name: String(p.name ?? "Sin nombre"),
      category: String(p.category ?? ""),
      stock: num(p.stock),
      minStock: num(p.minStock)
    }))
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));

  return { total: low.length, items: low.slice(0, LOW_STOCK_PREVIEW) };
}

export async function loadHome(): Promise<HomeData> {
  const now = new Date();
  const today = toISO(now);
  const monthStart = toISO(new Date(now.getFullYear(), now.getMonth(), 1));

  const [summary, top, low] = await Promise.allSettled([
    getSummary({ from: today, to: today }),
    getTopProducts(monthStart, today),
    getLowStock()
  ]);

  return {
    today: summary.status === "fulfilled" ? summary.value : null,
    topProducts: top.status === "fulfilled" ? top.value : null,
    lowStock: low.status === "fulfilled" ? low.value : null
  };
}
