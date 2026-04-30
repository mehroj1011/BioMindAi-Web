/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bm: {
          bg: '#070A12',
          panel: 'rgba(255,255,255,0.08)',
          panel2: 'rgba(255,255,255,0.12)',
          border: 'rgba(255,255,255,0.14)',
          text: '#E9F2FF',
          muted: 'rgba(233,242,255,0.72)',
          emerald: '#00C853',
          cyan: '#34D9FF',
          purple: '#A78BFA',
          amber: '#FFB74D',
        },
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0,0,0,0.45)',
      },
      backdropBlur: {
        glass: '18px',
      },
    },
  },
  plugins: [],
}

