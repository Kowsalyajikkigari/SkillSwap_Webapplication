/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9b87f5',
          50: '#f5f3fe',
          100: '#ebe7fd',
          200: '#d7cefb',
          300: '#b8a7f8',
          400: '#9b87f5',
          500: '#8a74e8',
          600: '#7a5bd8',
          700: '#6a4bc2',
          800: '#5a3e9f',
          900: '#4a357f',
          950: '#2e2150',
        },
        secondary: {
          DEFAULT: '#4f46e5',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        background: '#ffffff',
        foreground: '#333333',
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#666666',
        },
        border: '#e5e5e5',
        'skill-teach': '#9b87f5',
        'skill-learn': '#4f46e5',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'skill-card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
