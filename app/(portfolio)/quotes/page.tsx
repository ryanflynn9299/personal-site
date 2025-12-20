import type { Metadata } from 'next';
import { QuotesPageClient } from '@/components/quotes/QuotesPageClient';

export const metadata: Metadata = {
  title: 'Quotes',
  description: 'Inspiring quotes and thoughts',
};

export default function QuotesPage() {
  return <QuotesPageClient />;
}

