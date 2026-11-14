import test from "node:test";
import assert from "node:assert/strict";

// Dynamic import from compiled or pure TS/JS logic
import {
  generateShortCode,
  isValidUrl,
  normalizeUrl,
  sanitizeCode,
} from "../src/lib/shortener.ts";

test("generateShortCode generates 6 characters", () => {
  const code = generateShortCode();
  assert.equal(typeof code, "string");
  assert.equal(code.length, 6);
  // Must match character set without 0, O, I, l
  assert.match(code, /^[1-9a-km-zA-HJ-NP-Z]{6}$/);
});

test("isValidUrl validates standard http and https URLs", () => {
  assert.equal(isValidUrl("https://labmuma.xyz"), true);
  assert.equal(isValidUrl("http://localhost:3000"), true);
  assert.equal(isValidUrl("ftp://invalid.com"), false);
  assert.equal(isValidUrl("javascript:alert(1)"), false);
  assert.equal(isValidUrl("not-a-url"), false);
});

test("normalizeUrl prepends https:// if protocol is missing", () => {
  assert.equal(normalizeUrl("labmuma.xyz"), "https://labmuma.xyz");
  assert.equal(normalizeUrl("https://example.com"), "https://example.com");
  assert.equal(normalizeUrl("http://insecure.org"), "http://insecure.org");
});

test("sanitizeCode strips unwanted characters", () => {
  assert.equal(sanitizeCode("abc!@#123"), "abc123");
  assert.equal(sanitizeCode(" custom_code-1 "), "custom_code-1");
});
