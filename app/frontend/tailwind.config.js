/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:   '#0066CC',
          'blue-dark': '#004C99',
          'blue-light': '#E6F0FA',
        },
        alert: {
          p1: '#EF4444',
          p2: '#F59E0B',
          p3: '#3B82F6',
          ok: '#10B981',
        }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { DEFAULT: '12px' }
    }
  },
  plugins: []
}
