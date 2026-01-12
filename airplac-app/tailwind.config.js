module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Incluye los archivos relevantes
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["pastel", "dark", "synthwave","luxury","coffee","cyberpunk","corporate","bumblebee"],
  }, // Agrega DaisyUI como plugin
};
