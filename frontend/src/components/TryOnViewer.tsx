import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { TryOnResponse } from '../lib/api';

interface TryOnViewerProps {
  status: TryOnResponse;
}

export default function TryOnViewer({ status }: TryOnViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 text-center"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Try-On Result</h2>

      {(status.status === 'queued' || status.status === 'processing') && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-gray-600">
            {status.status === 'queued' ? 'Your job is queued…' : 'Generating your try-on image…'}
          </p>
          <p className="text-xs text-gray-400">Job ID: {status.job_id}</p>
        </div>
      )}

      {status.status === 'done' && status.result_url && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <img
            src={status.result_url}
            alt="Try-on result"
            className="max-w-sm w-full rounded-2xl shadow-lg"
          />
          <a
            href={status.result_url}
            download="tryon_result.png"
            className="inline-block mt-2 text-sm text-brand-600 underline hover:text-brand-800"
          >
            Download image
          </a>
        </div>
      )}

      {status.status === 'failed' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <XCircle className="w-10 h-10 text-red-400" />
          <p className="text-gray-600">Try-on generation failed. Please try again.</p>
        </div>
      )}
    </motion.div>
  );
}
