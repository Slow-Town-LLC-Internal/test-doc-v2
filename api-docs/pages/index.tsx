import { Layout } from '@/components/Layout';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface ApiSource {
  id: string;
  name: string;
  specPath: string;
  version: string;
}

interface HomeProps {
  apis: ApiSource[];
}

export default function Home({ apis }: HomeProps) {
  return (
    <Layout title="API Documentation">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          API Documentation
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apis.map((api) => (
            <Link
              href={`/api-docs/${api.id}`}
              key={api.id}
              className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{api.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Version: {api.version}</p>
              <div className="mt-4 text-blue-600 dark:text-blue-400">View API Reference →</div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  // Read API sources from config file
  const configPath = path.join(process.cwd(), 'config', 'sources.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const { apis } = JSON.parse(configData);
  
  return {
    props: {
      apis,
    },
  };
}