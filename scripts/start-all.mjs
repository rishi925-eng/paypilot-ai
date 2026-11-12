import { spawn, execSync } from "node:child_process";

const apiPort = process.env.API_PORT || 5000;
// Render provides $PORT for public web traffic (usually 10000 or assigned port)
const webPort = process.env.PORT || 3000;

console.log("=================================================");
console.log("🚀 Launching PayPilot AI Monorepo Production Hub");
console.log(`📡 Backend API target port: ${apiPort}`);
console.log(`🌐 Frontend Web public port: ${webPort}`);
console.log("=================================================");

// Initialize database schema and seeds if needed
try {
  console.log("📦 Checking & syncing database schema...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  console.log("🌱 Ensuring seeded catalogue exists...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} catch (dbErr) {
  console.warn("Database sync note:", dbErr.message);
}

const apiProcess = spawn("npm", ["run", "start", "--prefix", "apps/api"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: String(apiPort),
  },
});

const webProcess = spawn("npm", ["run", "start", "--prefix", "apps/web"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: String(webPort),
    API_INTERNAL_URL: `http://127.0.0.1:${apiPort}`,
  },
});

apiProcess.on("error", (err) => {
  console.error("API process encountered error:", err);
});

webProcess.on("error", (err) => {
  console.error("Web process encountered error:", err);
});

function cleanup() {
  console.log("Shutting down PayPilot processes...");
  try { apiProcess.kill(); } catch {}
  try { webProcess.kill(); } catch {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
