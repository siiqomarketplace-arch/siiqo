import React from "react";
import { AlertCircle, X } from "lucide-react";

interface DeleteCatalogModalProps {
  isOpen: boolean;
  catalogName: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteCatalogModal: React.FC<DeleteCatalogModalProps> = ({
  isOpen,
  catalogName,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm mx-4 overflow-hidden animate-in fade-in scale-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <AlertCircle size={32} className="text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
            Delete Catalog?
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{catalogName}"</span>
            ? This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCatalogModal;
