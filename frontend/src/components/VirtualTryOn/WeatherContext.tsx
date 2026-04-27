'use client';

import React, { useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';

interface WeatherOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface OccasionOption {
  id: string;
  label: string;
  emoji: string;
}

const WEATHER_OPTIONS: WeatherOption[] = [
  { id: 'sunny', label: '晴天', icon: <Sun className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'cloudy', label: '多云', icon: <Cloud className="w-5 h-5" />, color: 'bg-gray-100 text-gray-700' },
  { id: 'rainy', label: '下雨', icon: <CloudRain className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
  { id: 'snowy', label: '下雪', icon: <CloudSnow className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
  { id: 'windy', label: '多风', icon: <Wind className="w-5 h-5" />, color: 'bg-cyan-100 text-cyan-700' },
];

const OCCASION_OPTIONS: OccasionOption[] = [
  { id: 'casual', label: '休闲', emoji: '👕' },
  { id: 'business', label: '商务', emoji: '💼' },
  { id: 'party', label: '派对', emoji: '🎉' },
  { id: 'sports', label: '运动', emoji: '⚽' },
  { id: 'formal', label: '正式', emoji: '🎩' },
  { id: 'date', label: '约会', emoji: '💝' },
  { id: 'street', label: '街拍', emoji: '📸' },
];

interface WeatherContextProps {
  onWeatherChange?: (weather: string) => void;
  onOccasionChange?: (occasion: string) => void;
  onTemperatureChange?: (temp: number) => void;
}

const WeatherContext: React.FC<WeatherContextProps> = ({
  onWeatherChange,
  onOccasionChange,
  onTemperatureChange,
}) => {
  const [selectedWeather, setSelectedWeather] = useState('sunny');
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [temperature, setTemperature] = useState(22);

  const handleWeatherChange = (weatherId: string) => {
    setSelectedWeather(weatherId);
    onWeatherChange?.(weatherId);
  };

  const handleOccasionChange = (occasionId: string) => {
    setSelectedOccasion(occasionId);
    onOccasionChange?.(occasionId);
  };

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = parseInt(e.target.value);
    setTemperature(temp);
    onTemperatureChange?.(temp);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white border border-slate-700 shadow-2xl">
      <div className="space-y-8">
        {/* Temperature Display */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-2">温度</p>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {temperature}°C
            </p>
          </div>
          <input
            type="range"
            min="-10"
            max="40"
            value={temperature}
            onChange={handleTempChange}
            className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((temperature + 10) / 50) * 100}%, #1e293b ${((temperature + 10) / 50) * 100}%, #1e293b 100%)`
            }}
          />
        </div>

        {/* Weather Selection */}
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">今日天气</p>
          <div className="grid grid-cols-5 gap-3">
            {WEATHER_OPTIONS.map((weather) => (
              <button
                key={weather.id}
                onClick={() => handleWeatherChange(weather.id)}
                className={`relative p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedWeather === weather.id
                    ? `${weather.color} ring-2 ring-offset-2 ring-offset-slate-900 shadow-lg`
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">{weather.icon}</div>
                  <span className="text-xs font-medium text-center">{weather.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Occasion Selection */}
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">场景</p>
          <div className="grid grid-cols-7 gap-3">
            {OCCASION_OPTIONS.map((occasion) => (
              <button
                key={occasion.id}
                onClick={() => handleOccasionChange(occasion.id)}
                className={`relative p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedOccasion === occasion.id
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-white shadow-lg'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{occasion.emoji}</span>
                  <span className="text-xs font-medium text-center text-white">{occasion.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-slate-200">
              {WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.label}，{temperature}°C，{OCCASION_OPTIONS.find(o => o.id === selectedOccasion)?.label}场景
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default WeatherContext;
