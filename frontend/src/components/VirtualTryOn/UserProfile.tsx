import { useState } from 'react';
import { Star, MapPin, Sparkles } from 'lucide-react';

interface UserProfileProps {
  savedCount: number;
}

export default function UserProfile({ savedCount }: UserProfileProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden ring-2 ring-purple-500/50">
          {!imgError ? (
            <img
              src="/user-photo.jpg"
              alt="User"
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-gray-950" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-white font-bold text-base md:text-lg leading-tight truncate">
            Style Demo
          </h2>
          <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
            <Star className="w-2.5 h-2.5 fill-yellow-400" /> PRO
          </span>
        </div>
        <p className="text-white/45 text-xs flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Shanghai · Modern Minimalist Style
        </p>
        <div className="flex gap-5 mt-2.5">
          {[
            { label: 'Wardrobe', value: '9' },
            { label: 'Saved',    value: String(savedCount) },
            { label: 'Rating',   value: '4.9★' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-white font-bold text-sm">{value}</div>
              <div className="text-white/35 text-[10px]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Style tags – desktop only */}
      <div className="hidden lg:flex flex-col gap-1.5 flex-shrink-0">
        {['Minimalist', 'Casual Chic', 'Modern'].map((tag) => (
          <span
            key={tag}
            className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* AI badge – desktop only */}
      <div className="hidden md:flex flex-col items-end flex-shrink-0">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <div>
            <div className="text-white/70 text-xs font-semibold">AI Stylist</div>
            <div className="text-white/30 text-[10px]">Powered by Smart-Robe</div>
          </div>
        </div>
      </div>
    </div>
  );
}
