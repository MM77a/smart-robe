import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Tag } from 'lucide-react';
import { uploadWardrobeItem, ItemUploadResponse } from '../lib/api';

// TODO: replace with real auth session
const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function WardrobeUpload() {
  const [items, setItems] = useState<ItemUploadResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    setUploading(true);
    setError(null);
    for (const file of accepted) {
      try {
        const result = await uploadWardrobeItem(PLACEHOLDER_USER_ID, file);
        setItems((prev) => [result, ...prev]);
      } catch {
        setError(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.item_id !== itemId));
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-brand-600 font-medium">Drop files here…</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-1">Drag & drop clothing photos here</p>
            <p className="text-gray-400 text-sm">or click to browse · PNG, JPG, WEBP accepted</p>
          </>
        )}
      </div>

      {uploading && (
        <p className="mt-4 text-brand-600 text-sm text-center animate-pulse">Uploading…</p>
      )}
      {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}

      {/* Items grid */}
      {items.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Items ({items.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  {item.segmented_url ? (
                    <img
                      src={item.segmented_url}
                      alt="Wardrobe item"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Processing…</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeItem(item.item_id)}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  {item.tags.length > 0 && (
                    <div className="p-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 rounded-full px-2 py-0.5"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
