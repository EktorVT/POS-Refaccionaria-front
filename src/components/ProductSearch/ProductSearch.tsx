import { useState } from "react";
import { Search } from "lucide-react";
import Input from "../Input/Input";
import Spinner from "../Spinner/Spinner";
import { searchProduct } from "../../services/products/products.service";
import type { Product } from "../../types/products";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFetch } from "../../hooks/useFetch";
import styles from "./ProductSearch.module.css";

interface ProductSearchProps {
  onSelect: (product: Product) => void;
  placeholder?: string;
}

export default function ProductSearch({
  onSelect,
  placeholder = "Buscar producto"
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, 300);

  const { data, loading, failed } = useFetch(
    debounced ? `search:${debounced}` : null,
    () => searchProduct(debounced)
  );

  const typing = trimmed !== debounced;
  const busy = trimmed !== "" && (typing || loading);
  const ready = trimmed !== "" && !busy;
  const results = ready ? (data ?? []) : [];

  const handleSelect = (product: Product) => {
    onSelect(product);
    setQuery("");
  };

  return (
    <div className={styles.container}>
      <Input
        value={query}
        placeholder={placeholder}
        icon={<Search />}
        onChange={(e) => setQuery(e.target.value)}
      />

      {busy && <Spinner />}
      {ready && failed && (
        <p className={styles.message}>Error buscando productos.</p>
      )}
      {ready && !failed && results.length === 0 && (
        <p className={styles.message}>Sin resultados.</p>
      )}

      {results.length > 0 && (
        <ul className={styles.ul}>
          {results.map((product) => (
            <li
              key={product.id}
              className={styles.li}
              onClick={() => handleSelect(product)}
            >
              <div>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.meta}>
                  Barra: {product.barcode} | Stock: {product.stock}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
