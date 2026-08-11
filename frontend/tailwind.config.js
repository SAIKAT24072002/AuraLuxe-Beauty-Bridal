/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#e9c7c0",
        rosewood: "#a65d63",
        plum: "#6d4151",
        cream: "#f8f1ea",
        porcelain: "#fffdf9",
        charcoal: "#2a2523",
        sand: "#d8c1ad",
        mocha: "#8b6c5c",
        almond: "#f1e2d5",
        sage: "#7f8d7a",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 45px rgba(166, 93, 99, 0.18)",
        panel: "0 24px 80px rgba(65, 37, 35, 0.08)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 20% 20%, rgba(233, 199, 192, 0.7), transparent 38%), radial-gradient(circle at 80% 10%, rgba(216, 193, 173, 0.45), transparent 30%), linear-gradient(135deg, #fffdf9 0%, #f7eee7 100%)",
      },
    },
  },
  plugins: [],
};
