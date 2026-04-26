import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import StyleQuiz from '../components/StyleQuiz';

export default function QuizPage() {
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>Style Quiz | Smart-Robe</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4 py-16">
        <StyleQuiz onComplete={() => router.push('/wardrobe')} />
      </div>
    </Layout>
  );
}
