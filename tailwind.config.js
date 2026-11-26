/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul marino: estructura (barra lateral, títulos, series de datos)
        primary: {
          50:  '#eef3fa',
          100: '#d5e2f4',
          200: '#aac5e9',
          300: '#7fa8de',
          400: '#558bd3',
          500: '#3a69aa',
          600: '#2d5288',
          700: '#213d66',
          800: '#1b3152',
          900: '#13233b',
          950: '#0c1626',
          DEFAULT: '#3a69aa',
        },
        // Ámbar SOY: acción principal y selección
        secondary: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
}
