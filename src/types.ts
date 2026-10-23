export interface Price {
  amount: string;
  currencyCode: string;
}

export interface ImageNode {
  url: string;
  altText?: string | null;
}

export interface ImageEdge {
  node: ImageNode;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface VariantNode {
  id: string;
  title: string;
  availableForSale?: boolean;
  price: Price;
  selectedOptions?: SelectedOption[];
}

export interface VariantEdge {
  node: VariantNode;
}

export interface ProductOption {
  id?: string;
  name: string;
  values?: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  tags: string[];
  vendor?: string;
  priceRange: {
    minVariantPrice: Price;
    maxVariantPrice?: Price;
  };
  images: {
    edges: ImageEdge[];
  };
  variants: {
    edges: VariantEdge[];
  };
  options?: ProductOption[];
}

export interface CartItem {
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  price: string;
  currencyCode: string;
  imageUrl?: string;
  productType?: string;
  qty: number;
}

export interface OrderDetails {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  patientName: string;
  email: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryEst: string;
}
