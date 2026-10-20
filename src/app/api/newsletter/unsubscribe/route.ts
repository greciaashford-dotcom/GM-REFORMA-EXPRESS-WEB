import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromNewsletter } from "@/lib/marketing/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token || body.email;

    if (!token) {
      return NextResponse.json({ success: false, error: "Identificador no proporcionado" }, { status: 400 });
    }

    const unsubscribed = await unsubscribeFromNewsletter(token, body.reason || "user_request");

    if (!unsubscribed) {
      return NextResponse.json({ success: false, error: "Suscripción no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Su baja ha sido tramitada correctamente. No recibirá más comunicaciones comerciales.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar la baja" },
      { status: 500 }
    );
  }
}
