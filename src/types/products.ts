export interface Product {
  id: number;
  name: string;
  barcode: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
  createdAt: Date;
  updatedAt: Date;
}
