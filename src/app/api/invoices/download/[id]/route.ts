import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/pricing/agreed-amount";
import { BRAND } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse("Acceso no autorizado", { status: 401 });
    }

    const { id } = params;

    const invoice = await db.invoice.findFirst({
      where: {
        OR: [{ id }, { fullNumber: id }],
      },
      include: {
        lines: true,
        customer: true,
      },
    });

    if (!invoice) {
      return new NextResponse("Factura no encontrada", { status: 404 });
    }

    // Role check: Only customer owner or ADMIN/STAFF
    if (session.user.role === "CUSTOMER" && invoice.customerId !== session.user.id) {
      return new NextResponse("Acceso prohibido a este documento", { status: 403 });
    }

    let issuer = {
      commercialName: BRAND.commercialName,
      legalName: BRAND.legalName,
      taxId: BRAND.taxId,
      taxIdVerified: false,
      address: BRAND.fiscalAddress,
      phone: BRAND.phoneVisible,
      email: BRAND.email,
    };

    try {
      if (invoice.issuerSnapshot) {
        issuer = JSON.parse(invoice.issuerSnapshot);
      }
    } catch (e) {}

    let recipient = {
      name: invoice.customer?.name || "Cliente",
      taxId: "No especificado",
      address: "Madrid, España",
      email: invoice.customer?.email || "",
    };

    try {
      if (invoice.recipientSnapshot) {
        recipient = JSON.parse(invoice.recipientSnapshot);
      }
    } catch (e) {}

    const issueDateStr = new Date(invoice.issueDate).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isTestMode = invoice.isDraftOrTest || !issuer.taxIdVerified;
    const watermarkHtml = isTestMode
      ? `<div style="position: fixed; top: 38%; left: 5%; right: 5%; transform: rotate(-30deg); font-size: 42px; font-weight: 900; color: rgba(220, 38, 38, 0.15); text-align: center; pointer-events: none; text-transform: uppercase; border: 6px dashed rgba(220, 38, 38, 0.25); padding: 24px; z-index: 9999; line-height: 1.2;">
          DOCUMENTO EN PRUEBAS<br/>NO VÁLIDO COMO FACTURA FISCAL
        </div>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Factura ${invoice.fullNumber} - GM REFORMA EXPRESS</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 48px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f4c5c;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f4c5c;
      margin: 0 0 6px 0;
    }
    .tax-badge-warning {
      display: inline-block;
      font-size: 11px;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
      margin-top: 4px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-number {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
      font-size: 14px;
    }
    .party-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }
    .party-heading {
      font-weight: 700;
      color: #0f4c5c;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    table.lines-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 14px;
    }
    table.lines-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-align: left;
      padding: 12px 14px;
      border-bottom: 2px solid #cbd5e1;
    }
    table.lines-table td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-table {
      width: 320px;
      border-collapse: collapse;
      font-size: 14px;
    }
    .totals-table td {
      padding: 8px 12px;
    }
    .totals-table tr.grand-total td {
      border-top: 2px solid #0f4c5c;
      font-size: 18px;
      font-weight: 800;
      color: #0f4c5c;
      padding-top: 14px;
    }
    .footer-note {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .no-print {
      text-align: center;
      margin-bottom: 20px;
    }
    .btn-print {
      background: #0f4c5c;
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  ${watermarkHtml}
  
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">Imprimir o Descargar como PDF</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <img src="${BRAND.logoUrl}" alt="${issuer.commercialName}" style="max-height: 52px; width: auto; display: block; margin-bottom: 10px;" />
        <h1 class="brand-title">${issuer.commercialName}</h1>
        <div style="font-size: 13px; color: #475569;">
          <strong>Titular:</strong> ${issuer.legalName} · <strong>NIF/NIE:</strong> ${issuer.taxId}
          <div class="tax-badge-warning">Pendiente de verificación documental AEAT</div>
        </div>
        <div style="font-size: 13px; color: #475569; margin-top: 6px;">
          ${issuer.address}<br/>
          Tel: ${issuer.phone} · ${issuer.email}
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-number">${invoice.fullNumber}</div>
        <div style="font-size: 13px; color: #64748b;">
          <strong>Fecha de emisión:</strong> ${issueDateStr}<br/>
          <strong>Tipo:</strong> ${invoice.type === "RECTIFICATIVE" ? "Factura Rectificativa" : "Factura de Servicios"}<br/>
          <strong>Moneda:</strong> ${invoice.currency}
        </div>
      </div>
    </div>

    <div class="parties-grid">
      <div class="party-box">
        <div class="party-heading">Emisor de la Factura</div>
        <div style="font-weight: 600;">${issuer.commercialName}</div>
        <div>Titular: ${issuer.legalName || "GM REFORMA EXPRESS"}</div>
        <div>NIF/NIE: ${issuer.taxId} (provisional)</div>
        <div>${issuer.address}</div>
      </div>
      <div class="party-box">
        <div class="party-heading">Destinatario / Cliente</div>
        <div style="font-weight: 600;">${recipient.name}</div>
        <div>NIF/CIF: ${recipient.taxId || "Consumidor Final"}</div>
        <div>${recipient.address || "Madrid, España"}</div>
        <div>${recipient.email}</div>
      </div>
    </div>

    <table class="lines-table">
      <thead>
        <tr>
          <th>Concepto / Descripción del Servicio</th>
          <th style="text-align: center; width: 60px;">Cant.</th>
          <th style="text-align: right; width: 110px;">Precio Unit.</th>
          <th style="text-align: center; width: 70px;">IVA</th>
          <th style="text-align: right; width: 110px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lines
          .map(
            (line) => `
          <tr>
            <td>${line.concept}</td>
            <td style="text-align: center;">${line.quantity}</td>
            <td style="text-align: right;">${formatCurrency(line.unitPriceCents)}</td>
            <td style="text-align: center;">${line.vatRatePercent}%</td>
            <td style="text-align: right;">${formatCurrency(line.totalCents)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals-area">
      <table class="totals-table">
        <tr>
          <td style="color: #64748b;">Base Imponible:</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(invoice.subtotalCents)}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">IVA (${invoice.vatRatePercent}% vivienda):</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(invoice.vatAmountCents)}</td>
        </tr>
        <tr class="grand-total">
          <td>TOTAL:</td>
          <td style="text-align: right;">${formatCurrency(invoice.totalCents)}</td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      <p style="margin: 0 0 6px 0;"><strong>Aviso Legal y Tributario:</strong> Documento emitido conforme al marco de operaciones de reformas en Madrid. Al encontrarse el NIF en trámite de validación documental censal, este comprobante posee valor contractual de justificante de pago pero se encuentra bloqueado para deducción fiscal formal hasta su ratificación administrativa.</p>
      <p style="margin: 0;">GM REFORMA EXPRESS · Tel: +34 640 677 948 · Madrid, España.</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error: any) {
    console.error("[Invoice Download Error]", error);
    return new NextResponse("Error al generar el documento de factura", { status: 500 });
  }
}
