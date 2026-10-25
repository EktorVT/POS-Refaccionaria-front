import { useState } from "react";
import { isAxiosError } from "axios";
import Modal from "../Modal/Modal";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { useToast } from "../../context/Toast/useToast";
import {
  patchProduct,
  postProduct
} from "../../services/products/products.service";
import type {
  CategoryGroup,
  Product,
  ProductPayload
} from "../../types/products";
import styles from "./ProductsFormModal.module.css";
import { CATALOG } from "../../data/catalog";
import { mergeCategories } from "../../utils/categories";

interface ProductFormModalProps {
  product?: Product;
  categories: CategoryGroup[];
  onClose: () => void;
  onSaved?: (product: Product) => void;
}

const canonical = (value: string, options: string[]) =>
  options.find((o) => o.toLowerCase() === value.trim().toLowerCase()) ??
  value.trim();

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved
}: ProductFormModalProps) {
  const { showToast } = useToast();
  const isEdit = product !== undefined;

  const [name, setName] = useState(product?.name ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [purchasePrice, setPurchasePrice] = useState(
    product ? String(product.purchasePrice) : ""
  );
  const [salePrice, setSalePrice] = useState(
    product ? String(product.salePrice) : ""
  );
  const [minStock, setMinStock] = useState(String(product?.minStock ?? 1));
  const [stock, setStock] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const purchase = Number(purchasePrice);
  const sale = Number(salePrice);
  const min = Number(minStock);
  const initialStock = Number(stock);

  const isValid =
    name.trim() !== "" &&
    category.trim() !== "" &&
    subcategory.trim() !== "" &&
    purchase > 0 &&
    sale > 0 &&
    Number.isInteger(min) &&
    min >= 0 &&
    (isEdit || (Number.isInteger(initialStock) && initialStock >= 0));

  const lowMargin = purchase > 0 && sale > 0 && sale < purchase;

  const suggestions = mergeCategories(CATALOG, categories);

  const subcategoryOptions =
    suggestions.find(
      (c) => c.category.toLowerCase() === category.trim().toLowerCase()
    )?.subcategories ?? [];

  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      const payload: Omit<ProductPayload, "stock"> = {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        category: canonical(
          category,
          suggestions.map((c) => c.category)
        ),
        subcategory: canonical(subcategory, subcategoryOptions),
        purchasePrice: purchase,
        salePrice: sale,
        minStock: min
      };

      const saved = product
        ? await patchProduct(product.id, payload)
        : await postProduct({ ...payload, stock: initialStock });

      showToast({
        type: "success",
        title: isEdit ? "Producto actualizado" : "Producto creado",
        message: saved.name
      });

      onSaved?.(saved);
      onClose();
    } catch (error) {
      console.error(error);
      const duplicated = isAxiosError(error) && error.response?.status === 409;
      showToast({
        type: "error",
        title: "No se pudo guardar el producto",
        message: duplicated
          ? "Ya existe un producto con ese código de barras."
          : "Revisa los datos e intenta de nuevo."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      title={isEdit ? "Editar producto" : "Nuevo producto"}
      onClose={onClose}
    >
      <div className={styles.form}>
        <label className={styles.field}>
          <span>Nombre</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className={styles.field}>
          <span>Código de barras (opcional)</span>
          <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Categoría</span>
            <Input
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Subcategoría</span>
            <Input
              list="subcategory-options"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />
          </label>
        </div>

        <datalist id="category-options">
          {suggestions.map((c) => (
            <option key={c.category} value={c.category} />
          ))}
        </datalist>
        <datalist id="subcategory-options">
          {subcategoryOptions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Costo</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Precio de venta</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </label>
        </div>

        {lowMargin && (
          <small className={styles.warning}>
            El precio de venta es menor al costo.
          </small>
        )}

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Stock mínimo permitido</span>
            <Input
              type="number"
              min={0}
              step={1}
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
          </label>

          {isEdit ? (
            <div className={styles.field}>
              <span>Stock actual</span>
              <strong>{product.stock}</strong>
              <small className={styles.hint}>
                Se modifica en Inventario con una entrada.
              </small>
            </div>
          ) : (
            <label className={styles.field}>
              <span>Stock inicial</span>
              <Input
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <small className={styles.hint}>
                Se registra como una entrada de inventario.
              </small>
            </label>
          )}
        </div>

        <div className={styles.actions}>
          <Button onClick={handleSubmit}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
