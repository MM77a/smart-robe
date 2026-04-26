import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { OutfitRecommendation } from '../lib/api';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  const scorePercent = Math.round(outfit.score * 100);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-64 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Item images */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {outfit.items.slice(0, 4).map((item) => (
          <div
            key={item.item_id}
            className="aspect-square rounded-lg bg-gray-100 overflow-hidden"
          >
            {item.segmented_url ? (
              <img
                src={item.segmented_url}
                alt="outfit item"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                No image
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-400 mb-1">
          {outfit.items.length} piece{outfit.items.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">{scorePercent}% match</span>
        </div>
        {outfit.items[0]?.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {outfit.items[0].tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
