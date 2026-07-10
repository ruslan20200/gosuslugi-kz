import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(
    "/assets",
    express.static(path.join(staticPath, "assets"), {
      immutable: true,
      maxAge: "1y",
    })
  );

  app.use(
    express.static(staticPath, {
      maxAge: "7d",
      setHeaders: (res, filePath) => {
        if (
          filePath.endsWith("index.html") ||
          filePath.endsWith("manifest.webmanifest") ||
          filePath.endsWith("sw.js") ||
          filePath.endsWith("registerSW.js")
        ) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    })
  );

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
