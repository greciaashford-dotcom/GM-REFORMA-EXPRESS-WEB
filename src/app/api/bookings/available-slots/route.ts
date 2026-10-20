import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking/engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const type = (searchParams.get("type") as "ORIENTATION_CALL" | "VALUATION_VISIT") || "VALUATION_VISIT";

    const slots = await getAvailableSlots(date, type);
    return NextResponse.json({ slots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al calcular disponibilidad" }, { status: 500 });
  }
}
