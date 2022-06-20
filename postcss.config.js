module.exports = {
  plugins: [
    require("tailwindcss")("./tailwind.config.js"),
    require("autoprefixer")({ path: ["./themes/lessen"] }),
  ],
};
