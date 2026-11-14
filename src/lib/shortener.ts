import { customAlphabet } from "nanoid";

// Safe Base62 alphabet without visually ambiguous chars (0, O, I, l removed for readability)
// 58 clean chars: numbers 1-9, lower, upper
const ALPHABET = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const generateCode = customAlphabet(ALPHABET, 6);

export function generateShortCode(): string {
  return generateCode();
}

export function isValidUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function sanitizeCode(code: string): string {
  return code.trim().replace(/[^a-zA-Z0-9_-]/g, "");
}
