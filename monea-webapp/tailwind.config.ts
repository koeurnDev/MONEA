import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		screens: {
			'xs': '480px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				sans: ["'Kantumruy Pro'", "sans-serif"],
				kantumruy: ["'Kantumruy Pro'", "sans-serif"],
				khmer: ["'Kantumruy Pro'", "sans-serif"],
				header: ["'Kantumruy Pro'", "sans-serif"],
				moul: ["'Kantumruy Pro'", "sans-serif"],
				siemreap: ["'Kantumruy Pro'", "sans-serif"],
				playfair: ["'Kantumruy Pro'", "sans-serif"],
				"great-vibes": ["'Kantumruy Pro'", "sans-serif"],
				greatvibes: ["'Kantumruy Pro'", "sans-serif"],
				handwriting: ["'Kantumruy Pro'", "sans-serif"],
				"noto-khmer": ["'Kantumruy Pro'", "sans-serif"],
				suwannaphum: ["'Kantumruy Pro'", "sans-serif"],
				toathmor2: ["'Kh Ang ToaThmor 2'", "sans-serif"],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			},
			transitionDuration: {
				'1500': '1500ms',
				'2000': '2000ms',
				'2500': '2500ms',
				'3000': '3000ms',
				'4000': '4000ms',
				'5000': '5000ms',
				'8000': '8000ms',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				/* Legacy colors mapped to minimalist variables */
				'wedding-bg': 'hsl(var(--background))',
				'wedding-gold': 'hsl(var(--primary))',
				'wedding-dark': 'hsl(var(--foreground))',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
