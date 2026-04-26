import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserProfile } from '../lib/api';

interface StyleQuizProps {
  onComplete: () => void;
}

interface Question {
  id: string;
  text: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 'style_vibe',
    text: 'Which best describes your everyday style vibe?',
    options: ['Casual & Comfy', 'Smart Casual', 'Minimalist', 'Bold & Trendy', 'Classic & Timeless'],
  },
  {
    id: 'color_palette',
    text: 'What colour palette do you gravitate towards?',
    options: ['Neutrals (black, white, beige)', 'Earth tones', 'Pastels', 'Bright & vivid', 'Dark & moody'],
  },
  {
    id: 'fit_preference',
    text: 'What fit do you prefer?',
    options: ['Slim / Fitted', 'Regular', 'Relaxed / Oversized', 'Tailored', 'Varies by piece'],
  },
  {
    id: 'main_occasion',
    text: 'What is your primary dressing occasion?',
    options: ['Work / Office', 'Weekend outings', 'Special events', 'Active / Sport', 'Mixed'],
  },
  {
    id: 'inspiration',
    text: 'Who or what inspires your style?',
    options: ['Street style', 'Celebrities', 'Runways', 'Social media', 'My own intuition'],
  },
];

// TODO: replace with real auth session
const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function StyleQuiz({ onComplete }: StyleQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleNext = async () => {
    if (!answers[question.id]) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    // Submit
    setSubmitting(true);
    setError(null);
    try {
      await updateUserProfile(PLACEHOLDER_USER_ID, {
        style_answers: answers,
        occasion_prefs: [answers['main_occasion'] ?? 'mixed'],
      });
      onComplete();
    } catch {
      setError('Failed to save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-lg">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-brand-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          <p className="text-xs text-brand-600 font-semibold uppercase tracking-widest mb-2">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.text}</h2>

          <div className="space-y-3 mb-8">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  answers[question.id] === opt
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 hover:border-brand-300 text-gray-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleNext}
            disabled={!answers[question.id] || submitting}
            className="w-full rounded-xl bg-brand-600 py-3 text-white font-semibold disabled:opacity-50 hover:bg-brand-700 transition-colors"
          >
            {submitting ? 'Saving…' : isLast ? 'Finish Quiz' : 'Next →'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
