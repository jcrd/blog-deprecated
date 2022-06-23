module.exports = {
  content: ["./src/**/*.{html,njk,js}"],
  safelist: [{ pattern: /bg-(.*)-200/ }],
  theme: {
    extend: {
      screens: {
        "md-960": "960px",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            code: {
              color: "hsl(5, 48%, 51%)",
              fontWeight: "bold",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
