import * as net from "net";
import * as dns from "dns";
import { URL } from "url";

export const BLOCKED_HOSTNAMES: string[] = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
  "0.metadata.google.internal",
  "100.100.100.200",
  "metadata.azure.com",
  "instance-data.ec2.internal",
  "169.254.169.254.xip.io",
];

export const MAX_REDIRECTS = 5;

export function isPrivateIP(hostname: string): boolean {
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 0) {
    return false;
  }

  if (hostname === "::1" || hostname === "0.0.0.0" || hostname === "::") {
    return true;
  }

  if (ipVersion === 4) {
    const octets = hostname.split(".").map(Number);
    if (octets.length !== 4) return false;

    if (octets[0] === 10) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    if (octets[0] === 127) return true;
    if (octets[0] === 169 && octets[1] === 254) return true;
    if (octets[0] === 0) return true;
    if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return true;
    if (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19)) return true;
  }

  if (ipVersion === 6) {
    const normalized = hostname.toLowerCase();
    if (normalized === "::1" || normalized === "0000:0000:0000:0000:0000:0000:0000:0001") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe80")) return true;
    if (normalized.startsWith("::ffff:")) {
      const mapped = normalized.slice(7);
      return isPrivateIP(mapped);
    }
    if (normalized.startsWith("::ffff:0:")) {
      const mapped = normalized.slice(9);
      return isPrivateIP(mapped);
    }
  }

  return false;
}

export function isSafeUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol === "file:" || protocol === "data:" || protocol === "javascript:") return false;
  if (protocol !== "http:" && protocol !== "https:") return false;

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) return false;
  if (isPrivateIP(hostname)) return false;

  try {
    const octets = hostname.split(".").map(Number);
    if (octets.length === 4 && octets.every(o => !isNaN(o) && o >= 0 && o <= 255)) {
      const dottedDecimal = octets.join(".");
      if (isPrivateIP(dottedDecimal)) return false;
    }
  } catch { /* not an IP */ }

  if (parsed.port && !["80", "443", ""].includes(parsed.port)) return false;

  return true;
}

function getRegistrableDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) return hostname.toLowerCase();
  return parts.slice(-2).join(".");
}

export function validateRedirectUrl(url: string, originalUrl: string): boolean {
  let parsedRedirect: URL;
  let parsedOriginal: URL;

  try {
    parsedRedirect = new URL(url);
  } catch {
    return false;
  }

  try {
    parsedOriginal = new URL(originalUrl);
  } catch {
    return false;
  }

  const redirectProtocol = parsedRedirect.protocol.toLowerCase();
  if (redirectProtocol !== "http:" && redirectProtocol !== "https:") return false;

  const redirectHostname = parsedRedirect.hostname.toLowerCase();
  const originalHostname = parsedOriginal.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(redirectHostname)) return false;
  if (isPrivateIP(redirectHostname)) return false;

  const redirectDomain = getRegistrableDomain(redirectHostname);
  const originalDomain = getRegistrableDomain(originalHostname);

  if (redirectDomain !== originalDomain) return false;

  return true;
}

export function resolveAndCheckHost(hostname: string): Promise<boolean> {
  return new Promise((resolve) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        dns.resolve6(hostname, (err6, addr6) => {
          if (err6) { resolve(true); return; }
          resolve(!addr6.some(a => isPrivateIP(a)));
        });
        return;
      }
      resolve(!addresses.some(a => isPrivateIP(a)));
    });
  });
}

export async function isSafeUrlWithDns(url: string): Promise<boolean> {
  if (!isSafeUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return await resolveAndCheckHost(parsed.hostname);
  } catch {
    return false;
  }
}
