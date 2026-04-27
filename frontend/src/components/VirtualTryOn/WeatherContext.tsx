import { Cloud, Sun, CloudRain, Snowflake, Thermometer } from 'lucide-react';

const WEATHERS = [
  { id: 'sunny',  label: 'Sunny',  Icon: Sun,         activeColor: 'text-yellow-400' },
  { id: 'cloudy', label: 'Cloudy', Icon: Cloud,        activeColor: 'text-gray-300'  },
  { id: 'rainy',  label: 'Rainy',  Icon: CloudRain,    activeColor: 'text-blue-400'  },
  { id: 'cold',   label: 'Cold',   Icon: Snowflake,    activeColor: 'text-sky-300'   },
  { id: 'hot',    label: 'Hot',    Icon: Thermometer,  activeColor: 'text-orange-400'},
] as const;

const OCCASIONS = [
  { id: 'casual',   label: 'Casual',    emoji: '😊' },
  { id: 'business', label: 'Business',  emoji: '💼' },
  { id: 'date',     label: 'Date Night',emoji: '💕' },
  { id: 'party',    label: 'Party',     emoji: '🎉' },
  { id: 'sport',    label: 'Sport',     emoji: '🏃' },
  { id: 'formal',   label: 'Formal',    emoji: '🎩' },
] as const;

const TIMES = [
  { id: 'morning',   label: 'Morning',   emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { id: 'evening',   label: 'Evening',   emoji: '🌆' },
  { id: 'night',     label: 'Night',     emoji: '🌙' },
] as const;

export interface ContextSettings {
  weather: string;
  occasion: string;
  timeOfDay: string;
  temperature: string;
  prompt: string;
}

interface WeatherContextProps {
  settings: ContextSettings;
  onChange: (updates: Partial<ContextSettings>) => void;
}

export default function WeatherContext({ settings, onChange }: WeatherContextProps) {
  return (
    <div className="space-y-5">
      {/* Weather condition */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
          Weather Condition
        </label>
        <div className="flex gap-2 flex-wrap">
          {WEATHERS.map(({ id, label, Icon, activeColor }) => (
            <button
              key={id}
              onClick={() => onChange({ weather: id })}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                settings.weather === id
                  ? 'bg-purple-600/40 border border-purple-400/60 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <Icon className={`w-3.5 h-3.5 ${settings.weather === id ? activeColor : ''}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
          Temperature
        </label>
        <div className="relative max-w-[120px]">
          <input
            type="number"
            value={settings.temperature}
            onChange={(e) => onChange({ temperature: e.target.value })}
            placeholder="22"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-400/60"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">°C</span>
        </div>
      </div>

      {/* Occasion */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
          Occasion
        </label>
        <div className="flex gap-2 flex-wrap">
          {OCCASIONS.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => onChange({ occasion: id })}
              className={[
                'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all',
                settings.occasion === id
                  ? 'bg-pink-600/30 border border-pink-400/50 text-white'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Time of day */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
          Time of Day
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TIMES.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => onChange({ timeOfDay: id })}
              className={[
                'flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs transition-all',
                settings.timeOfDay === id
                  ? 'bg-blue-600/25 border border-blue-400/40 text-white'
                  : 'bg-white/5 border border-white/10 text-white/55 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <span className="text-base">{emoji}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style notes / prompt */}
      <div>
        <label className="block text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">
          Style Notes{' '}
          <span className="text-white/25 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          value={settings.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="Describe your style preference… e.g. 'Clean minimal look for a business meeting'"
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-400/60 resize-none"
        />
      </div>
    </div>
  );
}
