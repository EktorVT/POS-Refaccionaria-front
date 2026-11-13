import JsBarcode from "jsbarcode";

const OPTIONS = {
  width: 2,
  height: 60,
  fontSize: 14,
  margin: 0,
  displayValue: true
};

export function drawBarcode(target: SVGSVGElement, value: string) {
  if (/^\d{13}$/.test(value)) {
    try {
      JsBarcode(target, value, { ...OPTIONS, format: "EAN13" });
      return;
    } catch {
      console.log("error");
    }
  }
  JsBarcode(target, value, { ...OPTIONS, format: "CODE128" });
}
