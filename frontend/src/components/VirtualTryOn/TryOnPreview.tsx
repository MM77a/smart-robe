import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Heart, RefreshCw } from 'lucide-react';
import type { WardrobeItem } from './WardrobeGallery';
import type { ContextSettings } from './WeatherContext';

// ─── Processing animation ────────────────────────────────────────────────────

const PROCESSING_STEPS = [
  { pct: 8,  label: 'Detecting body pose…'         },
  { pct: 22, label: 'Segmenting garment…'           },
  { pct: 41, label: 'Warping fabric to fit…'        },
  { pct: 60, label: 'Applying lighting & shadows…'  },
  { pct: 77, label: 'Rendering fine details…'       },
  { pct: 91, label: 'Finalising your look…'         },
  { pct: 99, label: 'Almost there…'                 },
] as const;

const DEMO_DURATION_MS = 4800;

function ProcessingOverlay({ onDone }: { onDone: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    let raf: number;

    const tick = () => {
      const frac = Math.min((Date.now() - start) / DEMO_DURATION_MS, 1);
      setProgress(Math.round(frac * 100));

      const step = [...PROCESSING_STEPS].reverse().find((s) => frac * 100 >= s.pct);
      if (step) setStepIdx(PROCESSING_STEPS.indexOf(step));

      if (frac < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const label = PROCESSING_STEPS[stepIdx]?.label ?? 'Processing…';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/80 backdrop-blur-sm rounded-2xl z-10">
      {/* Spinning rings */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-purple-900/50" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400 animate-spin" />
        <div className="absolute inset-1.5 rounded-full border-4 border-transparent border-b-purple-500/60 animate-[spin_1.8s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-purple-300 animate-float" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-white/70 text-xs font-medium text-center px-4"
        >
          {label}
        </motion.p>
      </AnimatePresence>

      <div className="w-36 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #9333ea, #ec4899)',
            width: `${progress}%`,
          }}
        />
      </div>
      <p className="text-white/25 text-[10px] -mt-3">{progress}%</p>
    </div>
  );
}

// ─── Garment panel (inner component to isolate imgError state) ───────────────

function GarmentPanel({ item }: { item: WardrobeItem }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [item.id]);

  return (
    <>
      {!imgError ? (
        <img
          src={item.image}
          alt={item.nameEn}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${item.placeholderGradient} flex items-center justify-center`}
        >
          <span className="text-5xl">{item.emoji}</span>
        </div>
      )}
    </>
  );
}

// ─── User photo panel ────────────────────────────────────────────────────────

function UserPhotoPanel() {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {!imgError ? (
        <img
          src="/user-photo.jpg"
          alt="Your photo"
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 to-gray-950 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl opacity-30">📷</span>
          <p className="text-white/20 text-[10px] text-center px-4">
            Add user-photo.jpg to<br />frontend/public/
          </p>
        </div>
      )}
    </>
  );
}

// ─── Result photo panel ──────────────────────────────────────────────────────

function ResultPanel() {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {!imgError ? (
        <img
          src="/tryon-result.jpg"
          alt="Try-on result"
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-pink-900/40 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-300/60" />
          <p className="text-white/40 text-[10px] text-center px-4">
            Add tryon-result.jpg to<br />frontend/public/
          </p>
        </div>
      )}
    </>
  );
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────

interface PanelWrapperProps {
  label: string;
  ringActive?: boolean;
  children: React.ReactNode;
}

function PanelWrapper({ label, ringActive = false, children }: PanelWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/35 text-center">
        {label}
      </div>
      <div
        className={[
          'relative rounded-2xl overflow-hidden ring-1 transition-all duration-300',
          ringActive ? 'ring-purple-500/50' : 'ring-white/10',
        ].join(' ')}
        style={{ aspectRatio: '2/3' }}
      >
        {children}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="text-white/55 text-[10px] bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Divider arrow ────────────────────────────────────────────────────────────

function Arrow({ active }: { active: boolean }) {
  return (
    <div className="flex items-center self-center flex-shrink-0 px-1">
      <div className="flex flex-col items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            active ? 'bg-purple-400' : 'bg-white/10'
          }`}
        />
        <div
          className={`w-px h-10 transition-colors ${
            active
              ? 'bg-gradient-to-b from-purple-400/70 to-pink-400/70'
              : 'bg-white/10'
          }`}
        />
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            active ? 'bg-pink-400' : 'bg-white/10'
          }`}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export type TryOnStage = 'idle' | 'processing' | 'result';

interface TryOnPreviewProps {
  selectedItem: WardrobeItem | null;
  settings: ContextSettings;
  stage: TryOnStage;
  onGenerate: () => void;
  onProcessingDone: () => void;
  onSave: () => void;
  onSeeMore: () => void;
}

export default function TryOnPreview({
  selectedItem,
  settings,
  stage,
  onGenerate,
  onProcessingDone,
  onSave,
  onSeeMore,
}: TryOnPreviewProps) {
  const canGenerate = !!selectedItem && stage === 'idle';

  // Build a short description line for the current outfit
  const description = selectedItem
    ? `${selectedItem.nameEn} · ${settings.occasion} · ${settings.weather} · ${settings.timeOfDay}`
    : null;

  return (
    <div className="space-y-5">
      {/* ── Three-panel preview ── */}
      <div className="flex gap-0 sm:gap-1 items-stretch">
        {/* Panel 1 – Your Photo */}
        <PanelWrapper label="Your Photo">
          <UserPhotoPanel />
        </PanelWrapper>

        <Arrow active={!!selectedItem} />

        {/* Panel 2 – Selected Garment */}
        <PanelWrapper label="Garment" ringActive={!!selectedItem}>
          {selectedItem ? (
            <GarmentPanel item={selectedItem} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 to-gray-950 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl opacity-30">👗</span>
              <p className="text-white/20 text-[10px] text-center px-3">
                Select from wardrobe
              </p>
            </div>
          )}
        </PanelWrapper>

        <Arrow active={stage === 'result'} />

        {/* Panel 3 – Result */}
        <PanelWrapper label="Try-On Result" ringActive={stage === 'result'}>
          <AnimatePresence>
            {stage === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20"
              >
                <ProcessingOverlay onDone={onProcessingDone} />
              </motion.div>
            )}
          </AnimatePresence>

          {stage === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              <ResultPanel />
              {/* Success badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="absolute top-2 right-2 z-10 bg-emerald-500 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              >
                ✓ Ready
              </motion.div>
            </motion.div>
          )}

          {stage === 'idle' && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-purple-950/30 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white/20" />
              </div>
              <p className="text-white/20 text-[10px] text-center px-3">
                Click Generate to see your look
              </p>
            </div>
          )}
        </PanelWrapper>
      </div>

      {/* Outfit description */}
      <AnimatePresence>
        {description && (
          <motion.p
            key={description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-white/35 text-xs"
          >
            {description}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-3 justify-center pt-1">
        {/* Generate */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={[
            'relative group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-white font-bold text-sm transition-all duration-300',
            canGenerate
              ? 'hover:shadow-[0_0_25px_rgba(168,85,247,0.45)] active:scale-95'
              : 'opacity-40 cursor-not-allowed',
          ].join(' ')}
          style={{
            background: canGenerate
              ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)'
              : 'rgba(255,255,255,0.08)',
          }}
        >
          {canGenerate && (
            <span className="absolute inset-0 animate-pulse-glow rounded-xl pointer-events-none opacity-50" />
          )}
          <Sparkles className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Generate Try-On</span>
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={stage !== 'result'}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all bg-white/[0.07] border border-white/15 text-white/70 hover:bg-white/[0.12] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <Heart className="w-4 h-4" />
          Save Outfit
        </button>

        {/* See More */}
        <button
          onClick={onSeeMore}
          disabled={stage !== 'result'}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all bg-white/[0.07] border border-white/15 text-white/70 hover:bg-white/[0.12] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          See More Options
        </button>
      </div>
    </div>
  );
}
