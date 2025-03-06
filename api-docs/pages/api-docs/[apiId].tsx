import { ApiViewer } from '@/components/ApiViewer';
import { Layout } from '@/components/Layout';
import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';

interface ApiSource {
  id: string;
  name: string;
  specPath: string;
  version: string;
}

interface ApiDocsProps {
  api: ApiSource;
}

export default function ApiDocs({ api }: ApiDocsProps) {
  return (
    <Layout title={`${api.name} | API Documentation`}>
      <div className="h-full">
        <ApiViewer specUrl={api.specPath} />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Read API sources from config file
  const configPath = path.join(process.cwd(), 'config', 'sources.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const { apis } = JSON.parse(configData);

  // Generate paths for each API
  const paths = apis.map((api: ApiSource) => ({
    params: { apiId: api.id },
  }));

  return {
    paths,
    fallback: false, // Return 404 if path not found
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apiId = params?.apiId as string;

  // Read API sources from config file
  const configPath = path.join(process.cwd(), 'config', 'sources.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const { apis } = JSON.parse(configData);

  // Find the API with the matching ID
  const api = apis.find((api: ApiSource) => api.id === apiId);

  if (!api) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      api,
    },
  };
};