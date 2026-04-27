'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Zap, Download, Share2, RefreshCw } from 'lucide-react';

const TryOnPreview: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(1);
  const [showResult, setShowResult] = useState(false);

  const handleGenerateTryOn = async () => {
    setIsLoading(true);
    setShowResult(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setShowResult(true);
  };

  return (
    <div className="my-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">虚拟试穿</h2>
        <p className="text-slate-400">点击按钮生成你穿上衣服的效果</p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Left: User Photo */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl overflow-hidden">
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">你的照片</p>
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
            <Image
              src="/user-photo.jpg"
              alt="User Photo"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        {/* Center: Selected Item */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">选中服装</p>
          <div className="flex-1 relative rounded-xl overflow-hidden mb-4 bg-slate-800">
            <Image
              src={`/wardrobe/item-${selectedItem}.jpg`}
              alt="Selected Item"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <p className="text-white font-semibold text-center">服装 #{selectedItem}</p>
        </div>

        {/* Right: Try-On Result */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl overflow-hidden">
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">试穿效果</p>
          
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-gradient-to-r border-t-purple-500 border-r-purple-500 animate-spin" />
                </div>
                <p className="text-slate-400 text-sm">生成中...</p>
              </div>
            ) : showResult ? (
              <>
                <Image
                  src="/tryon-result.jpg"
                  alt="Try-On Result"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </>
            ) : (
              <div className="text-center text-slate-400">
                <p className="text-sm">点击下方按钮生成</p>
                <p className="text-xs mt-2">虚拟试穿效果</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        {/* Item Selector */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-300 mb-4">选择衣服：</p>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setSelectedItem(num)}
                className={`w-10 h-10 rounded-lg font-bold transition-all transform hover:scale-110 ${
                  selectedItem === num
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-2 ring-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleGenerateTryOn}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Zap className="w-5 h-5 group-hover:animate-pulse" />
            {isLoading ? '生成中...' : '生成虚拟试穿'}
          </button>

          <button
            disabled={!showResult}
            className="flex items-center gap-2 px-6 py-4 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            下载
          </button>

          <button
            disabled={!showResult}
            className="flex items-center gap-2 px-6 py-4 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5" />
            分享
          </button>

          <button
            onClick={() => {
              setShowResult(false);
              setSelectedItem((prev) => (prev % 9) + 1);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-all ml-auto"
          >
            <RefreshCw className="w-5 h-5" />
            换一个
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-300">
            💡 <span className="text-slate-200 font-medium">提示：</span> 点击"生成虚拟试穿"按钮，使用 AI 技术为你生成穿上衣服的效果图。
          </p>
        </div>
      </div>
    </div>
  );
};

export default TryOnPreview;
