'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WardrobeItem {
  id: number;
  name: string;
  type: string;
  color: string;
  image: string;
}

const WARDROBE_ITEMS: WardrobeItem[] = [
  { id: 1, name: '黑色T恤', type: '上衣', color: '黑色', image: '/wardrobe/item-1.jpg' },
  { id: 2, name: '蓝色连衣裙', type: '连衣裙', color: '蓝色', image: '/wardrobe/item-2.jpg' },
  { id: 3, name: '白色衬衫', type: '上衣', color: '白色', image: '/wardrobe/item-3.jpg' },
  { id: 4, name: '红色外套', type: '外套', color: '红色', image: '/wardrobe/item-4.jpg' },
  { id: 5, name: '灰色卫衣', type: '卫衣', color: '灰色', image: '/wardrobe/item-5.jpg' },
  { id: 6, name: '卡其色裤子', type: '裤子', color: '卡其色', image: '/wardrobe/item-6.jpg' },
  { id: 7, name: '深蓝牛仔裤', type: '牛仔裤', color: '深蓝色', image: '/wardrobe/item-7.jpg' },
  { id: 8, name: '黑色皮夹克', type: '夹克', color: '黑色', image: '/wardrobe/item-8.jpg' },
  { id: 9, name: '米色风衣', type: '风衣', color: '米色', image: '/wardrobe/item-9.jpg' },
];

interface WardrobeGalleryProps {
  onItemSelect?: (item: WardrobeItem) => void;
}

const WardrobeGallery: React.FC<WardrobeGalleryProps> = ({ onItemSelect }) => {
  const [selectedItemId, setSelectedItemId] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % WARDROBE_ITEMS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoScroll]);

  const handleItemClick = (item: WardrobeItem) => {
    setSelectedItemId(item.id);
    setAutoScroll(false);
    onItemSelect?.(item);
  };

  const handlePrev = () => {
    setAutoScroll(false);
    setScrollIndex((prev) => (prev - 1 + WARDROBE_ITEMS.length) % WARDROBE_ITEMS.length);
  };

  const handleNext = () => {
    setAutoScroll(false);
    setScrollIndex((prev) => (prev + 1) % WARDROBE_ITEMS.length);
  };

  // Get visible items (3 items at a time)
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < 5; i++) {
      items.push(WARDROBE_ITEMS[(scrollIndex + i) % WARDROBE_ITEMS.length]);
    }
    return items;
  };

  const visibleItems = getVisibleItems();

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">我的衣柜</h2>
        <p className="text-sm text-slate-400">共 {WARDROBE_ITEMS.length} 件衣服</p>
      </div>

      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Carousel Container */}
        <div className="flex items-center gap-4">
          {/* Left Button */}
          <button
            onClick={handlePrev}
            className="flex-shrink-0 p-3 rounded-full bg-slate-700/50 hover:bg-slate-700 text-white transition-all hover:scale-110 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Items Container */}
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 justify-center">
              {visibleItems.map((item, idx) => {
                const isCenter = idx === 2;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleItemClick(item)}
                    className={`relative flex-shrink-0 transition-all duration-300 transform ${
                      isCenter
                        ? 'scale-100 opacity-100 w-40 h-56'
                        : 'scale-75 opacity-60 w-40 h-56 hover:scale-80 hover:opacity-70'
                    }`}
                  >
                    <div
                      className={`relative w-full h-full rounded-xl overflow-hidden border-2 transition-all ${
                        selectedItemId === item.id
                          ? 'border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl ring-4 ring-purple-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Item Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-slate-300">{item.type} • {item.color}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Button */}
          <button
            onClick={handleNext}
            className="flex-shrink-0 p-3 rounded-full bg-slate-700/50 hover:bg-slate-700 text-white transition-all hover:scale-110 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {WARDROBE_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setScrollIndex(idx);
                setAutoScroll(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === scrollIndex
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardrobeGallery;
