import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onFileChange: (file: File | null) => void;
  initialImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, onFileChange, initialImage }) => {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {preview ? (
        <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300">
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          className="w-full h-48 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload size={32} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Click to upload</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
