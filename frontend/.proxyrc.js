module.exports = {
  "/api": {
    target: "http://localhost:8080",
    pathRewrite: { "^/api": "/api" },
    changeOrigin: true
  },
  "/api/*": {
    target: "http://localhost:8080",
    changeOrigin: true
  },
  "/auth/*": {
    target: "http://localhost:8080",
    changeOrigin: true
  }
}; 