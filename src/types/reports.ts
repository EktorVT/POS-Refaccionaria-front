export interface ReportFilters {
  from?: string;
  to?: string;
}

export interface ProfitByDay {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProfitByProduct {
  productId: number | string;
  name: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProfitsReport {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  margin: number;
  byDay: ProfitByDay[];
  byProduct: ProfitByProduct[];
}

export interface SummaryReport {
  salesCount: number;
  totalSales: number;
  averageTicket: number;
  productsSold: number;
  profit: number;
}
export interface SaleRow {
  id: number | string;
  createdAt: string;
  userName: string;
  total: number;
  profit: number;
}

export interface SalesByUserRow {
  userId: number | string;
  userName: string;
  salesCount: number;
  total: number;
  profit: number;
}
