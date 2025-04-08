/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        },
        colors: {
          emotion: {
            angry: {
              light: '#fecaca',
              DEFAULT: '#ef4444', 
              dark: '#b91c1c'
            },
            disgust: {
              light: '#e9d5ff',
              DEFAULT: '#a855f7',
              dark: '#7e22ce'
            },
            fear: {
              light: '#fef3c7',
              DEFAULT: '#f59e0b',
              dark: '#b45309'
            },
            happy: {
              light: '#bbf7d0',
              DEFAULT: '#22c55e',
              dark: '#15803d'
            },
            sad: {
              light: '#bfdbfe',
              DEFAULT: '#3b82f6',
              dark: '#1d4ed8'
            },
            surprise: {
              light: '#fbcfe8',
              DEFAULT: '#ec4899',
              dark: '#be185d'
            },
            neutral: {
              light: '#e2e8f0',
              DEFAULT: '#64748b',
              dark: '#334155'
            }
          }
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        boxShadow: {
          'emotion': '0 4px 14px 0 rgba(var(--emotion-shadow-color), 0.3)',
        },
      },
    },
    plugins: [],
  }