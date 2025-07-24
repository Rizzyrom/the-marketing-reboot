/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-tertiary': 'var(--brand-tertiary)',
        'electric-lime': 'var(--electric-lime)',
        'brand-blue-deep': 'var(--brand-blue-deep)',
        'brand-blue': 'var(--brand-blue)',
        'brand-blue-light': 'var(--brand-blue-light)',
        'brand-green': 'var(--brand-green)',
        'brand-green-light': 'var(--brand-green-light)',
        'brand-forest': 'var(--brand-forest)',
        'brand-purple': 'var(--brand-purple)',
        'brand-purple-light': 'var(--brand-purple-light)',
        'brand-purple-vivid': 'var(--brand-purple-vivid)',
        'brand-gray': {
          50: 'var(--brand-gray-50)',
          100: 'var(--brand-gray-100)',
          200: 'var(--brand-gray-200)',
          300: 'var(--brand-gray-300)',
          400: 'var(--brand-gray-400)',
          500: 'var(--brand-gray-500)',
          600: 'var(--brand-gray-600)',
          700: 'var(--brand-gray-700)',
          800: 'var(--brand-gray-800)',
          900: 'var(--brand-gray-900)',
        },
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'electric-pulse': {
          '0%, 100%': { 
            opacity: '0.1',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.3',
            transform: 'scale(1.05)'
          },
        },
        'gradient-shift-1': {
          '0%, 100%': { stopColor: '#3B82F6' },
          '33%': { stopColor: '#10B981' },
          '66%': { stopColor: '#8B5CF6' },
        },
        'gradient-shift-2': {
          '0%, 100%': { stopColor: '#8B5CF6' },
          '33%': { stopColor: '#3B82F6' },
          '66%': { stopColor: '#10B981' },
        },
        'gradient-shift-3': {
          '0%, 100%': { stopColor: '#10B981' },
          '33%': { stopColor: '#8B5CF6' },
          '66%': { stopColor: '#3B82F6' },
        },
        'lightning-flash': {
          '0%, 100%': { 
            opacity: '0',
            transform: 'translateY(-100%)'
          },
          '50%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
      animation: {
        'electric-pulse': 'electric-pulse 3s ease-in-out infinite',
        'gradient-shift-1': 'gradient-shift-1 5s ease-in-out infinite',
        'gradient-shift-2': 'gradient-shift-2 5s ease-in-out infinite',
        'gradient-shift-3': 'gradient-shift-3 5s ease-in-out infinite',
        'lightning-flash': 'lightning-flash 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};