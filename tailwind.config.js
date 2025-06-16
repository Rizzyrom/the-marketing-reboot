/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'midnight': '#0a0a0f',
        'dark-matter': '#0f0f1a',
        'void-black': '#050510',
        'cosmic-dust': '#1a1a2e',
        'neon-purple': '#a855f7',
        'electric-blue': '#3b82f6',
        'cyber-lime': '#84cc16',
        'hot-pink': '#ec4899',
        'quantum-teal': '#14b8a6',
        'glass-white': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#ffffff',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'space': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}