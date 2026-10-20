import dns from "node:dns/promises";
import net from "node:net";

const DEFAULT_ALLOWED_HOSTS = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "imagedelivery.net",
  "www.reformaexpress.com",
  "pub-*.r2.dev",
  "assets.zyrosite.com",
];


export function getAllowedHosts(): string[] {
  const envHosts = process.env.IMAGE_CDN_ALLOWED_HOSTS;
  if (!envHosts) return DEFAULT_ALLOWED_HOSTS;
  return envHosts.split(",").map((h) => h.trim().toLowerCase());
}

export function isHostAllowed(hostname: string): boolean {
  const allowed = getAllowedHosts();
  const lower = hostname.toLowerCase();

  return allowed.some((pattern) => {
    if (pattern.startsWith("*.")) {
      const suffix = pattern.slice(1);
      return lower.endsWith(suffix);
    }
    if (pattern.includes("*")) {
      const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
      return regex.test(lower);
    }
    return lower === pattern;
  });
}

export function isPrivateIp(ip: string): boolean {
  // Check IPv4
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local & AWS/Cloud metadata 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // Broadcast / Multicast
    if (parts[0] >= 224) return true;
    return false;
  }

  // Check IPv6
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::" || lower.startsWith("fe80:") || lower.startsWith("fc00:") || lower.startsWith("fd00:")) {
      return true;
    }
    return false;
  }

  return true; // Unknown IP structure, treat as unsafe
}

export async function validateExternalImageUrl(urlStr: string): Promise<{
  valid: boolean;
  error?: string;
  sanitizedUrl?: string;
}> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false, error: "La URL proporcionada no tiene un formato válido." };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, error: "Por motivos de seguridad, solo se admiten imágenes bajo HTTPS." };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Basic localhost / internal IP check
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { valid: false, error: "Acceso denegado a dominios de red local (prevención SSRF)." };
  }

  // Check against allowed host patterns
  if (!isHostAllowed(hostname)) {
    return {
      valid: false,
      error: `El host '${hostname}' no está en la lista de dominios CDN aprobados. Configure IMAGE_CDN_ALLOWED_HOSTS en el administrador.`,
    };
  }

  // Resolve DNS to verify it doesn't resolve to internal or metadata IP (DNS Rebinding / SSRF protection)
  try {
    const resolved = await dns.lookup(hostname, { all: true });
    for (const record of resolved) {
      if (isPrivateIp(record.address)) {
        return {
          valid: false,
          error: `El dominio '${hostname}' resuelve a una dirección IP interna no permitida (${record.address}).`,
        };
      }
    }
  } catch {
    return { valid: false, error: `No fue posible resolver el host '${hostname}' en los servidores DNS.` };
  }

  return { valid: true, sanitizedUrl: parsed.toString() };
}
