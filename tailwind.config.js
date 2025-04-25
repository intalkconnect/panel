// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  safelist: [
    {
      pattern: /from-(.*)/,
    },
    {
      pattern: /via-(.*)/,
    },
    {
      pattern: /to-(.*)/,
    },
    {
      pattern: /text-(.*)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
