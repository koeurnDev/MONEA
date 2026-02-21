import { Inter, Kantumruy_Pro, Moul } from 'next/font/google';

export const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const kantumruyPro = Kantumruy_Pro({
    weight: ['100', '200', '300', '400', '500', '600', '700'],
    subsets: ['khmer'],
    display: 'swap',
    variable: '--font-khmer',
});

export const moul = Moul({
    weight: '400',
    subsets: ['khmer'],
    display: 'swap',
    variable: '--font-moul',
});
