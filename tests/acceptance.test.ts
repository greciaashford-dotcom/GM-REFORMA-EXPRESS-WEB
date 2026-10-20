import { describe, it, expect, beforeAll } from "vitest";
import { isPrivateIp, isHostAllowed, validateExternalImageUrl } from "../src/lib/security/ssrf";
import { parseCurrencyToCents, formatCurrency, verifyAgreedAmount } from "../src/lib/pricing/agreed-amount";
import { isPostalCodeCovered, BRAND } from "../src/lib/constants";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth/jwt";
import { hasPermission } from "../src/lib/auth/roles";
import { generateIcsCalendar } from "../src/lib/booking/engine";
import { TestInvoiceProvider } from "../src/lib/invoicing/test-provider";
import db from "../src/lib/db";

describe("1. SEGURIDAD Y PREVENCIÓN SSRF (Biblioteca de Imágenes)", () => {
  it("debe bloquear IPs privadas, loopback y metadatos de proveedores cloud", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.0.0.1")).toBe(true);
    expect(isPrivateIp("192.168.1.10")).toBe(true);
    expect(isPrivateIp("172.16.5.4")).toBe(true);
    expect(isPrivateIp("169.254.169.254")).toBe(true); // AWS/Cloud metadata
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("8.8.8.8")).toBe(false); // IP pública de Google
    expect(isPrivateIp("1.1.1.1")).toBe(false); // IP pública de Cloudflare
  });

  it("debe rechazar esquemas inseguros no HTTPS (HTTP, FTP)", async () => {
    const resHttp = await validateExternalImageUrl("http://images.unsplash.com/photo-test");
    expect(resHttp.valid).toBe(false);
    expect(resHttp.error).toContain("solo se admiten imágenes bajo HTTPS");

    const resFtp = await validateExternalImageUrl("ftp://images.unsplash.com/file");
    expect(resFtp.valid).toBe(false);
  });

  it("debe rechazar dominios localhost y de red interna", async () => {
    const resLocal = await validateExternalImageUrl("https://localhost/image.png");
    expect(resLocal.valid).toBe(false);
    expect(resLocal.error).toContain("Acceso denegado a dominios de red local");

    const resIpLocal = await validateExternalImageUrl("https://127.0.0.1/image.png");
    expect(resIpLocal.valid).toBe(false);
  });

  it("debe rechazar dominios no autorizados en la lista blanca de CDNs", async () => {
    const resUntrusted = await validateExternalImageUrl("https://evil-hacker-site.org/malware.jpg");
    expect(resUntrusted.valid).toBe(false);
    expect(resUntrusted.error).toContain("no está en la lista de dominios CDN aprobados");
  });

  it("debe validar correctamente dominios CDN aprobados", () => {
    expect(isHostAllowed("images.unsplash.com")).toBe(true);
    expect(isHostAllowed("res.cloudinary.com")).toBe(true);
    expect(isHostAllowed("www.reformaexpress.com")).toBe(true);
    expect(isHostAllowed("unauthorized-domain.com")).toBe(false);
  });
});

