import Head from 'next/head';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import OutfitCard from '../components/OutfitCard';
import { getRecommendations, OutfitRecommendation } from '../lib/api';

const OCCASIONS = ['casual', 'formal', 'business casual', 'sport', 'evening'];
const WEATHERS = ['sunny', 'cloudy', 'rainy', 'cold', 'hot'];

// TODO: replace with real auth session
const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function OutfitsPage() {
  const [occasion, setOccasion] = useState('casual');
  const [weather, setWeather] = useState('sunny');

  const { data: outfits, isLoading, isError, refetch } = useQuery<OutfitRecommendation[]>({
    queryKey: ['recommendations', occasion, weather],
    queryFn: () => getRecommendations(PLACEHOLDER_USER_ID, occasion, weather),
    enabled: true,
  });

  return (
    <Layout>
      <Head>
        <title>Outfit Recommendations | Smart-Robe</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Outfits</h1>
          <p className="text-gray-600 mb-8">Personalised picks based on your style profile.</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {WEATHERS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results carousel */}
          {isLoading && (
            <p className="text-gray-500 text-center py-12">Loading recommendations…</p>
          )}
          {isError && (
            <p className="text-red-500 text-center py-12">
              Failed to load recommendations. Make sure the backend is running.
            </p>
          )}
          {outfits && outfits.length === 0 && (
            <p className="text-gray-500 text-center py-12">
              No outfits found. Upload some wardrobe items first.
            </p>
          )}
          {outfits && outfits.length > 0 && (
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              <AnimatePresence>
                {outfits.map((outfit, i) => (
                  <motion.div
                    key={outfit.outfit_id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="snap-start flex-shrink-0"
                  >
                    <OutfitCard outfit={outfit} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
