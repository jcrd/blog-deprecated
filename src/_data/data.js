module.exports = {
  baseURL:
    process.env.ELEVENTY_ENV === "production"
      ? "https://twiddlingbits.net/"
      : "http://localhost:8080",
  year: new Date().getFullYear(),
};
