import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/components/ThemeProvider';
import '@/styles/globals.css';
import '@/styles/stoplight-fixes.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}