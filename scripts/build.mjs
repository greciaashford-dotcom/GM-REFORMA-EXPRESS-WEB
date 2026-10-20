import { execSync } from "node:child_process";

console.log("Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (err) {
  console.warn("Notice: Prisma generate skipped due to file lock (using existing generated client).");
}

console.log("Building Next.js application...");
execSync("npx next build", { stdio: "inherit" });
