/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',    // Indigo
          secondary: '#7C3AED',  // Violet
          accent: '#38BDF8',     // Sky Blue
          bg: '#F8FAFC',         // Cool Off-White
          text: '#172033',       // Deep Slate
          white: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          light: '#F5F3FF',
        },
        accent: {
          DEFAULT: '#38BDF8',
          hover: '#0EA5E9',
          light: '#F0F9FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
