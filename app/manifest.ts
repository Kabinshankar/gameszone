import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GamesZone — Free Online Browser Games',
    short_name: 'GamesZone',
    description: 'Play 20+ free online classic, arcade, puzzle, and card games in your browser. No download required.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06060c',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
