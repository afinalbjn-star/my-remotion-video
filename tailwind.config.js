module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deepVoid: '#0a0a2a', // deep dark space
        nebulaCore: '#1a0d3a', // deep purple
        auroraTeal: '#00c5c5',
        pinkNebula: '#ff6eb4',
        starWarm: '#ffcc66',
        starCold: '#99ccff',
      },
      animation: {
        'bg-shift': 'bgShift 10s linear infinite',
      },
      keyframes: {
        bgShift: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
    },
  },
  plugins: [],
};
