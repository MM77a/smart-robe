import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, CheckCircle, Shirt } from 'lucide-react';

interface TryOnViewerProps {
  personPreview: string | null;
  garmentPreview: string | null;
  onReset: () => void;
}

// ─── Before / After comparison slider ────────────────────────────────────────
function ComparisonSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const [pos, setPos] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.max(2, Math.min(98, v));

  const updateFromX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  // Mouse
  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; updateFromX(e.clientX); };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updateFromX(e.clientX); };
  const onMouseUp   = () => { dragging.current = false; };

  // Touch
  const onTouchStart = (e: React.TouchEvent) => { dragging.current = true; updateFromX(e.touches[0].clientX); };
  const onTouchMove  = (e: React.TouchEvent) => { if (dragging.current) updateFromX(e.touches[0].clientX); };
  const onTouchEnd   = () => { dragging.current = false; };

  // Global mouseup so drag ends even if cursor leaves element
  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden select-none cursor-ew-resize shadow-[0_0_60px_rgba(168,85,247,0.25)]"
      style={{ aspectRatio: '2/3' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* AFTER image (result / right side) — full background */}
      <img
        src={after}
        alt="Try-on result"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* BEFORE image (original / left side) — clipped by slider */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${pos}%` }}
      >
        {/* Width trick: since we clip the container, scale the image back out */}
        <img
          src={before}
          alt="Original"
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${(100 / pos) * 100}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute top-3 left-3">
        <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Before
        </span>
      </div>
      <div className="pointer-events-none absolute top-3 right-3">
        <span className="bg-purple-500/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          After ✦
        </span>
      </div>

      {/* Divider line */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-[2px] shadow-[0_0_12px_4px_rgba(255,255,255,0.6)]"
        style={{ left: `${pos}%`, background: 'rgba(255,255,255,0.9)' }}
      />

      {/* Drag handle */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        style={{ left: `${pos}%` }}
      >
        <div className="w-11 h-11 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-center">
          {/* ← → arrows */}
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path d="M7 1L1 7l6 6M15 1l6 6-6 6" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Drag hint — fades out after mount */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center"
      >
        <span className="bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-1 rounded-full">
          ← drag to compare →
        </span>
      </motion.div>
    </div>
  );
}

// ─── Demo result card (shown when no real result_url yet) ─────────────────────
function DemoResultCard({
  person,
  garment,
}: {
  person: string;
  garment: string | null;
}) {
  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)]"
      style={{ aspectRatio: '2/3' }}
    >
      {/* Person photo fills the card */}
      <img src={person} alt="You" className="absolute inset-0 w-full h-full object-cover" />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Floating garment thumbnail */}
      {garment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="absolute bottom-5 right-4 w-[30%] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-purple-400/60 animate-float"
        >
          <img src={garment} alt="Garment" className="w-full aspect-[3/4] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <span className="text-white text-[9px] font-bold uppercase tracking-wider">Outfit</span>
          </div>
        </motion.div>
      )}

      {/* "AI result" placeholder badge */}
      <div className="absolute top-3 left-3 right-3 flex justify-end">
        <span className="inline-flex items-center gap-1.5 bg-purple-500/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <Shirt className="w-3 h-3" />
          Try-On Preview
        </span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
        <p className="text-white font-semibold text-sm mb-0.5">Your Look</p>
        <p className="text-white/40 text-xs">
          AI generation ready — connect backend for real result
        </p>
      </div>
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────
export default function TryOnViewer({
  personPreview,
  garmentPreview,
  onReset,
}: TryOnViewerProps) {
  // In the real app, result_url comes from the backend after ML processing.
  // For this demo we show the person photo as the "after" and use the garment
  // as an overlay so users understand what the final output will look like.
  const hasComparison = !!personPreview && !!garmentPreview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-7"
    >
      {/* Success badge */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5"
      >
        <CheckCircle className="w-4 h-4" />
        Try-on complete!
      </motion.div>

      {/* Image area */}
      <div className="w-full max-w-xs mx-auto">
        {hasComparison ? (
          <ComparisonSlider before={personPreview!} after={garmentPreview!} />
        ) : personPreview ? (
          <DemoResultCard person={personPreview} garment={garmentPreview} />
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {personPreview && (
          <a
            href={personPreview}
            download="tryon_preview.png"
            className="inline-flex items-center gap-2 rounded-xl bg-white/8 border border-white/15 px-5 py-2.5 text-white/80 text-sm font-medium hover:bg-white/15 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Save
          </a>
        )}
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-white/40 text-sm font-medium hover:text-white/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try another
        </button>
      </div>
    </motion.div>
  );
}
