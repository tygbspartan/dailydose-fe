// Merged production server for cPanel: one Node process serves BOTH the
// Express backend (/api and /uploads) and the Next.js frontend (everything
// else). Requires:
//   - `next build` output (.next) in this project
//   - the compiled backend at ./backend/dist (with its own node_modules)
// Point cPanel's "Application startup file" at this file.
const { createServer } = require("http");
const next = require("next");

// Backend Express app + lifecycle (compiled TS, resolves its own node_modules)
const backendApp = require("./backend/dist/app").default;
const {
  initializeServices,
  shutdownServices,
} = require("./backend/dist/bootstrap");

const port = parseInt(process.env.PORT || "3000", 10);
const nextApp = next({ dev: false });
const handle = nextApp.getRequestHandler();

async function start() {
  try {
    // 1. Backend services first (DB, Redis, seed) — fail fast if DB is down
    await initializeServices();

    // 2. Next.js
    await nextApp.prepare();

    // 3. One HTTP server: /api and /uploads → Express, everything else → Next
    const server = createServer((req, res) => {
      if (req.url.startsWith("/api") || req.url.startsWith("/uploads")) {
        return backendApp(req, res);
      }
      return handle(req, res);
    });

    server.listen(port, () => {
      console.log("=================================");
      console.log(`🚀 Merged server running on port ${port}`);
      console.log(`   Frontend  →  /`);
      console.log(`   API       →  /api`);
      console.log(`   Uploads   →  /uploads`);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Failed to start merged server:", err);
    process.exit(1);
  }
}

start();

async function gracefulShutdown() {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    await shutdownServices();
  } catch {}
  process.exit(0);
}
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
