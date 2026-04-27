'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Share2, Settings } from 'lucide-react';

const UserProfile: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-end gap-6 pb-6 border-b border-slate-700">
        {/* User Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-xl">
            <Image
              src="/user-photo.jpg"
              alt="User Profile"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full px-3 py-1 text-white text-xs font-bold">
            ON
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">Smart Robe</h1>
          <p className="text-slate-400 mb-4">🌟 AI 个人造型师</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">127</p>
              <p className="text-sm text-slate-400">衣柜物品</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">48</p>
              <p className="text-sm text-slate-400">推荐穿搭</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">92</p>
              <p className="text-sm text-slate-400">风格指数</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:shadow-lg transition-all">
              <Heart className="w-4 h-4" />
              收藏
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-all">
              <Share2 className="w-4 h-4" />
              分享
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-all">
              <Settings className="w-4 h-4" />
              设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
