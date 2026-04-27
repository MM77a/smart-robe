import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Palette, Layers, X } from 'lucide-react';
import type { WardrobeItem } from './WardrobeGallery';

interface ClothingSelectorProps {
  selectedItem: WardrobeItem | null;
  onClear: () => void;
}

export default function ClothingSelector({ selectedItem, onClear }: ClothingSelectorProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state when a different item is selected
  useEffect(() => {
    setImgError(false);
  }, [selectedItem?.id]);

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/60 text-[11px] font-bold uppercase tracking-widest">
          Selected Item
        </h3>
        {selectedItem && (
          <button
            onClick={onClear}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedItem ? (
          <motion.div
            key={selectedItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex gap-4 items-start"
          >
            {/* Thumbnail */}
            <div
              className="relative rounded-xl overflow-hidden flex-shrink-0 w-24"
              style={{ aspectRatio: '3/4' }}
            >
              {!imgError ? (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.nameEn}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${selectedItem.placeholderGradient} flex items-center justify-center`}
                >
                  <span className="text-4xl">{selectedItem.emoji}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{selectedItem.name}</p>
                <p className="text-white/45 text-xs">{selectedItem.nameEn}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Layers className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  <span>
                    Type: <span className="text-white/75">{selectedItem.type}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Palette className="w-3 h-3 text-pink-400 flex-shrink-0" />
                  <span>
                    Color: <span className="text-white/75">{selectedItem.color}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Tag className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span>
                    Style: <span className="text-white/75">{selectedItem.style}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-0.5">
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <span className="text-3xl opacity-30">👗</span>
            </div>
            <p className="text-white/30 text-sm">No item selected</p>
            <p className="text-white/20 text-xs mt-1">Select from wardrobe above</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
