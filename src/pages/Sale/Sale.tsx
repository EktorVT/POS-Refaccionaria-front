import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Spinner from "../../components/Spinner/Spinner";
import { useAuth } from "../../context/Auth/useAuth";
import { searchProduct } from "../../services/products/products.service";
import type { Product } from "../../types/products";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./Sale.module.css";
import {
  type CartItem,
  increaseQuantity,
  decreaseQuantity,
  getStockStatus,
  removeFromCart
} from "../../utils/cart.utils";
import Card from "../../components/Card/Card";
import Badge from "../../components/Badge/Badge";
import { createSaleData } from "../../utils/sale.utils";
import {
  postSale,
  type PostSaleRequest
} from "../../services/sale/sale.service";
import { useToast } from "../../context/Toast/useToast";

export default function Sale() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!query.trim()) return;

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchProduct(query);
        if (!cancelled) setResults(data);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        showToast({
          type: "error",
          title: "Error buscando productos",
          message: "Error buscando productos."
        });
        setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, showToast]);

  const handleIncrease = (productId: number) => {
    setCart((prev) => increaseQuantity(prev, productId));
  };

  const handleDecrease = (productId: number) => {
    setCart((prev) => decreaseQuantity(prev, productId));
  };

  const handleRemove = (productId: number) => {
    setCart((prev) => removeFromCart(prev, productId));
  };

  const handleCreateSale = async () => {
    const saleData: PostSaleRequest = createSaleData(cart);

    try {
      const response = await postSale(saleData);

      setCart([]);

      showToast({
        type: "success",
        title: "Venta creada",
        message: `Cobrar #${response.saleId} · $${response.total}`
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo crear la venta",
        message: "No se pudo crear la venta"
      });
      console.log(error);
    }
  };

  const handleSelectProduct = (product: Product) => {
    const existingProduct = cart.find((item) => item.product.id === product.id);

    if (existingProduct) {
      handleIncrease(product.id);
    } else {
      if (product.stock <= 0) {
        return;
      }

      setCart((prev) => [
        ...prev,
        {
          product,
          quantity: 1
        }
      ]);
    }

    setQuery("");
    setResults([]);
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.product.salePrice) * item.quantity,
    0
  );

  return (
    <div className={styles.saleContent}>
      <section className={styles.products}>
        <div className={styles.title}>
          <h3>Nueva Venta</h3>
          <p>Usuario: {user?.username}</p>
        </div>
        <div className={styles.searchContainer}>
          <Input
            value={query}
            placeholder="Buscar Producto"
            icon={<Search />}
            rightElement={
              <button className={styles.rightElement}>Escanear</button>
            }
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          {loading && <Spinner />}

          {!loading && results.length > 0 && (
            <ul className={styles.ul}>
              {results.map((product) => (
                <li
                  key={product.id}
                  className={styles.li}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.barcode}>
                      Barra: {product.barcode} | Stock: {product.stock}
                    </p>
                  </div>
                  <p className={styles.productPrice}>${product.salePrice}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={styles.cartSection}>
        <h3>Nueva Venta</h3>
        <div className={styles.cartList}>
          <ul>
            {cart.map((item) => {
              const stockStatus = getStockStatus(item);

              return (
                <Card key={item.product.id} className={styles.card}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                    <p>${item.product.salePrice}</p>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemove(item.product.id)}
                      aria-label={`Eliminar ${item.product.name}`}
                    >
                      <X className={styles.itemDelete} />
                    </button>
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.quantity}>
                      <button onClick={() => handleDecrease(item.product.id)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncrease(item.product.id)}>
                        +
                      </button>
                      {stockStatus && (
                        <Badge variant="danger">{stockStatus}</Badge>
                      )}
                    </div>
                    <span className={styles.itemPrice}>
                      ${item.product.salePrice * item.quantity}
                    </span>
                  </div>
                </Card>
              );
            })}
          </ul>
        </div>
        <div className={styles.total}>
          <h3>Total</h3>
          <p className={styles.totalPrice}>
            <span className={styles.totalSign}>$</span> {total}
          </p>
          <div className={styles.totalActions}>
            <Button onClick={() => handleCreateSale()}>Cobrar</Button>
            <Button onClick={() => setCart([])}>Cancelar</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