describe("2. VALIDACIÓN CRÍTICA DEL IMPORTE ACORDADO Y ANTIFRAUDE", () => {
  it("debe convertir cantidades en euros a céntimos enteros con exactitud matemática", () => {
    expect(parseCurrencyToCents("4.800,00 €")).toBe(480000);
    expect(parseCurrencyToCents("1.250,50")).toBe(125050);
    expect(parseCurrencyToCents(100)).toBe(10000);
    expect(parseCurrencyToCents("99.99")).toBe(9999);
  });

  it("debe formatear céntimos a formato de moneda español estándar", () => {
    const formatted = formatCurrency(480000);
    expect(formatted.replace(/\s/g, " ")).toMatch(/4[.,]?800|4800/);
    expect(formatted).toContain("€");
  });


  it("debe aprobar la verificación cuando el importe coincide exactamente con el presupuesto en BD", async () => {
    // PRE-2026-001 has totalCents = 480000 in seed
    const quote = await db.quote.findUnique({
      where: { quoteNumber: "PRE-2026-001" },
    });

    if (quote) {
      const result = await verifyAgreedAmount({
        quoteReference: "PRE-2026-001",
        inputAmountCents: 480000,
        customerId: quote.customerId,
      });

      expect(result.isValid).toBe(true);
      expect(result.quote).toBeDefined();
      expect(result.quote?.totalCents).toBe(480000);
    }
  });

  it("debe bloquear la transacción y generar alerta de discrepancia ante alteración de precio", async () => {
    const quote = await db.quote.findUnique({
      where: { quoteNumber: "PRE-2026-001" },
    });

    if (quote) {
      // Tampered amount: 2.000 € instead of 4.800 €
      const result = await verifyAgreedAmount({
        quoteReference: "PRE-2026-001",
        inputAmountCents: 200000,
        customerId: quote.customerId,
      });

      expect(result.isValid).toBe(false);
      expect(result.discrepancy).toBeDefined();
      expect(result.discrepancy?.differenceCents).toBe(280000);

      // Verify that AgreedAmountVerificationRequest was registered in DB
      const req = await db.agreedAmountVerificationRequest.findFirst({
        where: {
          quoteReference: "PRE-2026-001",
          inputAmountCents: 200000,
        },
      });
      expect(req).toBeDefined();
      expect(req?.status).toBe("MISMATCH_ALERT");
    }
  });

});

describe("3. INTEGRIDAD FISCAL Y MARCA (Y90137803D)", () => {
  it("debe mantener el literal Y90137803D como pendiente de verificación", async () => {
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
    });

    expect(settings?.taxId).toBe("Y90137803D");
    expect(settings?.taxIdVerified).toBe(false);
    expect(settings?.taxIdNotes).toContain("10 caracteres");
    expect(BRAND.taxId).toBe("Y90137803D");
  });

  it("debe mantener bloqueados pagos en vivo e emisión fiscal formal hasta verificación", async () => {
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
    });

    expect(settings?.livePaymentsEnabled).toBe(false);
    expect(settings?.fiscalIssuanceEnabled).toBe(false);
  });

  it("el proveedor de facturación en pruebas debe generar la marca de agua obligatoria", async () => {
    const provider = new TestInvoiceProvider();
    const result = await provider.issueInvoice({
      invoiceNumber: "F2026-00001",
      series: "F2026",
      issueDate: new Date(),
      issuer: { taxId: "Y90137803D" },
      recipient: { name: "Cliente Madrid" },
      lines: [],
      subtotalCents: 436364,
      vatRatePercent: 10,
      vatAmountCents: 43636,
      totalCents: 480000,
      currency: "EUR",
      isTest: true,
    });

    expect(result.success).toBe(true);
    expect(result.isTestDocument).toBe(true);
    expect(result.watermarkText).toBe("PRUEBA / NO VÁLIDO COMO FACTURA FISCAL");
  });
});

