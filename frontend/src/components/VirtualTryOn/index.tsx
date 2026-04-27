import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import UserProfile from './UserProfile';
import WardrobeGallery, { WardrobeItem } from './WardrobeGallery';
import WeatherContext, { ContextSettings } from './WeatherContext';
import ClothingSelector from './ClothingSelector';
import TryOnPreview, { TryOnStage } from './TryOnPreview';

const DEFAULT_SETTINGS: ContextSettings = {
  weather:     'sunny',
  occasion:    'casual',
  timeOfDay:   'afternoon',
  temperature: '22',
  prompt:      '',
};

export default function VirtualTryOn() {
  const [selectedItem,  setSelectedItem]  = useState<WardrobeItem | null>(null);
  const [settings,      setSettings]      = useState<ContextSettings>(DEFAULT_SETTINGS);
  const [stage,         setStage]         = useState<TryOnStage>('idle');
  const [savedCount,    setSavedCount]    = useState(0);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleSelectItem = useCallback(
    (item: WardrobeItem) => {
      setSelectedItem(item);
      // Reset result if user picks a different garment
      if (stage === 'result') setStage('idle');
    },
    [stage],
  );

  const handleClearItem = useCallback(() => {
    setSelectedItem(null);
    setStage('idle');
  }, []);

  const handleSettingsChange = useCallback((updates: Partial<ContextSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selectedItem) return;
    setStage('processing');
  }, [selectedItem]);

  const handleProcessingDone = useCallback(() => {
    setStage('result');
  }, []);

  const handleSave = useCallback(() => {
    if (stage !== 'result') return;
    setSavedCount((n) => n + 1);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  }, [stage]);

  const handleSeeMore = useCallback(() => {
    // Keep selected item + settings; let user adjust and regenerate
    setStage('idle');
  }, []);

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background:
          'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(88,28,135,0.55) 0%, transparent 65%), #030712',
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page title ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-purple-300 mb-4">
            <Sparkles className="w-3 h-3" />
            Smart-Robe · Virtual Stylist Demo
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Virtual{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #c084fc, #f472b6)' }}
            >
              Try-On
            </span>{' '}
            Studio
          </h1>
          <p className="text-white/35 text-sm mt-2">
            Select a garment from your wardrobe and see how it looks on you
          </p>
        </motion.div>

        {/* ── User Profile ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <UserProfile savedCount={savedCount} />
        </motion.div>

        {/* ── Wardrobe Gallery ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WardrobeGallery selectedItem={selectedItem} onSelectItem={handleSelectItem} />
        </motion.div>

        {/* ── Main content: context controls + preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left column – context controls + selected item */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <h3 className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4">
                Context &amp; Style
              </h3>
              <WeatherContext settings={settings} onChange={handleSettingsChange} />
            </div>

            <ClothingSelector selectedItem={selectedItem} onClear={handleClearItem} />
          </div>

          {/* Right column – try-on preview (spans 2 cols on lg) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 h-full">
              <h3 className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4">
                Try-On Preview
              </h3>
              <TryOnPreview
                selectedItem={selectedItem}
                settings={settings}
                stage={stage}
                onGenerate={handleGenerate}
                onProcessingDone={handleProcessingDone}
                onSave={handleSave}
                onSeeMore={handleSeeMore}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Save toast ── */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{ opacity: 0, y: -10,   scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl backdrop-blur-sm"
          >
            ✓ Outfit saved to your collection!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
