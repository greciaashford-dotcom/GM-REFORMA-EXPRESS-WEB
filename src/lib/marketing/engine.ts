import db from "../db";
import { sendEmail } from "../email/sender";
import { BRAND, Locale } from "../constants";

export async function subscribeToNewsletter(params: {
  email: string;
  name?: string;
  locale?: string;
  interests?: string[];
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const cleanEmail = params.email.trim().toLowerCase();

  // Check if email is in suppression list
  const suppressed = await db.suppression.findUnique({
    where: { email: cleanEmail },
  });
  if (suppressed) {
    throw new Error("Esta dirección de correo ha solicitado no recibir comunicaciones comerciales.");
  }

  // Find or create subscriber
  let subscriber = await db.subscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (subscriber && subscriber.status === "CONFIRMED") {
    return { status: "ALREADY_CONFIRMED", subscriber };
  }

  if (!subscriber) {
    subscriber = await db.subscriber.create({
      data: {
        email: cleanEmail,
        name: params.name,
        locale: params.locale || "es",
        interests: params.interests ? JSON.stringify(params.interests) : null,
        source: params.source || "web_footer",
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  // Create consent record
  await db.consentRecord.create({
    data: {
      subject: cleanEmail,
      purpose: "marketing_newsletter",
      granted: true,
      locale: params.locale || "es",
      version: "1.0",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });

  // Create Outbox event for double opt-in verification email
  const confirmUrl = `${BRAND.siteUrl}/${params.locale || "es"}/newsletter/confirmar?token=${subscriber.doubleOptInToken}`;

  await db.outboxEvent.create({
    data: {
      eventType: "DOUBLE_OPTIN_SEND",
      payload: JSON.stringify({
        subscriberId: subscriber.id,
        email: subscriber.email,
        locale: subscriber.locale,
        confirmUrl,
      }),
    },
  });

  return { status: "PENDING_CONFIRMATION", subscriber };
}

export const subscribeNewsletter = subscribeToNewsletter;


export async function confirmSubscription(token: string) {
  const subscriber = await db.subscriber.findUnique({
    where: { doubleOptInToken: token },
  });

  if (!subscriber) {
    throw new Error("El token de confirmación de suscripción no es válido o ha expirado.");
  }

  const updated = await db.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    },
  });

  return updated;
}

export async function unsubscribeFromNewsletter(tokenOrEmail: string, reason = "user_unsubscribed") {
  const subscriber = await db.subscriber.findFirst({
    where: {
      OR: [
        { doubleOptInToken: tokenOrEmail },
        { email: tokenOrEmail.trim().toLowerCase() },
      ],
    },
  });

  if (!subscriber) {
    return false;
  }

  await db.$transaction([
    db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    }),
    db.suppression.upsert({
      where: { email: subscriber.email },
      create: {
        email: subscriber.email,
        reason,
      },
      update: {
        reason,
      },
    }),
  ]);

  return true;
}

export async function executeScheduledPromotionalCampaign(campaignId: string) {
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      translations: true,
    },
  });

  if (!campaign || campaign.status !== "SCHEDULED") {
    return { success: false, reason: "Campaña no encontrada o no está en estado SCHEDULED" };
  }

  // Fetch confirmed subscribers who have not reached the 2 promos/week limit
  const eligibleSubscribers = await db.subscriber.findMany({
    where: {
      status: "CONFIRMED",
      weeklyPromosReceivedThisWeek: { lt: 2 },
    },
  });

  let sentCount = 0;

  for (const sub of eligibleSubscribers) {
    // Re-verify against suppression list in real time
    const isSuppressed = await db.suppression.findUnique({
      where: { email: sub.email },
    });
    if (isSuppressed) continue;

    // Find translation for subscriber's locale (or fallback to 'es')
    const translation =
      campaign.translations.find((t) => t.locale === sub.locale) ||
      campaign.translations.find((t) => t.locale === "es");

    if (!translation) continue;

    const unsubscribeUrl = `${BRAND.siteUrl}/${sub.locale}/newsletter/baja?token=${sub.doubleOptInToken}`;

    const bodyWithUnsubscribe = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f4c5c; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0f4c5c; margin: 0; font-size: 20px;">${BRAND.name}</h2>
        </div>
        ${translation.imageUrl ? `<img src="${translation.imageUrl}" alt="${translation.imageAlt || ''}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />` : ''}
        <h1 style="font-size: 22px; color: #0f172a; line-height: 1.3;">${translation.headline}</h1>
        <div style="font-size: 16px; line-height: 1.6; color: #334155;">
          ${translation.bodyContent}
        </div>
        <div style="margin: 32px 0;">
          <a href="${translation.ctaUrl}" style="background-color: #0f4c5c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">${translation.ctaText}</a>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p>Recibe esta comunicación informativa porque se suscribió a las novedades de ${BRAND.name}.</p>
          <p><a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Darse de baja</a> de estas comunicaciones promocionales de forma inmediata.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: sub.email,
      subject: translation.subject,
      html: bodyWithUnsubscribe,
    });

    // Record delivery & update weekly counter
    await db.campaignDelivery.upsert({
      where: {
        campaignId_subscriberId: {
          campaignId: campaign.id,
          subscriberId: sub.id,
        },
      },
      create: {
        campaignId: campaign.id,
        subscriberId: sub.id,
        status: "sent",
      },
      update: {
        deliveredAt: new Date(),
      },
    });

    await db.subscriber.update({
      where: { id: sub.id },
      data: {
        weeklyPromosReceivedThisWeek: { increment: 1 },
        lastPromoSentAt: new Date(),
      },
    });

    sentCount++;
  }

  await db.campaign.update({
    where: { id: campaign.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });

  return { success: true, sentCount };
}
