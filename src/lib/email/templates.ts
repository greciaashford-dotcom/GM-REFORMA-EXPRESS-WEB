import { BRAND, Locale } from "../constants";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function getEmailHeaderHtml(title: string, subtitle: string = "Servicios profesionales de reformas en Madrid"): string {
  return `
    <div style="border-bottom: 2px solid #03203d; padding-bottom: 18px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="vertical-align: middle; text-align: left;">
            <a href="${BRAND.siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" height="46" style="max-height: 46px; width: auto; display: block; border: 0;" />
            </a>
          </td>
          <td style="vertical-align: middle; text-align: right;">
            <p style="margin: 0; font-size: 15px; font-weight: 800; color: #03203d; letter-spacing: 0.5px;">${BRAND.name}</p>
            <p style="margin: 3px 0 0 0; color: #64748b; font-size: 12px;">${subtitle}</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function getEmailFooterHtml(): string {
  return `
    <div style="margin-top: 36px; padding-top: 24px; border-top: 2px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 14px;">
            <a href="${BRAND.siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="160" style="display: block; max-height: 44px; width: auto; border: 0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; line-height: 1.6; color: #334155;">
            <strong style="color: #03203d; font-size: 14px;">${BRAND.name}</strong> · Titular: <strong>${BRAND.legalName}</strong> (NIF: ${BRAND.taxId})<br />
            Servicios Profesionales de Reformas Integrales, Baños y Cocinas en Madrid<br />
            📍 <strong>Domicilio Fiscal:</strong> ${BRAND.fiscalAddress}<br />
            📞 <strong>Teléfono / WhatsApp:</strong> <a href="${BRAND.phoneTel}" style="color: #c9932a; font-weight: 700; text-decoration: none;">${BRAND.phoneVisible}</a><br />
            ✉️ <strong>Correo electrónico:</strong> <a href="${BRAND.emailMailto}" style="color: #03203d; text-decoration: underline;">${BRAND.email}</a><br />
            🌐 <strong>Página web oficial:</strong> <a href="${BRAND.canonicalDomain}" style="color: #03203d; text-decoration: underline;">www.reformaexpress.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 16px; border-top: 1px dashed #cbd5e1; margin-top: 14px; font-size: 11px; line-height: 1.45; color: #94a3b8;">
            <p style="margin: 0 0 4px 0;"><strong>Aviso de Confidencialidad y Seguridad:</strong> Este mensaje puede contener información confidencial y va dirigido exclusivamente a su destinatario. Si lo ha recibido por error, le rogamos lo comunique de inmediato y elimine el mensaje.</p>
            <p style="margin: 0;">En cumplimiento del RGPD (Reglamento UE 2016/679) y la LOPD-GDD 3/2018, le informamos de que sus datos son tratados por ${BRAND.name} para la correcta gestión de presupuestos, citas técnicas y relación comercial. No solicitamos contraseñas ni transferencias bancarias por correo no verificado.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

const EMAIL_TEXT_FOOTER = `\n\n--\n${BRAND.name}\n${BRAND.area} · Tel: ${BRAND.phoneVisible}\nEmail: ${BRAND.email}\nWeb: ${BRAND.canonicalDomain}`;

export function getVerificationEmail(locale: Locale, name: string, verifyUrl: string): EmailContent {
  const subjects: Record<Locale, string> = {
    es: `Verificación de su cuenta en ${BRAND.name}`,
    fr: `Vérification de votre compte sur ${BRAND.name}`,
    en: `Verify your account on ${BRAND.name}`,
    de: `Bestätigen Sie Ihr Konto bei ${BRAND.name}`,
  };

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      ${getEmailHeaderHtml(BRAND.name, "Servicios profesionales de reformas en Madrid")}
      <p style="font-size: 16px;">Estimado/a ${name || "cliente"},</p>
      <p style="font-size: 16px; line-height: 1.5;">Gracias por registrarse en nuestra plataforma. Para completar la activación de su área privada de cliente, por favor verifique su dirección de correo electrónico:</p>
      <div style="margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #03203d; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Verificar mi cuenta</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">Si no ha solicitado esta cuenta, puede desestimar este mensaje. Este enlace expirará en 24 horas.</p>
      ${getEmailFooterHtml()}
    </div>
  `;

  const text = `Hola ${name},\n\nPara verificar su cuenta en ${BRAND.name}, acceda al siguiente enlace:\n${verifyUrl}\n\nSi no ha solicitado este registro, ignore este correo.${EMAIL_TEXT_FOOTER}`;

  return { subject: subjects[locale] || subjects.es, html, text };
}

export function getDoubleOptInEmail(locale: Locale, email: string, confirmUrl: string): EmailContent {
  const subjects: Record<Locale, string> = {
    es: `Confirme su suscripción a las novedades de ${BRAND.name}`,
    fr: `Confirmez votre abonnement aux actualités de ${BRAND.name}`,
    en: `Confirm your newsletter subscription to ${BRAND.name}`,
    de: `Bestätigen Sie Ihr Newsletter-Abonnement bei ${BRAND.name}`,
  };

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      ${getEmailHeaderHtml(BRAND.name, "Consejos técnicos y novedades de reformas en Madrid")}
      <p style="font-size: 16px;">Hemos recibido una solicitud para suscribir la dirección <strong>${email}</strong> a nuestro boletín periódico de reformas (hasta dos envíos semanales, martes y jueves).</p>
      <p style="font-size: 16px; line-height: 1.5;">Para confirmar que es el titular legítimo y autoriza el envío de estas comunicaciones comerciales, pulse el siguiente botón:</p>
      <div style="margin: 32px 0;">
        <a href="${confirmUrl}" style="background-color: #03203d; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Confirmar mi suscripción</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">Podrá darse de baja en cualquier momento con un solo clic al pie de cada correo promocional, sin necesidad de iniciar sesión.</p>
      ${getEmailFooterHtml()}
    </div>
  `;

  const text = `Confirme su suscripción a las novedades de ${BRAND.name} accediendo a este enlace:\n${confirmUrl}\n\nPuede darse de baja en cualquier momento.${EMAIL_TEXT_FOOTER}`;

  return { subject: subjects[locale] || subjects.es, html, text };
}

export function getBookingConfirmationEmail(booking: {
  bookingNumber: string;
  clientName: string;
  serviceTitle: string;
  startTime: Date;
  type: string;
  rescheduleUrl: string;
  cancelUrl: string;
  icsUrl: string;
}): EmailContent {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(booking.startTime));

  const typeLabel =
    booking.type === "VALUATION_VISIT"
      ? "Visita técnica de valoración (in situ)"
      : "Llamada de orientación técnica";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      ${getEmailHeaderHtml(BRAND.name, `Confirmación de cita — Ref: ${booking.bookingNumber}`)}
      <p style="font-size: 16px;">Estimado/a ${booking.clientName},</p>
      <p style="font-size: 16px; line-height: 1.5;">Su cita ha sido confirmada con éxito con los siguientes datos:</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Servicio:</strong> ${booking.serviceTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Modalidad:</strong> ${typeLabel}</p>
        <p style="margin: 0 0 8px 0;"><strong>Fecha y hora:</strong> ${formattedDate} (hora de Madrid)</p>
        <p style="margin: 0;"><strong>Número de reserva:</strong> ${booking.bookingNumber}</p>
      </div>
      <div style="margin: 24px 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${booking.icsUrl}" style="background-color: #03203d; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; display: inline-block;">Añadir al calendario (.ics)</a>
        <a href="${booking.rescheduleUrl}" style="background-color: #e2e8f0; color: #334155; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; display: inline-block;">Reprogramar cita</a>
        <a href="${booking.cancelUrl}" style="background-color: #fee2e2; color: #991b1b; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; display: inline-block;">Cancelar</a>
      </div>
      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Nota: Esta reserva corresponde a la toma de datos o llamada orientativa y no constituye por sí sola el inicio de obras ni sustituye el presupuesto o contrato formal.</p>
      ${getEmailFooterHtml()}
    </div>
  `;

  const text = `Cita confirmada en ${BRAND.name}:\nRef: ${booking.bookingNumber}\nServicio: ${booking.serviceTitle}\nFecha: ${formattedDate}\nReprogramar: ${booking.rescheduleUrl}\nCancelar: ${booking.cancelUrl}${EMAIL_TEXT_FOOTER}`;

  return { subject: `Cita confirmada: ${booking.serviceTitle} (${booking.bookingNumber})`, html, text };
}

export function getInvoiceDeliveryEmail(params: {
  fullNumber: string;
  totalCents: number;
  isTest: boolean;
  downloadUrl: string;
}): EmailContent {
  const totalFormatted = (params.totalCents / 100).toFixed(2);
  const subject = params.isTest
    ? `Documento de prueba / recibo: ${params.fullNumber} — ${BRAND.name}`
    : `Factura ${params.fullNumber} — ${BRAND.name}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      ${getEmailHeaderHtml(BRAND.name, "Entrega de documentación contable")}
      ${
        params.isTest
          ? `<div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; color: #92400e; font-weight: 600; margin-bottom: 20px;">
              DOCUMENTO EMITIDO EN ENTORNO DE PRUEBAS / NO VÁLIDO COMO FACTURA FISCAL
             </div>`
          : ""
      }
      <p style="font-size: 16px;">Adjuntamos el documento correspondiente a su abono por un importe total de <strong>${totalFormatted} €</strong> (Ref: <strong>${params.fullNumber}</strong>).</p>
      <div style="margin: 28px 0;">
        <a href="${params.downloadUrl}" style="background-color: #03203d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Descargar factura en PDF</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">También puede consultar el histórico completo de sus facturas y presupuestos en su área de cliente.</p>
      ${getEmailFooterHtml()}
    </div>
  `;

  const text = `Documento ${params.fullNumber} por importe de ${totalFormatted} €.\nPuede descargarlo en:\n${params.downloadUrl}${EMAIL_TEXT_FOOTER}`;

  return { subject, html, text };
}

export function doubleOptInTemplate(params: { confirmUrl: string; locale?: Locale; email?: string }): EmailContent {
  return getDoubleOptInEmail(params.locale || "es", params.email || "", params.confirmUrl);
}

export function bookingConfirmationTemplate(params: {
  bookingNumber: string;
  clientName: string;
  serviceTitle: string;
  type: "ORIENTATION_CALL" | "VALUATION_VISIT";
  startTime: Date;
  address?: string | null;
  rescheduleToken: string;
  cancelToken: string;
  locale?: Locale;
}): EmailContent {
  return getBookingConfirmationEmail({
    bookingNumber: params.bookingNumber,
    clientName: params.clientName,
    serviceTitle: params.serviceTitle,
    startTime: params.startTime,
    type: params.type,
    rescheduleUrl: `${BRAND.siteUrl}/${params.locale || "es"}/reservar/reprogramar/${params.rescheduleToken}`,
    cancelUrl: `${BRAND.siteUrl}/${params.locale || "es"}/reservar/cancelar/${params.cancelToken}`,
    icsUrl: `${BRAND.siteUrl}/api/bookings/ics?bookingNumber=${params.bookingNumber}`,
  });
}
