import React, { useState, JSX } from "react";
import Input from "@/components/ui/new/Input";
import Icon from "@/components/AppIcon";
import Image from "@/components/ui/alt/AppImageAlt";
import Button from "@/components/ui/new/Button";
import { Checkbox } from "@/components/ui/new/Checkbox";

// Type definitions

import { Product } from '@/types/vendor/products';

interface ProductTableProps {
  products: Product[];
  selectedProducts: number[];
  onProductSelect: (productId: string | number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditProduct: (productId: string | number) => void;
  onDuplicateProduct: (productId: string | number) => void;
  onDeleteProduct: (productId: string | number) => void;
  onQuickEdit: (
    productId: string | number,
    field: string,
    value: string | number
  ) => void;
}

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
}

interface StockStatus {
  color: string;
  icon: string;
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

  const handleQuickEdit = (
    productId: string,
    field: string,
    value: string | number
  ): void => {
    setEditingCell(`${productId}-${field}`);
    setEditValue(String(value));
  };

  const saveQuickEdit = (productId: string, field: string): void => {
    const numericValue =
      field === "price" || field === "stock"
        ? parseFloat(editValue)
        : editValue;
    onQuickEdit(productId, field, numericValue);
    setEditingCell(null);
    setEditValue("");
  };

  const cancelQuickEdit = (): void => {
    setEditingCell(null);
    setEditValue("");
  };

  const getStatusBadge = (status: Product["status"]): JSX.Element => {
    const statusConfig: Record<Product["status"], StatusConfig> = {
      active: { bg: "bg-success/10", text: "text-success", label: "Active" },
      draft: { bg: "bg-warning/10", text: "text-warning", label: "Draft" },
      "out-of-stock": {
        bg: "bg-error/10",
        text: "text-error",
        label: "Out of Stock",
      },
      inactive: {
        bg: "bg-muted",
        text: "text-muted-foreground",
        label: "Inactive",
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return { color: "text-error", icon: "AlertCircle" };
    if (stock <= 10) return { color: "text-warning", icon: "AlertTriangle" };
    return { color: "text-success", icon: "CheckCircle" };
  };

  return (
    <div className="overflow-hidden border rounded-lg bg-card border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50 border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onChange={e => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-sm font-medium text-left text-foreground">
                Product
              </th>
              <th className="px-4 py-3 text-sm font-medium text-left text-foreground">
                Category
              </th>
              <th className="px-4 py-3 text-sm font-medium text-left text-foreground">
                Price
              </th>
              <th className="px-4 py-3 text-sm font-medium text-left text-foreground">
                Stock
              </th>
              <th className="px-4 py-3 text-sm font-medium text-left text-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-sm font-medium text-left text-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-sm font-medium text-right text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr
                  key={product.id || index}
                  className="hover:bg-muted/30 transition-smooth"
                >
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedProducts.includes(Number(product.id))}
                      onChange={e =>
                        onProductSelect(product.id, e.target.checked)
                      }
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs truncate text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      {product.category}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {editingCell === `${product.id}-price` ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-20"
                          step="0.01"
                        />
                        <button
                          onClick={() => saveQuickEdit(String(product.id), "price")}
                          className="text-success hover:text-success/80"
                        >
                          <Icon name="Check" size={16} />
                        </button>
                        <button
                          onClick={cancelQuickEdit}
                          className="text-error hover:text-error/80"
                        >
                          <Icon name="X" size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleQuickEdit(String(product.id), "price", product.price)
                        }
                        className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
                      >
                        ${product.price}
                      </button>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Icon
                        name={stockStatus.icon}
                        size={16}
                        className={stockStatus.color}
                      />
                      {editingCell === `${product.id}-stock` ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-16"
                            min="0"
                          />
                          <button
                            onClick={() => saveQuickEdit(String(product.id), "stock")}
                            className="text-success hover:text-success/80"
                          >
                            <Icon name="Check" size={16} />
                          </button>
                          <button
                            onClick={cancelQuickEdit}
                            className="text-error hover:text-error/80"
                          >
                            <Icon name="X" size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleQuickEdit(String(product.id), "stock", product.stock)
                          }
                          className={`text-sm font-medium transition-smooth ${stockStatus.color} hover:opacity-80`}
                        >
                          {product.stock}
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {getStatusBadge(product.status)}
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end space-x-2">
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
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <Icon
            name="Package"
            size={48}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="mb-2 text-lg font-medium text-foreground">
            No products found
          </h3>
          <p className="mb-4 text-muted-foreground">
            Get started by adding your first product to the catalog.
          </p>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Add New Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
