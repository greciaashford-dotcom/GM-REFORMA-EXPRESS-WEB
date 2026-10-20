import { NextRequest, NextResponse } from "next/server";
import { confirmSubscription } from "@/lib/marketing/engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ success: false, error: "Token no proporcionado" }, { status: 400 });
  }

  try {
    const subscriber = await confirmSubscription(token);
    return NextResponse.json({
      success: true,
      message: "Suscripción confirmada con éxito",
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al confirmar suscripción" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ success: false, error: "Token no proporcionado" }, { status: 400 });
    }

    const subscriber = await confirmSubscription(token);
    return NextResponse.json({
      success: true,
      message: "Suscripción confirmada con éxito",
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al confirmar suscripción" },
      { status: 400 }
    );
  }
}
