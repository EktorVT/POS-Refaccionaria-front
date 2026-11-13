import { useEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useToast } from "../../context/Toast/useToast";
import { generateProductBarcode } from "../../services/products/products.service";
import { drawBarcode } from "../../lib/barcode";
import { printLabel } from "../../utils/printLabel";
import type { Product } from "../../types/products";
import styles from "./ProductDetailModal.module.css";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

const isInternalBarcode = (code: string) => /^20\d{11}$/.test(code);

function BarcodeSvg({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      drawBarcode(ref.current, value);
    } catch (error) {
      console.error(error);
    }
  }, [value]);

  return <svg ref={ref} className={styles.barcode} />;
}

interface ProductDetailModalProps {
  product: Product;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onChanged: () => void;
}

export default function ProductDetailModal({
  product: initial,
  isAdmin,
  onClose,
  onEdit,
  onChanged
}: ProductDetailModalProps) {
  const { showToast } = useToast();
  const [product, setProduct] = useState(initial);
  const [copies, setCopies] = useState("1");
  const [generating, setGenerating] = useState(false);

  const copiesCount = Math.min(
    99,
    Math.max(1, Math.floor(Number(copies)) || 1)
  );

  const handleGenerate = async () => {
    if (generating) return;

    setGenerating(true);
    try {
      const saved = await generateProductBarcode(product.id);
      setProduct(saved);
      onChanged();
      showToast({
        type: "success",
        title: "Código generado",
        message: saved.barcode ?? ""
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "No se pudo generar el código",
        message: "Intenta de nuevo."
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    try {
      printLabel(product, copiesCount);
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "No se pudo imprimir la etiqueta",
        message: "Revisa que el código de barras sea válido."
      });
    }
  };

  return (
    <Modal isOpen title={product.name} onClose={onClose}>
      <div className={styles.content}>
        <dl className={styles.details}>
          <dt>Categoría</dt>
          <dd>{product.category}</dd>
          <dt>Subcategoría</dt>
          <dd>{product.subcategory}</dd>
          <dt>Stock</dt>
          <dd>
            {product.stock}{" "}
            <span className={styles.muted}>(mínimo {product.minStock})</span>
          </dd>
          {isAdmin && (
            <>
              <dt>Costo</dt>
              <dd>{money.format(Number(product.purchasePrice))}</dd>
            </>
          )}
          <dt>Precio de venta</dt>
          <dd>
            <span className={styles.price}>
              {money.format(Number(product.salePrice))}
            </span>
          </dd>
        </dl>

        <div className={styles.codeSection}>
          <strong>Código de barras</strong>

          {product.barcode ? (
            <>
              <div className={styles.barcodeBox}>
                <BarcodeSvg value={product.barcode} />
              </div>

              {isInternalBarcode(product.barcode) && (
                <small className={styles.muted}>
                  Código interno generado por el sistema
                </small>
              )}

              <div className={styles.printRow}>
                <label className={styles.copies}>
                  <span>Copias</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                  />
                </label>
                <Button onClick={handlePrint}>Imprimir etiqueta</Button>
              </div>
            </>
          ) : (
            <>
              <p className={styles.muted}>
                Este producto no tiene código de barras.
              </p>
              {isAdmin && (
                <Button onClick={handleGenerate}>
                  {generating ? "Generando..." : "Generar código interno"}
                </Button>
              )}
            </>
          )}
        </div>

        <div className={styles.actions}>
          {isAdmin && (
            <Button onClick={() => onEdit(product)}>Editar producto</Button>
          )}
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}
