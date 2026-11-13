import { drawBarcode } from "../lib/barcode";
import type { Product } from "../types/products";

// Ancho útil de la etiqueta: ~56 para papel de 58 mm, ~76 para papel de 80 mm
const LABEL_WIDTH_MM = 56;

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

const STYLES = `
  @page { margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  .label {
    width: ${LABEL_WIDTH_MM}mm;
    box-sizing: border-box;
    padding: 2mm;
    text-align: center;
    font-family: Arial, sans-serif;
    break-after: page;
  }
  .label:last-child { break-after: auto; }
  .name {
    margin: 0 0 2mm;
    font-size: 11pt;
    font-weight: 700;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }
  .price { margin: 2mm 0 0; font-size: 14pt; font-weight: 700; }
  svg { max-width: 100%; height: auto; }
`;

export function printLabel(product: Product, copies = 1) {
  if (!product.barcode) return;

  // El código se dibuja una vez y se clona en cada copia
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  drawBarcode(svg, product.barcode);

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  const style = doc.createElement("style");
  style.textContent = STYLES;
  doc.head.appendChild(style);

  for (let i = 0; i < copies; i++) {
    const label = doc.createElement("div");
    label.className = "label";

    const name = doc.createElement("p");
    name.className = "name";
    name.textContent = product.name; // textContent: el nombre nunca se interpreta como HTML

    const price = doc.createElement("p");
    price.className = "price";
    price.textContent = money.format(Number(product.salePrice));

    label.append(name, doc.importNode(svg, true), price);
    doc.body.appendChild(label);
  }

  win.addEventListener("afterprint", () => iframe.remove());

  // Pequeña espera para que el iframe termine de pintar antes de imprimir
  setTimeout(() => {
    win.focus();
    win.print();
  }, 100);
}
