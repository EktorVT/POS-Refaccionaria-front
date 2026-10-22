import { useState } from "react";
import { X } from "lucide-react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Spinner from "../../components/Spinner/Spinner";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import { useToast } from "../../context/Toast/useToast";
import { useFetch } from "../../hooks/useFetch";
import {
  getMovement,
  getProductMovements,
  getMovements,
  postEntry
} from "../../services/inventory.service";
import { getUsers } from "../../services/users/users.service";
import type { Product } from "../../types/products";
import {
  MovementType,
  movementTypeLabel,
  type InventoryMovement,
  type MovementFilters
} from "../../types/inventory";
import styles from "./Inventory.module.css";
import Input from "../../components/Input/Input";

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "short",
  timeStyle: "short"
});

const formatDate = (iso: string) => dateFormat.format(new Date(iso));

function signedQuantity(m: InventoryMovement) {
  if (m.type === MovementType.IN) return `+${Math.abs(m.quantity)}`;
  if (m.type === MovementType.OUT) return `−${Math.abs(m.quantity)}`;
  return String(m.quantity);
}

const badgeClass: Record<MovementType, string> = {
  IN: styles.badgeIn,
  OUT: styles.badgeOut
};

function TypeBadge({ type }: { type: MovementType }) {
  return (
    <span className={`${styles.badge} ${badgeClass[type]}`}>
      {movementTypeLabel[type]}
    </span>
  );
}

