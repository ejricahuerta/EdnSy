module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'hero': '3rem', // 48px
        'section': '2rem', // 32px
      },
      colors: {
        primary: '#22223b',
      },
    },
  },
  plugins: [],
} 