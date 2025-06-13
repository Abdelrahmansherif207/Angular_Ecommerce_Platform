export interface Product {
  id?: string | number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  stockQuantity?: number;
  category: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  inStock?: boolean;
}
