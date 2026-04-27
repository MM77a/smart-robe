import Head from 'next/head';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import Layout from '../components/Layout';
import TryOnViewer from '../components/TryOnViewer';

// ─── Processing messages shown during the AI animation ───────────────────────
const PROCESSING_STEPS = [
  { pct: 8,  label: 'Detecting body pose…' },
  { pct: 22, label: 'Segmenting garment…' },
  { pct: 41, label: 'Warping fabric to fit…' },
  { pct: 60, label: 'Applying lighting & shadows…' },
  { pct: 77, label: 'Rendering fine details…' },
  { pct: 91, label: 'Finalising your look…' },
  { pct: 99, label: 'Almost there…' },
];
// How long (ms) the fake generation takes before revealing the result
const DEMO_DURATION_MS = 4800;

// ─── Reusable drop-zone panel ─────────────────────────────────────────────────
interface DropPanelProps {
  label: string;
  hint: string;
  preview: string | null;
  onDrop: (files: File[]) => void;
}

function DropPanel({ label, hint, preview, onDrop }: DropPanelProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-300/70 pl-1">
        {label}
      </span>
      <div
        {...getRootProps()}
        className={[
          'relative rounded-3xl overflow-hidden cursor-pointer select-none',
          'transition-all duration-300',
          isDragActive
            ? 'ring-2 ring-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.45)]'
            : preview
            ? 'ring-1 ring-white/10 hover:ring-purple-400/50'
            : 'ring-1 ring-white/10 hover:ring-purple-400/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
        ].join(' ')}
        style={{ aspectRatio: '2/3' }}
      >
        <input {...getInputProps()} />

        {preview ? (
          <>
            {/* Photo */}
            <img
              src={preview}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
              <span className="text-white text-xs font-semibold">{label}</span>
              <span className="text-white/50 text-[10px] bg-black/40 rounded-full px-2 py-0.5 backdrop-blur-sm">
                tap to change
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/[0.03]">
            <div
              className={`rounded-2xl p-4 transition-colors ${
                isDragActive ? 'bg-purple-500/25' : 'bg-white/5'
              }`}
            >
              <Upload className="w-8 h-8 text-white/40" />
            </div>
            <div className="text-center px-4">
              <p className="text-white/60 font-medium text-sm leading-snug">
                {isDragActive ? 'Drop it here ✦' : hint}
              </p>
              <p className="text-white/25 text-xs mt-1">PNG · JPG · WEBP</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Animated processing overlay ─────────────────────────────────────────────
function ProcessingScreen({ onDone }: { onDone: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress bar smoothly
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const frac = Math.min(elapsed / DEMO_DURATION_MS, 1);
      setProgress(Math.round(frac * 100));

      // Pick current step label
      const step = [...PROCESSING_STEPS]
        .reverse()
        .find((s) => frac * 100 >= s.pct);
      if (step) setStepIdx(PROCESSING_STEPS.indexOf(step));

      if (frac < 1) {
        requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const currentLabel = PROCESSING_STEPS[stepIdx]?.label ?? 'Processing…';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="flex flex-col items-center justify-center gap-10 py-20"
    >
      {/* Spinning ring */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-purple-900/50" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500/60 animate-[spin_1.8s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wand2 className="w-8 h-8 text-purple-300 animate-float" />
        </div>
      </div>

      {/* Cycling label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentLabel}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-white/70 text-base font-medium"
        >
          {currentLabel}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #9333ea, #ec4899)',
            width: `${progress}%`,
          }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <p className="text-white/25 text-xs -mt-7">{progress}%</p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Stage = 'upload' | 'processing' | 'result';

export default function TryOnPage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);

  const onDropPerson = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setPersonPreview(URL.createObjectURL(f));
    setStage('upload');
  }, []);

  const onDropGarment = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setGarmentPreview(URL.createObjectURL(f));
    setStage('upload');
  }, []);

  const handleGenerate = () => {
    if (!personPreview) return;
    setStage('processing');
  };

  const handleReset = () => {
    setStage('upload');
  };

  const canGenerate = !!personPreview && stage === 'upload';

  return (
    <Layout>
      <Head>
        <title>Virtual Try-On | Smart-Robe</title>
      </Head>

      {/* Full dark canvas */}
      <div
        className="min-h-screen py-14 px-4"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(88,28,135,0.45) 0%, transparent 70%), #030712',
        }}
      >
        <div className="max-w-2xl mx-auto">

          {/* ── Hero header ── */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-300 mb-5">
              <Sparkles className="w-3 h-3" />
              AI Virtual Try-On
            </div>

            <h1 className="text-4xl md:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-white mb-3">
              See it on{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #c084fc, #f472b6)',
                }}
              >
                you
              </span>
            </h1>
            <p className="text-white/40 text-base max-w-sm mx-auto">
              Upload your photo and any garment — our AI shows you exactly how it fits.
            </p>
          </motion.div>

          {/* ── Main content area (animates between stages) ── */}
          <AnimatePresence mode="wait">

            {/* STAGE: upload */}
            {stage === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
              >
                {/* Two drop panels */}
                <div className="flex items-stretch gap-4 mb-8">
                  <DropPanel
                    label="Your Photo"
                    hint="Drop a full-body photo"
                    preview={personPreview}
                    onDrop={onDropPerson}
                  />

                  {/* Connector arrow */}
                  <div className="flex items-center self-center shrink-0 mt-6">
                    <ArrowRight className="w-5 h-5 text-white/15" />
                  </div>

                  <DropPanel
                    label="Garment"
                    hint="Drop a clothing photo"
                    preview={garmentPreview}
                    onDrop={onDropGarment}
                  />
                </div>

                {/* Helper hint */}
                {personPreview && !garmentPreview && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-white/30 text-sm mb-5"
                  >
                    Optionally add a garment photo, or generate with a default outfit ↓
                  </motion.p>
                )}

                {/* CTA button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="relative group inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-white font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: canGenerate
                        ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Hover shimmer */}
                    {canGenerate && (
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent)' }} />
                    )}
                    {canGenerate && (
                      <span className="absolute inset-0 animate-pulse-glow rounded-2xl pointer-events-none opacity-60" />
                    )}
                    <Sparkles className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Generate Try-On</span>
                  </button>
                </div>

                {!personPreview && (
                  <p className="text-center text-white/20 text-sm mt-4">
                    Upload your photo to get started
                  </p>
                )}
              </motion.div>
            )}

            {/* STAGE: processing */}
            {stage === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProcessingScreen onDone={() => setStage('result')} />
              </motion.div>
            )}

            {/* STAGE: result */}
            {stage === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TryOnViewer
                  personPreview={personPreview}
                  garmentPreview={garmentPreview}
                  onReset={handleReset}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
