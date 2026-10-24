import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let dbStatus: "healthy" | "degraded" | "offline" = "offline";
  let dbLatencyMs = 0;

  try {
    await db.siteSettings.findUnique({ where: { id: "default" }, select: { id: true } });
    dbLatencyMs = Date.now() - start;
    dbStatus = dbLatencyMs < 500 ? "healthy" : "degraded";
  } catch (error) {
    dbLatencyMs = Date.now() - start;
    dbStatus = "offline";
  }

  return NextResponse.json(
    {
      status: dbStatus === "offline" ? "degraded" : "ok",
      service: "GM REFORMA EXPRESS API",
      timestamp: new Date().toISOString(),
      timezone: "Europe/Madrid",
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      integrations: {
        stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
        emailConfigured: Boolean(process.env.RESEND_API_KEY),
      },
    },
    { status: 200 }
  );
}
