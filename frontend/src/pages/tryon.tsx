import Head from 'next/head';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import TryOnViewer from '../components/TryOnViewer';
import { startTryOn, getTryOnStatus, TryOnResponse } from '../lib/api';

// TODO: replace with real auth + outfit selection
const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000001';
const PLACEHOLDER_OUTFIT_ID = 'outfit-0-demo';

export default function TryOnPage() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<TryOnResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setJobStatus(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const handleStartTryOn = async () => {
    if (!photoFile) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const photoUrl = photoPreview!;
      const res = await startTryOn(PLACEHOLDER_USER_ID, PLACEHOLDER_OUTFIT_ID, photoUrl);
      setJobStatus(res);
    } catch {
      setError('Failed to start try-on job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for job completion
  useEffect(() => {
    if (!jobStatus || jobStatus.status === 'done' || jobStatus.status === 'failed') return;
    const timer = setInterval(async () => {
      try {
        const updated = await getTryOnStatus(jobStatus.job_id);
        setJobStatus(updated);
        if (updated.status === 'done' || updated.status === 'failed') {
          clearInterval(timer);
        }
      } catch {
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [jobStatus]);

  return (
    <Layout>
      <Head>
        <title>Virtual Try-On | Smart-Robe</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Try-On</h1>
          <p className="text-gray-600 mb-8">Upload your photo and see the outfit on you.</p>

          {/* Upload zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {isDragActive ? 'Drop your photo here' : 'Drag & drop your full-body photo, or click to browse'}
            </p>
          </div>

          {/* Preview + CTA */}
          {photoPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center gap-6"
            >
              <img
                src={photoPreview}
                alt="Your photo"
                className="w-48 h-64 object-cover rounded-2xl shadow"
              />
              <button
                onClick={handleStartTryOn}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 text-white font-semibold shadow hover:bg-brand-700 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Starting…
                  </>
                ) : (
                  <>Try On Outfit</>
                )}
              </button>
            </motion.div>
          )}

          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

          {/* Try-on result viewer */}
          {jobStatus && <TryOnViewer status={jobStatus} />}
        </div>
      </div>
    </Layout>
  );
}
