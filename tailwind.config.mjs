/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        awsOrange: "#FF9900",
        awsBlack: "#131A22",
        awsGray: "#232F3E"
      },
      boxShadow: {
        glow: "0 0 45px rgba(255,153,0,0.35)"
      }
    }
  },
  plugins: []
};

