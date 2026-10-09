/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffe",
          500: "#0070ba", // PayPal Blue
          600: "#005ea6",
          700: "#00457c",
          900: "#082f49",
        },
        accent: {
          500: "#00cf92", // Emerald Green
        },
      },
    },
  },
  plugins: [],
};
