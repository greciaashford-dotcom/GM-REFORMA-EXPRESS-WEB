import { Resend } from "resend";
import { BRAND } from "../constants";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  isMock: boolean;
  error?: string;
}> {
  const from = options.from || `${BRAND.name} <${process.env.RESEND_FROM_EMAIL || BRAND.email}>`;
  const replyTo = options.replyTo || BRAND.email;

  if (!resend || !resendApiKey || resendApiKey.includes("placeholder")) {
    console.info(`[EMAIL TEST-ADAPTER] Simulación de envío a: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
    console.info(`[EMAIL TEST-ADAPTER] Asunto: ${options.subject}`);

    return {
      success: true,
      messageId: `mock_email_${Date.now()}`,
      isMock: true,
    };
  }

  try {
    const data = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo,
    });

    if (data.error) {
      console.error("[RESEND ERROR]", data.error);
      return { success: false, error: data.error.message, isMock: false };
    }

    return { success: true, messageId: data.data?.id, isMock: false };
  } catch (err: any) {
    console.error("[EMAIL EXCEPTION]", err);
    return { success: false, error: err.message || "Error al enviar correo", isMock: false };
  }
}
