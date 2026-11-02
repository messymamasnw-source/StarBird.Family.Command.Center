module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F4EE',
        cream: '#F2E8D8',
        espresso: '#2A1F1D',
        charcoal: '#1F2A2E',
        sage: '#A9B8A4',
        gold: '#C8A96A',
        blush: '#EFE2DA',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(42, 31, 29, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
