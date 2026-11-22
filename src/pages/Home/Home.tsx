import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Spinner from "../../components/Spinner/Spinner";
import { loadHome, type HomeData } from "../../services/home/home.service";
import styles from "./Home.module.css";

const ROUTES = {
  sales: "/sales",
  profits: "/earnings",
  products: "/products",
  inventory: "/inventory"
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function todayLabel() {
  const text = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadHome().then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  const { today, lowStock, topProducts } = data;
  const nothingToShow = !today && !lowStock && !topProducts;
  const maxSold = Math.max(
    1,
    ...(topProducts ?? []).map((p) => p.quantitySold)
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{greeting()}</h1>
        <p className={styles.date}>{todayLabel()}</p>
      </header>

      {today && (
        <section className={styles.hero} aria-label="Ventas de hoy">
          {today.salesCount === 0 ? (
            <>
              <p className={styles.heroLead}>Todavía no hay ventas hoy</p>
              <p className={styles.heroSub}>
                Cuando registres la primera, aquí verás cuánto llevas vendido y
                ganado.
              </p>
              <Link to={ROUTES.sales} className={styles.cta}>
                Ir a ventas <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p className={styles.heroLead}>Llevas vendido hoy</p>
              <p className={styles.heroAmount}>
                {money.format(today.totalSales)}
              </p>
              <p className={styles.heroSub}>
                {today.salesCount} {today.salesCount === 1 ? "venta" : "ventas"}{" "}
                y {today.productsSold}{" "}
                {today.productsSold === 1 ? "producto" : "productos"}
              </p>
              <Link to={ROUTES.profits} className={styles.cta}>
                Ver el detalle de ganancias <ArrowRight size={16} />
              </Link>
            </>
          )}
        </section>
      )}

      {nothingToShow && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Todo listo para empezar</h2>
          <p className={styles.empty}>
            No hay información para mostrar por ahora. Puedes empezar
            registrando una venta.
          </p>
          <Link to={ROUTES.sales} className={styles.cta}>
            Ir a ventas <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {(lowStock || topProducts) && (
        <div className={styles.columns}>
          {lowStock && (
            <section className={styles.card} aria-label="Stock bajo">
              <h2 className={styles.cardTitle}>
                {lowStock.total === 0
                  ? "Inventario al corriente"
                  : lowStock.total === 1
                    ? "1 producto por reabastecer"
                    : `${lowStock.total} productos por reabastecer`}
              </h2>

              {lowStock.total === 0 ? (
                <p className={styles.empty}>
                  Ningún producto está en su mínimo o por debajo de él.
                </p>
              ) : (
                <>
                  <ul className={styles.list}>
                    {lowStock.items.map((p) => (
                      <li key={p.id} className={styles.row}>
                        <div className={styles.rowMain}>
                          <span className={styles.rowName}>{p.name}</span>
                          {p.category && (
                            <span className={styles.rowMeta}>{p.category}</span>
                          )}
                        </div>
                        <span
                          className={`${styles.stock} ${p.stock <= 0 ? styles.stockOut : styles.stockLow}`}
                        >
                          {p.stock <= 0
                            ? "Agotado"
                            : `${p.stock} de ${p.minStock}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {lowStock.total > lowStock.items.length && (
                    <p className={styles.more}>
                      y {lowStock.total - lowStock.items.length} más
                    </p>
                  )}
                  <div className={styles.links}>
                    <Link to={ROUTES.inventory} className={styles.cta}>
                      Registrar entrada <ArrowRight size={16} />
                    </Link>
                    <Link to={ROUTES.products} className={styles.linkQuiet}>
                      Ver productos
                    </Link>
                  </div>
                </>
              )}
            </section>
          )}

          {topProducts && (
            <section className={styles.card} aria-label="Más vendidos">
              <h2 className={styles.cardTitle}>
                Lo que más se vendió este mes
              </h2>

              {topProducts.length === 0 ? (
                <p className={styles.empty}>
                  Aún no hay ventas este mes. Los productos más vendidos
                  aparecerán aquí.
                </p>
              ) : (
                <>
                  <ul className={styles.list}>
                    {topProducts.map((p) => (
                      <li key={p.productId} className={styles.topRow}>
                        <div className={styles.topHead}>
                          <span className={styles.rowName}>{p.name}</span>
                          <span className={styles.rowMeta}>
                            {p.quantitySold}{" "}
                            {p.quantitySold === 1 ? "pieza" : "piezas"}
                          </span>
                        </div>
                        <div className={styles.track}>
                          <div
                            className={styles.fill}
                            style={{
                              width: `${(p.quantitySold / maxSold) * 100}%`
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.links}>
                    <Link to={ROUTES.profits} className={styles.cta}>
                      Ver cuáles dejan más ganancia <ArrowRight size={16} />
                    </Link>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
