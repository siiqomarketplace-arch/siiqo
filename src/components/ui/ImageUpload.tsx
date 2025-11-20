"use client";
import React, { useState } from "react";
import { UploadCloud, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  label: string;
  onUpload: (file: File) => Promise<string>;
  onUrlChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  onUpload,
  onUrlChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setError(null);
      setFileName(file.name);
      try {
        const url = await onUpload(file);
        setUploadUrl(url);
        onUrlChange(url);
      } catch (err) {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <AnimatePresence mode="wait">
              {uploading ? (
                <motion.div
                  key="loader"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                </motion.div>
              ) : uploadUrl ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <p className="mt-2 text-sm text-gray-500">
                    {fileName || "Image"} uploaded!
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="initial"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <UploadCloud className="w-8 h-8 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;