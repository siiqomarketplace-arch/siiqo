"use client";

import React, { useState, JSX } from "react";
import Input from "@/components/ui/new/Input";
import Icon from "@/components/AppIcon";
import Image from "@/components/ui/alt/AppImageAlt";
import Button from "@/components/ui/new/Button";
import { Checkbox } from "@/components/ui/new/Checkbox";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  images: any; 
  sku?: string;
  stock?: number;
  status?: "active" | "draft" | "out-of-stock" | "inactive";
  createdAt?: string;
}

interface ProductTableProps {
  products: Product[];
  selectedProducts: number[];
  onProductSelect: (productId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditProduct: (productId: number) => void;
  onDuplicateProduct: (productId: number) => void;
  onDeleteProduct: (productId: number) => void;
  onAddProduct: () => void;
  onQuickEdit: (
    productId: number,
    field: string,
    value: string | number
  ) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onQuickEdit,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleQuickEdit = (productId: number, field: string, value: any) => {
    setEditingCell(`${productId}-${field}`);
    setEditValue(String(value));
  };

  const saveQuickEdit = (productId: number, field: string) => {
    const value = field === "price" ? parseFloat(editValue) : editValue;
    // Calls the handleQuickEdit logic in the parent (API Call)
    onQuickEdit(productId, field, value);
    setEditingCell(null);
  };

  const cancelQuickEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <div className="overflow-hidden border rounded-lg bg-card border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50 border-border">
            <tr className="text-left text-sm font-medium text-muted-foreground">
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition">
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => onProductSelect(product.id, e.target.checked)}
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/placeholder-product.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {product.category}
                </td>

                <td className="px-4 py-4">
                  {editingCell === `${product.id}-price` ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 h-8"
                        autoFocus
                      />
                      <button onClick={() => saveQuickEdit(product.id, "price")} className="text-success hover:scale-110 transition-transform">
                        <Icon name="Check" size={16} />
                      </button>
                      <button onClick={cancelQuickEdit} className="text-error hover:scale-110 transition-transform">
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickEdit(product.id, "price", product.price)}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      ₦{product.price.toLocaleString()}
                    </button>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditProduct(product.id)} 
                      iconName="Edit" 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDuplicateProduct(product.id)} 
                      iconName="Copy" 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeleteProduct(product.id)} 
                      iconName="Trash2" 
                      className="text-error hover:bg-error/10"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="py-20 text-center">
          <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground text-sm">Your inventory is currently empty.</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;