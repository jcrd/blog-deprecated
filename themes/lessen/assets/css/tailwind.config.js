module.exports = {
  purge: {
    enabled: process.env.HUGO_ENVIRONMENT === "production",
    mode: "all",
    content: ["./hugo_stats.json", "./layouts/**/*.html"],
    options: {
      safelist: [/bg-(.*)-200/, "chroma"],
    },
    extractors: [
      {
        extractor: (content) => {
          const els = JSON.parse(content).htmlElements;
          return els.tags.concat(els.classes, els.ids);
        },
        extensions: ["json"],
      },
    ],
  },
  theme: {
    extend: {
      screens: {
        "md-960": "960px",
      },
      colors: {
        gray: {
          100: "#F5F7FA",
          1000: "#1F2933",
        },
        red: {
          100: "#BA2121",
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            pre: {
              color: theme("colors.gray.1000"),
              backgroundColor: theme("colors.gray.100"),
            },
            "pre code::before": {
              "padding-left": "unset",
            },
            "pre code::after": {
              "padding-right": "unset",
            },
            code: {
              backgroundColor: theme("colors.gray.100"),
              color: theme("colors.red.100"),
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
