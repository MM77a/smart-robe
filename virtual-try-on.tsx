'use client';

import React, { useState } from 'react';
import UserProfile from '../components/VirtualTryOn/UserProfile';
import WardrobeGallery from '../components/VirtualTryOn/WardrobeGallery';
import WeatherContext from '../components/VirtualTryOn/WeatherContext';
import StylePrompt from '../components/VirtualTryOn/StylePrompt';
import TryOnPreview from '../components/VirtualTryOn/TryOnPreview';

const VirtualTryOn = () => {
  const [selectedWeather, setSelectedWeather] = useState('sunny');
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [temperature, setTemperature] = useState(22);
  const [stylePrompt, setStylePrompt] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4">
              虚拟试衣间
            </h1>
            <p className="text-slate-400 text-lg">
              AI 驱动的个人造型师 - 探索你的穿搭无限可能
            </p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {/* User Profile */}
          <UserProfile />

          {/* Weather & Occasion Context */}
          <WeatherContext
            onWeatherChange={setSelectedWeather}
            onOccasionChange={setSelectedOccasion}
            onTemperatureChange={setTemperature}
          />

          {/* Wardrobe Gallery */}
          <WardrobeGallery />

          {/* Style Prompt */}
          <StylePrompt onPromptSubmit={setStylePrompt} />

          {/* Try-On Preview */}
          <TryOnPreview />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-700 text-center text-slate-400">
          <p className="mb-2">✨ Smart Robe - 让穿衣搭配变得简单有趣</p>
          <p className="text-sm">© 2026 | AI 个人造型师平台</p>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
