import type { Quote } from '@/app/(portfolio)/quotes/config';

/**
 * Dummy quotes data for testing the quotes page
 */
export const dummyQuotes: Quote[] = [
  {
    id: '1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    source: 'Stanford Commencement Speech',
    tags: ['motivation', 'work'],
  },
  {
    id: '2',
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    tags: ['innovation', 'leadership'],
  },
  {
    id: '3',
    text: 'Stay hungry. Stay foolish.',
    author: 'Steve Jobs',
    source: 'Stanford Commencement Speech',
    tags: ['motivation'],
  },
  {
    id: '4',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    tags: ['dreams', 'future'],
  },
  {
    id: '5',
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle',
    tags: ['resilience', 'philosophy'],
  },
];