function EntryForm({ onCreated }: { onCreated: () => void }) {
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const qty = Number(quantity);
  const quantityValid = Number.isInteger(qty) && qty > 0;
  const canSubmit = product !== null && quantityValid;

  const handleSubmit = async () => {
    if (!product || !quantityValid || submitting) return;

    setSubmitting(true);
    try {
      await postEntry({
        productId: product.id,
        quantity: qty,
        unitCost: Number(unitCost)
      });

      showToast({
        type: "success",
        title: "Entrada registrada",
        message: `${product.name} · +${qty}`
      });

      setProduct(null);
      setQuantity("");
      setUnitCost("");
      onCreated();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "No se pudo registrar la entrada",
        message: "Revisa los datos e intenta de nuevo."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={styles.panel}>
      <h3>Registrar entrada</h3>

      <div className={styles.field}>
        <span>Producto</span>
        {product ? (
          <div className={styles.chip}>
            <div>
              <strong>{product.name}</strong>
              <p className={styles.muted}>
                Barra: {product.barcode} | Stock actual: {product.stock}
              </p>
            </div>
            <button
              onClick={() => setProduct(null)}
              aria-label="Quitar producto"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <ProductSearch onSelect={setProduct} />
        )}
      </div>

      <label className={styles.field}>
        <span>Cantidad</span>
        <Input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {quantity !== "" && !quantityValid && (
          <small className={styles.error}>
            La cantidad debe ser un entero mayor a 0.
          </small>
        )}
      </label>

      <label className={styles.field}>
        <span>Costo unitario (opcional)</span>

        {product && <small>Costo actual: {product?.purchasePrice}</small>}
        <Input
          type="number"
          min={0}
          step="0.01"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
        />
      </label>

      <div className={styles.actions}>
        <Button onClick={handleSubmit}>
          {submitting ? "Guardando..." : "Registrar entrada"}
        </Button>
      </div>
      {!canSubmit && (
        <small className={styles.muted}>
          Selecciona un producto e indica la cantidad.
        </small>
      )}
    </Card>
  );
}

function MovementDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const [showHistory, setShowHistory] = useState(false);

  const {
    data: movement,
    loading,
    failed
  } = useFetch(`movement:${id}`, () => getMovement(id));

  const productId = movement?.product.id;
  const history = useFetch(
    showHistory && productId ? `history:${productId}` : null,
    () => getProductMovements(productId as number)
  );

  return (
    <Card className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Movimiento #{id}</h3>
        <button onClick={onClose} aria-label="Cerrar detalle">
          <X size={18} />
        </button>
      </div>

      {loading && <Spinner />}
      {failed && (
        <p className={styles.error}>No se pudo cargar el movimiento.</p>
      )}

      {movement && (
        <>
          <dl className={styles.details}>
            <dt>Producto</dt>
            <dd>{movement.product.name}</dd>
            <dt>Tipo</dt>
            <dd>
              <TypeBadge type={movement.type} />
            </dd>
            <dt>Cantidad</dt>
            <dd>{signedQuantity(movement)}</dd>
            <dt>Stock</dt>
            <dd>
              {movement.stockBefore} → {movement.stockAfter}
            </dd>
            {movement.unitCost != null && (
              <>
                <dt>Costo unitario</dt>
                <dd>${Number(movement.unitCost).toFixed(2)}</dd>
              </>
            )}
            <dt>Usuario</dt>
            <dd>{movement.user.username}</dd>
            <dt>Fecha</dt>
            <dd>{formatDate(movement.createdAt)}</dd>
          </dl>

          {!showHistory ? (
            <Button onClick={() => setShowHistory(true)}>
              Ver historial del producto
            </Button>
          ) : (
            <div>
              <h3>Historial de {movement.product.name}</h3>
              {history.loading && <Spinner />}
              {history.failed && (
                <p className={styles.error}>No se pudo cargar el historial.</p>
              )}
              <ul className={styles.history}>
                {history.data?.map((m) => (
                  <li key={m.id}>
                    <span>{formatDate(m.createdAt)}</span>
                    <TypeBadge type={m.type} />
                    <strong>{signedQuantity(m)}</strong>
                    <span className={styles.muted}>{m.user.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export default function Inventory() {
  const [type, setType] = useState<MovementType | "">("");
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filters: MovementFilters = {
    type: type || undefined,
    productId: product?.id,
    userId: userId ? Number(userId) : undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  const { data, loading, failed } = useFetch(
    `movements:${refresh}:${JSON.stringify(filters)}`,
    () => getMovements(filters)
  );
  const movements = data ?? [];

  console.log(data);
  const { data: users } = useFetch("users", getUsers);

  const clearFilters = () => {
    setType("");
    setProduct(null);
    setUserId("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className={styles.content}>
      <section>
        <div className={styles.title}>
          <h3>Inventario</h3>
          <p>Movimientos de mercancía</p>
        </div>

        <div className={styles.filters}>
          <label className={styles.field}>
            <span>Tipo</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MovementType | "")}
            >
              <option value="">Todos</option>
              {Object.values(MovementType).map((t) => (
                <option key={t} value={t}>
                  {movementTypeLabel[t]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Usuario</span>
            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Todos</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Desde</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Hasta</span>
            <input
              type="date"
              className={styles.dateInput}
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>

          <div className={`${styles.field} ${styles.wide}`}>
            <span>Producto</span>
            {product ? (
              <div className={styles.chip}>
                <strong>{product.name}</strong>
                <button
                  onClick={() => setProduct(null)}
                  aria-label="Quitar filtro de producto"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <ProductSearch
                onSelect={setProduct}
                placeholder="Filtrar por producto"
              />
            )}
          </div>

          {hasFilters && (
            <button className={styles.clear} onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>

        {loading && <Spinner />}

        {failed && (
          <p className={styles.error}>
            No se pudieron cargar los movimientos.{" "}
            <button
              className={styles.clear}
              onClick={() => setRefresh((r) => r + 1)}
            >
              Reintentar
            </button>
          </p>
        )}

        {!loading && !failed && movements.length === 0 && (
          <p className={styles.muted}>No hay movimientos con estos filtros.</p>
        )}

        {!loading && movements.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th className={styles.product}>Producto</th>
                  <th>Tipo</th>
                  <th className={styles.num}>Cantidad</th>
                  <th className={styles.num}>Stock</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr
                    key={m.id}
                    tabIndex={0}
                    className={
                      m.id === selectedId ? styles.selected : undefined
                    }
                    onClick={() => setSelectedId(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedId(m.id);
                    }}
                  >
                    <td>{formatDate(m.createdAt)}</td>
                    <td className={styles.product}>{m.product.name}</td>
                    <td>
                      <TypeBadge type={m.type} />
                    </td>
                    <td className={styles.num}>{signedQuantity(m)}</td>
                    <td className={styles.num}>
                      {m.stockBefore} → {m.stockAfter}
                    </td>
                    <td>{m.user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <aside className={styles.side}>
        {selectedId === null ? (
          <EntryForm onCreated={() => setRefresh((r) => r + 1)} />
        ) : (
          <MovementDetail
            key={selectedId}
            id={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </aside>
    </div>
  );
}
