import { useState } from "react";
import { Pencil, Search } from "lucide-react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Spinner from "../../components/Spinner/Spinner";
import ProductFormModal from "../../components/ProductsFormModal/ProductsFormModal";
import { useAuth } from "../../context/Auth/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFetch } from "../../hooks/useFetch";
import {
  getCategories,
  getProducts
} from "../../services/products/products.service";
import type { Product, ProductFilters } from "../../types/products";
import styles from "./Products.module.css";

const PAGE_SIZE = 25;

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

function StockStatus({ product }: { product: Product }) {
  if (product.stock <= 0) {
    return <span className={`${styles.badge} ${styles.out}`}>Sin stock</span>;
  }
  if (product.stock <= product.minStock) {
    return <span className={`${styles.badge} ${styles.low}`}>Stock bajo</span>;
  }
  return null;
}

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const debouncedQ = useDebouncedValue(q.trim(), 300);

  const filters: ProductFilters = {
    q: debouncedQ || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
    lowStock: lowStock || undefined,
    page,
    limit: PAGE_SIZE
  };

  const { data, loading, failed } = useFetch(
    `products:${refresh}:${JSON.stringify(filters)}`,
    () => getProducts(filters)
  );
  const { data: categories } = useFetch(`categories:${refresh}`, getCategories);

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const subcategories =
    categories?.find((c) => c.category === category)?.subcategories ?? [];

  const hasFilters =
    q !== "" || category !== "" || subcategory !== "" || lowStock;
  const formOpen = creating || editing !== null;

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setSubcategory("");
    setLowStock(false);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h3>Productos</h3>
          <p>{total} en el catálogo</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreating(true)}>Nuevo producto</Button>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <Input
            value={q}
            placeholder="Buscar por nombre o código de barras"
            icon={<Search />}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <label className={styles.field}>
          <span>Categoría</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {categories?.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Subcategoría</span>
          <select
            value={subcategory}
            disabled={category === ""}
            onChange={(e) => {
              setSubcategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => {
              setLowStock(e.target.checked);
              setPage(1);
            }}
          />
          <span>Solo stock bajo</span>
        </label>

        {hasFilters && (
          <button className={styles.clear} onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {loading && <Spinner />}

      {failed && (
        <p className={styles.error}>
          No se pudieron cargar los productos.{" "}
          <button
            className={styles.clear}
            onClick={() => setRefresh((r) => r + 1)}
          >
            Reintentar
          </button>
        </p>
      )}

      {!loading && !failed && products.length === 0 && (
        <p className={styles.muted}>No hay productos con estos filtros.</p>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.name}>Producto</th>
                  <th>Categoría</th>
                  <th className={styles.num}>Stock</th>
                  {isAdmin && <th className={styles.num}>Costo</th>}
                  <th className={styles.num}>Precio</th>
                  {isAdmin && <th aria-label="Acciones" />}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.name}>
                      <strong>{p.name}</strong>
                      {p.barcode && (
                        <span className={styles.muted}>{p.barcode}</span>
                      )}
                    </td>
                    <td>
                      {p.category}
                      <span className={styles.muted}>{p.subcategory}</span>
                    </td>
                    <td className={styles.num}>
                      {p.stock} <StockStatus product={p} />
                    </td>
                    {isAdmin && (
                      <td className={styles.num}>
                        {money.format(Number(p.purchasePrice))}
                      </td>
                    )}
                    <td className={`${styles.num} ${styles.price}`}>
                      {money.format(Number(p.salePrice))}
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className={styles.edit}
                          onClick={() => setEditing(p)}
                          aria-label={`Editar ${p.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span className={styles.muted}>
              Página {page} de {totalPages}
            </span>
            <div className={styles.pages}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {formOpen && (
        <ProductFormModal
          key={editing?.id ?? "new"}
          product={editing ?? undefined}
          categories={categories ?? []}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => setRefresh((r) => r + 1)}
        />
      )}
    </div>
  );
}
