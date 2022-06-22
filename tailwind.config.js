module.exports = {
  content: ["./src/**/*.{html,njk,js}"],
  safelist: [{ pattern: /bg-(.*)-200/ }],
  theme: {
    extend: {
      screens: {
        "md-960": "960px",
      },
      colors: {
        "inline-code-fg": "hsl(355, 65%, 65%)",
        "inline-code-bg": "hsla(220, 14%, 71%, 0.15)",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            code: {
              backgroundColor: theme("colors.inline-code-bg"),
              color: theme("colors.inline-code-fg"),
              fontWeight: "400",
              "border-radius": "0.25rem",
            },
            "code::before": {
              content: '""',
              "padding-left": "0.25rem",
            },
            "code::after": {
              content: '""',
              "padding-right": "0.25rem",
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
