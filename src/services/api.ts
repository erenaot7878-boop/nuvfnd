import { Product } from '../types';

const API_BASE = 'https://data.editedgift.com';

// In-memory cache
const cache: {
  products: Product[] | null;
  productMap: Map<string, Product>;
  types: string[] | null;
  tags: string[] | null;
} = {
  products: null,
  productMap: new Map(),
  types: null,
  tags: null,
};

// High-fidelity fallback catalog in case the remote API ever has an outage or CORS restriction
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/8226787721290",
    title: "MR-3 (Retatrutide)",
    description: "MR-3 (Retatrutide), Injectable, 1mg/0.5ml (2ml vial).",
    handle: "retatrutide",
    productType: "Injectable",
    tags: ["featured", "injectable", "retatrutide", "weight-loss", "glp-1"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "499.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_Retatrutide.png?v=1780602022", altText: "Retatrutide" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005781578", title: "1mg/0.5ml (2ml vial)", price: { amount: "499.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005814346", title: "2mg/0.5ml (2ml vial)", price: { amount: "549.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847114", title: "4mg/0.5ml (2ml vial)", price: { amount: "599.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Dosage", values: ["1mg/0.5ml (2ml vial)", "2mg/0.5ml (2ml vial)", "4mg/0.5ml (2ml vial)"] }]
  },
  {
    id: "gid://shopify/Product/8226787721291",
    title: "Tirzepatide Dual Incretin",
    description: "Tirzepatide Dual Incretin, Injectable, 5mg / 0.5ml Vial.",
    handle: "tirzepatide",
    productType: "Injectable",
    tags: ["featured", "injectable", "tirzepatide", "weight-loss", "glp-1"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "389.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_Tirzepatide.png?v=1780602022", altText: "Tirzepatide" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847115", title: "5mg / 0.5ml Vial", price: { amount: "389.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847116", title: "10mg / 0.5ml Vial", price: { amount: "449.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847117", title: "15mg / 0.5ml Vial", price: { amount: "499.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Strength", values: ["5mg / 0.5ml Vial", "10mg / 0.5ml Vial", "15mg / 0.5ml Vial"] }]
  },
  {
    id: "gid://shopify/Product/8226787721292",
    title: "Semaglutide Compounded Solution",
    description: "Semaglutide Compounded Solution, Injectable, 1mg/ml (2ml Vial).",
    handle: "semaglutide",
    productType: "Injectable",
    tags: ["featured", "injectable", "semaglutide", "weight-loss", "glp-1"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "289.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_Semaglutide.png?v=1780602022", altText: "Semaglutide" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847118", title: "1mg/ml (2ml Vial)", price: { amount: "289.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847119", title: "2.5mg/ml (2ml Vial)", price: { amount: "349.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Concentration", values: ["1mg/ml (2ml Vial)", "2.5mg/ml (2ml Vial)"] }]
  },
  {
    id: "gid://shopify/Product/8226787721293",
    title: "BPC-157 Peptide Solution",
    description: "BPC-157 Peptide Solution, Peptides, 5mg Lyophilized Vial.",
    handle: "bpc-157",
    productType: "Peptides",
    tags: ["featured", "peptides", "bpc-157", "injectable", "recovery"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "159.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_BPC157.png?v=1780602022", altText: "BPC-157" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847120", title: "5mg Lyophilized Vial", price: { amount: "159.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847121", title: "10mg Lyophilized Vial", price: { amount: "229.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Quantity", values: ["5mg Lyophilized Vial", "10mg Lyophilized Vial"] }]
  },
  {
    id: "gid://shopify/Product/8226787721294",
    title: "NAD+ Solution",
    description: "NAD+ Solution, Injectable, 500mg (5ml Vial).",
    handle: "nad-plus",
    productType: "Injectable",
    tags: ["featured", "injectable", "nad", "peptides", "cellular-health"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "219.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_NAD.png?v=1780602022", altText: "NAD+" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847122", title: "500mg (5ml Vial)", price: { amount: "219.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847123", title: "1000mg (10ml Vial)", price: { amount: "369.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Vial Size", values: ["500mg (5ml Vial)", "1000mg (10ml Vial)"] }]
  },
  {
    id: "gid://shopify/Product/8226787721295",
    title: "CJC-1295 + Ipamorelin Stack",
    description: "CJC-1295 + Ipamorelin Stack, Peptide Stacks, 5mg/5mg Blend.",
    handle: "cjc-1295-ipamorelin",
    productType: "Peptide Stacks",
    tags: ["featured", "stacks", "cjc-1295", "ipamorelin", "peptides", "mens-health"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "249.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_CJC_Ipamorelin.png?v=1780602022", altText: "CJC Ipamorelin" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847124", title: "5mg/5mg Blend", price: { amount: "249.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847125", title: "10mg/10mg Blend", price: { amount: "399.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Blend Ratio", values: ["5mg/5mg Blend", "10mg/10mg Blend"] }]
  },
  {
    id: "gid://shopify/Product/8226787721296",
    title: "Enclomiphene Citrate Capsule",
    description: "Enclomiphene Citrate Capsule, Testosterone, 12.5mg (30 Capsules).",
    handle: "enclomiphene",
    productType: "Testosterone",
    tags: ["testosterone", "mens-health", "enclomiphene", "oral", "featured"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "149.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_Enclomiphene.png?v=1780602022", altText: "Enclomiphene" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847126", title: "12.5mg (30 Capsules)", price: { amount: "149.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847127", title: "25mg (30 Capsules)", price: { amount: "199.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Strength", values: ["12.5mg (30 Capsules)", "25mg (30 Capsules)"] }]
  },
  {
    id: "gid://shopify/Product/8226787721297",
    title: "GHK-Cu Copper Tripeptide Complex",
    description: "GHK-Cu Copper Tripeptide Complex, Topical, 50mg (30ml Solution).",
    handle: "ghk-cu",
    productType: "Topical",
    tags: ["topical", "peptides", "hair-skin", "ghk-cu", "hair-loss"],
    vendor: "Nuvmed",
    priceRange: { minVariantPrice: { amount: "139.0", currencyCode: "USD" } },
    images: {
      edges: [
        { node: { url: "https://cdn.shopify.com/s/files/1/0705/5776/1610/files/NM_GHKCu.png?v=1780602022", altText: "GHK-Cu" } }
      ]
    },
    variants: {
      edges: [
        { node: { id: "gid://shopify/ProductVariant/43668005847128", title: "50mg (30ml Solution)", price: { amount: "139.0", currencyCode: "USD" }, availableForSale: true } },
        { node: { id: "gid://shopify/ProductVariant/43668005847129", title: "100mg (60ml Solution)", price: { amount: "219.0", currencyCode: "USD" }, availableForSale: true } }
      ]
    },
    options: [{ name: "Volume", values: ["50mg (30ml Solution)", "100mg (60ml Solution)"] }]
  }
];

export async function fetchProducts(params: {
  type?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
} = {}): Promise<{ count: number; products: Product[] }> {
  try {
    const cleanParams: Record<string, string> = {};
    if (params.type) cleanParams.type = params.type;
    if (params.tag) cleanParams.tag = params.tag;
    if (params.search) cleanParams.search = params.search;
    if (params.featured) cleanParams.featured = 'true';

    const qs = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/api/products${qs ? `?${qs}` : ''}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (Array.isArray(data.products) && data.products.length > 0) {
      // populate cache
      data.products.forEach((p: Product) => {
        cache.productMap.set(p.handle, p);
      });
      return { count: data.count || data.products.length, products: data.products };
    }
    throw new Error('Empty product list');
  } catch (err) {
    console.warn('Using product fallback cache due to fetch error:', err);
    // Apply client-side filtering on fallback catalog
    let list = [...FALLBACK_PRODUCTS];
    if (params.type) {
      list = list.filter(p => p.productType.toLowerCase() === params.type?.toLowerCase());
    }
    if (params.tag) {
      list = list.filter(p => p.tags.includes(params.tag as string));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (params.featured) {
      list = list.filter(p => p.tags.includes('featured'));
    }
    return { count: list.length, products: list };
  }
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  if (cache.productMap.has(handle)) {
    return cache.productMap.get(handle) || null;
  }
  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(handle)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.status === 404) {
      const fallback = FALLBACK_PRODUCTS.find(p => p.handle === handle);
      return fallback || null;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const product = await res.json();
    if (product && product.handle) {
      cache.productMap.set(product.handle, product);
      return product;
    }
    return null;
  } catch (err) {
    console.warn(`Error fetching product ${handle}, checking fallback:`, err);
    return FALLBACK_PRODUCTS.find(p => p.handle === handle) || null;
  }
}

export async function fetchTypes(): Promise<string[]> {
  if (cache.types && cache.types.length > 0) return cache.types;
  try {
    const res = await fetch(`${API_BASE}/api/types`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cache.types = data;
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch types:', err);
  }
  const defaultTypes = [
    "Injectable",
    "Testosterone",
    "Peptides",
    "Oral",
    "Topical",
    "Nasal Spray",
    "Peptide Stacks",
    "Weight Loss"
  ];
  cache.types = defaultTypes;
  return defaultTypes;
}

export async function fetchTags(): Promise<string[]> {
  if (cache.tags && cache.tags.length > 0) return cache.tags;
  try {
    const res = await fetch(`${API_BASE}/api/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cache.tags = data;
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch tags:', err);
  }
  const defaultTags = [
    "weight-loss",
    "peptides",
    "mens-health",
    "hair-loss",
    "sexual-health",
    "cellular-health",
    "injectable",
    "oral",
    "featured"
  ];
  cache.tags = defaultTags;
  return defaultTags;
}
