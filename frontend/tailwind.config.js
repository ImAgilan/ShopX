/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#FF6A00',
        'primary-hover': '#E65C00',
        'orange-light':  '#FFF4EC',
        'orange-subtle': '#FFE5D0',
        'orange-div':    '#FFD2B3',
        'text-dark':     '#1F2937',
        'text-muted':    '#6B7280',
        'section-bg':    '#F8FAFC',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '8px', lg: '12px', xl: '16px', '2xl': '20px' },
      boxShadow: {
        orange: '0 4px 14px rgba(255,106,0,0.25)',
        'orange-lg': '0 8px 24px rgba(255,106,0,0.3)',
      },
    },
  },
  plugins: [],
}
