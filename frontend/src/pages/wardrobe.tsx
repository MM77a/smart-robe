import Head from 'next/head';
import Layout from '../components/Layout';
import WardrobeUpload from '../components/WardrobeUpload';

export default function WardrobePage() {
  return (
    <Layout>
      <Head>
        <title>My Wardrobe | Smart-Robe</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wardrobe</h1>
          <p className="text-gray-600 mb-8">
            Upload your clothing items. We&apos;ll segment and embed each piece automatically.
          </p>
          <WardrobeUpload />
        </div>
      </div>
    </Layout>
  );
}
