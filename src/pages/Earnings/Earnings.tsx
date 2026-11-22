import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import Spinner from "../../components/Spinner/Spinner";

import type {
  ProfitsReport,
  ReportFilters,
  SaleRow,
  SalesByUserRow,
  SummaryReport
} from "../../types/reports";
import styles from "./Earnings.module.css";
import {
  getProfits,
  getSales,
  getSalesByUser,
  getSummary
} from "../../services/reports/reports.service";

type Preset = "today" | "week" | "month" | "custom";

interface ReportData {
  profits: ProfitsReport;
  summary: SummaryReport;
  sales: SaleRow[];
  byUser: SalesByUserRow[];
}

const NO_SALES: SaleRow[] = [];
const NO_USERS: SalesByUserRow[] = [];

const PRESETS: { id: Preset; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
  { id: "custom", label: "Personalizado" }
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function rangeFor(preset: Exclude<Preset, "custom">): ReportFilters {
  const today = new Date();
  const end = toISO(today);

  if (preset === "today") return { from: end, to: end };

  if (preset === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // lunes
    return { from: toISO(start), to: end };
  }

  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: toISO(start), to: end };
}

const formatDay = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

const pct = (value: number, base: number) =>
  base > 0 ? `${((value / base) * 100).toFixed(1)}%` : "—";