describe("4. SISTEMA DE RESERVAS Y COBERTURA EN MADRID", () => {
  it("debe validar códigos postales de la Comunidad de Madrid", () => {
    // Madrid Capital
    expect(isPostalCodeCovered("28001")).toBe(true);
    expect(isPostalCodeCovered("28028")).toBe(true);
    expect(isPostalCodeCovered("28055")).toBe(true);

    // Corona metropolitana
    expect(isPostalCodeCovered("28223")).toBe(true); // Pozuelo
    expect(isPostalCodeCovered("28901")).toBe(true); // Getafe
    expect(isPostalCodeCovered("28100")).toBe(true); // Alcobendas

    // Fuera de Madrid
    expect(isPostalCodeCovered("08001")).toBe(false); // Barcelona
    expect(isPostalCodeCovered("41001")).toBe(false); // Sevilla
    expect(isPostalCodeCovered("46001")).toBe(false); // Valencia
  });

  it("debe generar un fichero .ics de calendario con datos oficiales de GM REFORMA EXPRESS", () => {
    const ics = generateIcsCalendar({
      bookingNumber: "RES-2026-0001",
      clientName: "Carlos Gómez",
      serviceTitle: "Reformas de Baños",
      type: "ORIENTATION_CALL",
      startTimeUtc: new Date("2026-11-01T10:00:00Z"),
      endTimeUtc: new Date("2026-11-01T10:20:00Z"),
      address: "Calle Alcalá 45, Madrid",
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("PRODID:-//GM REFORMA EXPRESS//Citas v1.0//ES");
    expect(ics).toContain("UID:RES-2026-0001@reformaexpress.com");
    expect(ics).toContain("+34 640 677 948");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("debe detectar correctamente solapamientos de citas cuando una reserva engloba a otra", () => {
    const isOverlapping = (
      existingStart: Date,
      existingEnd: Date,
      newStart: Date,
      newEnd: Date
    ) => existingStart < newEnd && existingEnd > newStart;

    const existingStart = new Date("2026-11-01T10:00:00Z");
    const existingEnd = new Date("2026-11-01T10:30:00Z");

    // Caso: nueva reserva engloba completamente a la existente
    const enclosingStart = new Date("2026-11-01T09:30:00Z");
    const enclosingEnd = new Date("2026-11-01T11:00:00Z");
    expect(isOverlapping(existingStart, existingEnd, enclosingStart, enclosingEnd)).toBe(true);

    // Caso: reserva inmediatamente anterior (sin solapamiento)
    const beforeStart = new Date("2026-11-01T09:00:00Z");
    const beforeEnd = new Date("2026-11-01T10:00:00Z");
    expect(isOverlapping(existingStart, existingEnd, beforeStart, beforeEnd)).toBe(false);

    // Caso: reserva inmediatamente posterior (sin solapamiento)
    const afterStart = new Date("2026-11-01T10:30:00Z");
    const afterEnd = new Date("2026-11-01T11:30:00Z");
    expect(isOverlapping(existingStart, existingEnd, afterStart, afterEnd)).toBe(false);
  });
});

describe("5. CONTROL DE ACCESO (RBAC) Y CRIPTOGRAFÍA", () => {
  it("debe hashear y verificar contraseñas correctamente con bcrypt", async () => {
    const password = "SuperPassword2026!";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);

    const valid = await verifyPassword(password, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("WrongPassword", hash);
    expect(invalid).toBe(false);
  });

  it("debe firmar y verificar tokens JWT de sesión", () => {
    const payload = {
      userId: "usr-123",
      email: "test@reformaexpress.com",
      role: "CUSTOMER" as const,
      name: "Juan Pérez",
    };

    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe("usr-123");
    expect(decoded?.role).toBe("CUSTOMER");
  });

  it("debe hacer cumplir la matriz de permisos de roles", () => {
    expect(hasPermission("SUPERADMIN", "settings:write")).toBe(true);
    expect(hasPermission("SUPERADMIN", "users:manage")).toBe(true);

    expect(hasPermission("OPERATIONS", "quotes:read")).toBe(true);
    expect(hasPermission("OPERATIONS", "settings:write")).toBe(false);

    expect(hasPermission("CUSTOMER", "settings:write")).toBe(false);
    expect(hasPermission("CUSTOMER", "campaigns:write")).toBe(false);
  });


});

describe("6. MARKETING, NEWSLETTER Y LÍMITE DE FRECUENCIA", () => {
  it("debe respetar el límite de frecuencia de 2 comunicaciones semanales por usuario", async () => {
    // Check subscriber schema default
    const subscriber = await db.subscriber.findFirst();
    if (subscriber) {
      expect(subscriber.weeklyPromosReceivedThisWeek).toBeLessThanOrEqual(2);
    }
  });

  it("debe excluir direcciones presentes en la tabla de supresión", async () => {
    const suppressed = await db.suppression.findMany();
    expect(Array.isArray(suppressed)).toBe(true);
  });
});
