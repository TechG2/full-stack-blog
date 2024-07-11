/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      transformOrigin: {
        "ham-line-0": "0% 0%",
        "ham-line-100": "10% 100%",
      },
      boxShadow: {
        "custom-avatar": "1px 1px 15px -5px black",
      },
      fontFamily: {
        "font-awesome": "Font Awesome 5 Free",
      },
    },
  },
  plugins: [],
};