export default function ProfitsPage() {
  const [preset, setPreset] = useState<Preset>("month");
  const [filters, setFilters] = useState<ReportFilters>(() =>
    rangeFor("month")
  );

  const [data, setData] = useState<ReportData | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const { from, to } = filters;
  const invalidRange = Boolean(from && to && from > to);
  const requestKey = `${from}|${to}|${refreshTick}`;

  // Todos los setState ocurren dentro de callbacks de la promesa (nunca de forma
  // síncrona en el efecto). "loading" se deriva de qué petición ya terminó.
  useEffect(() => {
    if (!from || !to || invalidRange) return;

    let cancelled = false;
    const range: ReportFilters = { from, to };

    Promise.all([
      getProfits(range),
      getSummary(range),
      getSales(range),
      getSalesByUser(range)
    ])
      .then(([profits, summary, sales, byUser]) => {
        if (cancelled) return;
        setData({ profits, summary, sales, byUser });
        setLoadedKey(requestKey);
      })
      .catch(() => {
        if (!cancelled) setFailedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [from, to, invalidRange, requestKey]);

  const loading =
    !invalidRange && loadedKey !== requestKey && failedKey !== requestKey;
  const error = invalidRange
    ? "La fecha inicial no puede ser mayor que la final."
    : failedKey === requestKey
      ? "No se pudieron cargar las ganancias. Intenta de nuevo."
      : null;

  const profits = data?.profits ?? null;
  const summary = data?.summary ?? null;
  const sales = data?.sales ?? NO_SALES;
  const byUser = data?.byUser ?? NO_USERS;

  const selectPreset = (next: Preset) => {
    setPreset(next);
    if (next !== "custom") setFilters(rangeFor(next));
  };

  const changeDate = (key: keyof ReportFilters, value: string) => {
    setPreset("custom");
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const maxDayValue = useMemo(
    () => Math.max(1, ...(profits?.byDay ?? []).map((d) => Math.abs(d.profit))),
    [profits]
  );

  const topProducts = useMemo(
    () =>
      [...(profits?.byProduct ?? [])]
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10),
    [profits]
  );

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 50),
    [sales]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Ganancias</h1>
          <p className={styles.subtitle}>
            Lo que vendiste, lo que te costó y lo que realmente te quedó.
          </p>
        </div>
        <button
          type="button"
          className={styles.refresh}
          onClick={() => setRefreshTick((t) => t + 1)}
          disabled={loading}
          aria-label="Actualizar reporte"
        >
          <RefreshCw size={16} className={loading ? styles.spin : undefined} />
          Actualizar
        </button>
      </header>

      <section className={styles.filters} aria-label="Filtros de fecha">
        <div className={styles.presets} role="group">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.preset} ${preset === p.id ? styles.presetActive : ""}`}
              onClick={() => selectPreset(p.id)}
              aria-pressed={preset === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.dates}>
          <label className={styles.field}>
            <span>Desde</span>
            <input
              type="date"
              value={filters.from ?? ""}
              max={filters.to}
              onChange={(e) => changeDate("from", e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Hasta</span>
            <input
              type="date"
              value={filters.to ?? ""}
              min={filters.from}
              onChange={(e) => changeDate("to", e.target.value)}
            />
          </label>
        </div>
      </section>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {loading && !profits ? (
        <div className={styles.center}>
          <Spinner />
        </div>
      ) : (
        profits && (
          <>
            {/* La ganancia es lo más importante: ocupa más espacio que el resto */}
            <section className={styles.kpis}>
              <div className={`${styles.kpi} ${styles.kpiMain}`}>
                <span className={styles.kpiLabel}>Ganancia</span>
                <strong
                  className={`${styles.kpiValue} ${profits.totalProfit < 0 ? styles.negative : styles.positive}`}
                >
                  {money.format(profits.totalProfit)}
                </strong>
                <span className={styles.kpiHint}>
                  Margen {profits.margin.toFixed(1)}% sobre lo vendido
                </span>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Vendido</span>
                <strong className={styles.kpiValue}>
                  {money.format(profits.totalRevenue)}
                </strong>
                <span className={styles.kpiHint}>
                  {summary?.salesCount ?? 0} ventas
                </span>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Costo de lo vendido</span>
                <strong className={styles.kpiValue}>
                  {money.format(profits.totalCost)}
                </strong>
                <span className={styles.kpiHint}>
                  {pct(profits.totalCost, profits.totalRevenue)} de las ventas
                </span>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Ticket promedio</span>
                <strong className={styles.kpiValue}>
                  {money.format(summary?.averageTicket ?? 0)}
                </strong>
                <span className={styles.kpiHint}>por venta</span>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Ganancia por día</h2>
              {profits.byDay.length === 0 ? (
                <p className={styles.empty}>
                  No hay ventas en este periodo. Cambia las fechas para ver otro
                  rango.
                </p>
              ) : (
                <div className={styles.chartScroll}>
                  <div className={styles.chart}>
                    {profits.byDay.map((d) => {
                      const height = Math.max(
                        4,
                        (Math.abs(d.profit) / maxDayValue) * 100
                      );
                      return (
                        <div
                          key={d.date}
                          className={styles.bar}
                          title={`${formatDay(d.date)} · Vendido ${money.format(d.revenue)} · Ganancia ${money.format(d.profit)}`}
                        >
                          <span className={styles.barValue}>
                            {money.format(d.profit)}
                          </span>
                          <div className={styles.barTrack}>
                            <div
                              className={`${styles.barFill} ${d.profit < 0 ? styles.barNegative : ""}`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className={styles.barLabel}>
                            {formatDay(d.date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <div className={styles.twoCols}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  Productos que más ganancia dejan
                </h2>
                {topProducts.length === 0 ? (
                  <p className={styles.empty}>
                    Sin productos vendidos en este periodo.
                  </p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className={styles.num}>Cant.</th>
                          <th className={styles.num}>Vendido</th>
                          <th className={styles.num}>Ganancia</th>
                          <th className={styles.num}>Margen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p) => (
                          <tr key={p.productId}>
                            <td>{p.name}</td>
                            <td className={styles.num}>{p.quantity}</td>
                            <td className={styles.num}>
                              {money.format(p.revenue)}
                            </td>
                            <td
                              className={`${styles.num} ${p.profit < 0 ? styles.negative : styles.positive}`}
                            >
                              {money.format(p.profit)}
                            </td>
                            <td className={styles.num}>
                              {pct(p.profit, p.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Ganancia por empleado</h2>
                {byUser.length === 0 ? (
                  <p className={styles.empty}>
                    Sin ventas registradas en este periodo.
                  </p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Empleado</th>
                          <th className={styles.num}>Ventas</th>
                          <th className={styles.num}>Vendido</th>
                          <th className={styles.num}>Ganancia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byUser.map((u) => (
                          <tr key={u.userId}>
                            <td>{u.userName}</td>
                            <td className={styles.num}>{u.salesCount}</td>
                            <td className={styles.num}>
                              {money.format(u.total)}
                            </td>
                            <td
                              className={`${styles.num} ${u.profit < 0 ? styles.negative : styles.positive}`}
                            >
                              {money.format(u.profit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Detalle de ventas</h2>
              {recentSales.length === 0 ? (
                <p className={styles.empty}>
                  Todavía no hay ventas en este periodo.
                </p>
              ) : (
                <>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Folio</th>
                          <th>Fecha</th>
                          <th>Atendió</th>
                          <th className={styles.num}>Total</th>
                          <th className={styles.num}>Ganancia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSales.map((s) => (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td>{formatDateTime(s.createdAt)}</td>
                            <td>{s.userName}</td>
                            <td className={styles.num}>
                              {money.format(s.total)}
                            </td>
                            <td
                              className={`${styles.num} ${s.profit < 0 ? styles.negative : styles.positive}`}
                            >
                              {money.format(s.profit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {sales.length > recentSales.length && (
                    <p className={styles.note}>
                      Mostrando las {recentSales.length} ventas más recientes de{" "}
                      {sales.length}.
                    </p>
                  )}
                </>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}
