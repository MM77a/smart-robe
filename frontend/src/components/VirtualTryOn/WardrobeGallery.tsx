import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export interface WardrobeItem {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  color: string;
  style: string;
  tags: string[];
  image: string;
  placeholderGradient: string;
  emoji: string;
}

export const WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 1,
    name: '白色棉质衬衫',
    nameEn: 'White Cotton Shirt',
    type: 'Top',
    color: 'White',
    style: 'Minimalist',
    tags: ['Casual', 'Business'],
    image: '/wardrobe/item-1.jpg',
    placeholderGradient: 'from-slate-200 to-slate-300',
    emoji: '👔',
  },
  {
    id: 2,
    name: '米色针织毛衣',
    nameEn: 'Beige Knit Sweater',
    type: 'Top',
    color: 'Beige',
    style: 'Cozy Casual',
    tags: ['Casual', 'Autumn'],
    image: '/wardrobe/item-2.jpg',
    placeholderGradient: 'from-amber-100 to-amber-200',
    emoji: '🧶',
  },
  {
    id: 3,
    name: '黑色西装外套',
    nameEn: 'Black Blazer',
    type: 'Jacket',
    color: 'Black',
    style: 'Business',
    tags: ['Business', 'Formal'],
    image: '/wardrobe/item-3.jpg',
    placeholderGradient: 'from-gray-700 to-gray-900',
    emoji: '🕴️',
  },
  {
    id: 4,
    name: '牛仔蓝直筒裤',
    nameEn: 'Blue Straight Jeans',
    type: 'Bottom',
    color: 'Denim Blue',
    style: 'Street Casual',
    tags: ['Casual', 'Street'],
    image: '/wardrobe/item-4.jpg',
    placeholderGradient: 'from-blue-400 to-blue-600',
    emoji: '👖',
  },
  {
    id: 5,
    name: '黑色迷你裙',
    nameEn: 'Black Mini Skirt',
    type: 'Bottom',
    color: 'Black',
    style: 'Chic',
    tags: ['Party', 'Date'],
    image: '/wardrobe/item-5.jpg',
    placeholderGradient: 'from-gray-800 to-black',
    emoji: '👗',
  },
  {
    id: 6,
    name: '卡其色风衣',
    nameEn: 'Camel Trench Coat',
    type: 'Jacket',
    color: 'Camel',
    style: 'Classic',
    tags: ['Business', 'Autumn'],
    image: '/wardrobe/item-6.jpg',
    placeholderGradient: 'from-yellow-700 to-amber-600',
    emoji: '🧥',
  },
  {
    id: 7,
    name: '碎花连衣裙',
    nameEn: 'Floral Midi Dress',
    type: 'Dress',
    color: 'Multi',
    style: 'Romantic',
    tags: ['Casual', 'Date'],
    image: '/wardrobe/item-7.jpg',
    placeholderGradient: 'from-pink-300 to-rose-400',
    emoji: '🌸',
  },
  {
    id: 8,
    name: '白色运动套装',
    nameEn: 'White Sports Set',
    type: 'Set',
    color: 'White',
    style: 'Sporty',
    tags: ['Sport', 'Casual'],
    image: '/wardrobe/item-8.jpg',
    placeholderGradient: 'from-gray-100 to-gray-200',
    emoji: '🏃',
  },
  {
    id: 9,
    name: '高腰阔腿裤',
    nameEn: 'High-Waist Wide-Leg Pants',
    type: 'Bottom',
    color: 'Black',
    style: 'Modern',
    tags: ['Business', 'Casual'],
    image: '/wardrobe/item-9.jpg',
    placeholderGradient: 'from-neutral-700 to-neutral-900',
    emoji: '✨',
  },
];

interface WardrobeCardProps {
  item: WardrobeItem;
  isSelected: boolean;
  onClick: () => void;
}

function WardrobeCard({ item, isSelected, onClick }: WardrobeCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={[
        'relative flex-shrink-0 w-32 md:w-36 rounded-2xl overflow-hidden cursor-pointer',
        'border-2 transition-all duration-200',
        isSelected
          ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.55)]'
          : 'border-white/10 hover:border-purple-400/50',
      ].join(' ')}
    >
      <div className="relative" style={{ aspectRatio: '3/4' }}>
        {!imgError ? (
          <img
            src={item.image}
            alt={item.nameEn}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${item.placeholderGradient} flex items-center justify-center`}
          >
            <span className="text-4xl">{item.emoji}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Selected check */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-900" />
          </motion.div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-bold uppercase tracking-wide bg-black/50 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded-md">
            {item.type}
          </span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold leading-tight truncate">{item.name}</p>
          <p className="text-white/55 text-[10px] truncate">
            {item.color} · {item.style}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

interface WardrobeGalleryProps {
  selectedItem: WardrobeItem | null;
  onSelectItem: (item: WardrobeItem) => void;
}

export default function WardrobeGallery({ selectedItem, onSelectItem }: WardrobeGalleryProps) {
  // Duplicate items for seamless infinite scroll (animation goes 0 → -50%)
  const doubled = [...WARDROBE_ITEMS, ...WARDROBE_ITEMS];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/70 text-sm font-bold uppercase tracking-widest">
          My Wardrobe
          <span className="ml-2 text-purple-400 font-normal normal-case tracking-normal text-xs">
            9 items · click to select
          </span>
        </h3>
        {selectedItem && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-purple-300 text-xs hidden sm:block"
          >
            Selected: {selectedItem.nameEn}
          </motion.span>
        )}
      </div>

      {/* Infinite scroll container */}
      <div className="relative overflow-hidden rounded-xl group/gallery">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        {/* Scrolling track – pauses on hover so items are clickable */}
        <div
          className="flex gap-3 py-2 animate-scroll-x group-hover/gallery:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {doubled.map((item, index) => (
            <WardrobeCard
              key={`${item.id}-${index}`}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
