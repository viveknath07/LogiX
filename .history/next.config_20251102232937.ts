// next.config.js
const path = require("path");

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  watchOptions: {
    ignored: ["**/node_modules", "**/.next", "**/dist"],
  },
};

module.exports = nextConfig;
