import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { executeScheduledPromotionalCampaign } from "@/lib/marketing/engine";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "gm-cron-secret-2026";

    // Verify secret if provided in environment
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");

    // Fetch site settings to check if marketing automations are enabled
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings?.marketingAutomationsEnabled) {
      return NextResponse.json({
        success: false,
        message: "Las automatizaciones de marketing se encuentran desactivadas en la configuración general del sistema.",
      });
    }

    if (campaignId) {
      const result = await executeScheduledPromotionalCampaign(campaignId);
      return NextResponse.json({ success: true, result });
    }

    // Find campaigns scheduled for today or pending
    const now = new Date();
    const campaigns = await db.campaign.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: { lte: now },
      },
    });

    const results = [];
    for (const c of campaigns) {
      const res = await executeScheduledPromotionalCampaign(c.id);
      results.push({ campaignId: c.id, ...res });
    }

    return NextResponse.json({
      success: true,
      processed: campaigns.length,
      results,
    });
  } catch (error: any) {
    console.error("[Cron Campaigns Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al ejecutar campañas" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
