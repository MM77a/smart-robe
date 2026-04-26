import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Shirt } from 'lucide-react';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Smart-Robe | AI-Powered Personal Stylist</title>
        <meta name="description" content="Your AI-powered personal stylist" />
      </Head>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Sparkles className="w-4 h-4" />
              Powered by CLIP + Stable Diffusion
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Your{' '}
            <span className="text-brand-600">AI-Powered</span>
            <br />
            Personal Stylist
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Upload your wardrobe, discover your style, and try on outfits virtually —
            all powered by state-of-the-art machine learning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 text-white font-semibold text-lg shadow-lg hover:bg-brand-700 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Take Style Quiz
            </Link>
            <Link
              href="/wardrobe"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-600 px-8 py-3 text-brand-700 font-semibold text-lg hover:bg-brand-50 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Wardrobe
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8 text-brand-600" />,
                title: 'Take the Style Quiz',
                desc: 'Answer 5 quick questions to build your personal style profile.',
              },
              {
                icon: <Upload className="w-8 h-8 text-brand-600" />,
                title: 'Upload Your Wardrobe',
                desc: 'Drag & drop your clothes. CLIP embeds each item automatically.',
              },
              {
                icon: <Shirt className="w-8 h-8 text-brand-600" />,
                title: 'Virtual Try-On',
                desc: 'See outfits on your own photo using Stable Diffusion.',
              },
            ].map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
