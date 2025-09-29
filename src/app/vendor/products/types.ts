export type ProductDimensions = {
  length: string;
  width: string;
  height: string;
};

export type ProductImage = {
  id: number;
  file: File;
  url: string;
  alt: string;
};

export type ProductFormData = {
  name: string;
  description: string;
  category: string;
  price: string;
  comparePrice: string;
  cost: string;
  sku: string;
  barcode: string;
  stock: string;
  lowStockThreshold: string;
  weight: string;
  dimensions: ProductDimensions;
  status: "active" | "draft" | "inactive";
  visibility: "visible" | "hidden";
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  images: ProductImage[];
};

export type EditingProduct = Partial<ProductFormData>;
