import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: true,
    headers: {
      "Access-Control-Allow-Private-Network": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Access-Control-Request-Private-Network",
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    {
      name: "private-network-access-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Access-Control-Request-Private-Network");
          if (req.headers["access-control-request-private-network"]) {
            res.setHeader("Access-Control-Allow-Private-Network", "true");
          }
          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            return res.end();
          }
          next();
        });
      },
    },
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
