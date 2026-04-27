import Head from 'next/head';
import Layout from '../components/Layout';
import VirtualTryOn from '../components/VirtualTryOn';

export default function VirtualTryOnPage() {
  return (
    <Layout>
      <Head>
        <title>Virtual Try-On Demo | Smart-Robe</title>
        <meta name="description" content="Experience the Smart-Robe AI virtual try-on demo" />
      </Head>
      <VirtualTryOn />
    </Layout>
  );
}
