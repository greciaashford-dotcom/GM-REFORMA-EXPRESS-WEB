import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const quotes = await db.quote.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: { lines: true },
        },
        payments: {
          where: { status: "SUCCEEDED" },
        },
      },
    });

    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: "Error al recuperar presupuestos" }, { status: 500 });
  }
}
