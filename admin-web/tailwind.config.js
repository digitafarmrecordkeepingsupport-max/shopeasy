/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6515D5',
          darkPurple: '#3B087D',
          sidebar: '#36066B',
          deep: '#2A055A',
          orange: '#FFB21A',
          orangeDark: '#E69E10',
          softBg: '#F7F5FC',
          cardBorder: '#EAE6F3',
          textDark: '#171428',
          textMuted: '#77738A',
        },
      },
    },
  },
  plugins: [],
};
