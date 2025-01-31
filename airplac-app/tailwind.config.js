module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Incluye los archivos relevantes
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["pastel", "dark", "synthwave","acid","coffee","cyberpunk"],
  }, // Agrega DaisyUI como plugin
};
