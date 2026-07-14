export type CategorySlug = "women" | "men" | "accessories";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  colors: string[];
  sizes: string[];
  stock: number;
  isNew: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  category: CategorySlug;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export type OrderStatus = "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shipping: ShippingDetails;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export type CardBrand = "visa" | "mastercard" | "amex" | "other";

/** Never more than this — no card number, no CVV, nothing to steal. */
export interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}
