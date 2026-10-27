/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#059669', light: '#D1FAE5', bright: '#10B981', dark: '#047857' },
        success: '#16A34A', warning: '#D97706', danger: '#DC2626', info: '#2563EB',
        slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 900: '#0F172A' }
      },
      fontFamily: { sans: ['Inter', 'Geist Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 2px 10px rgba(15, 23, 42, .04)' },
      transitionTimingFunction: { 'page': 'cubic-bezier(.2,.8,.2,1)' }
    }
  },
  plugins: []
}