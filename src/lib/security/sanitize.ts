const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

function stripControlChars(value: string) {
  return value.replace(CONTROL_CHARS_RE, "")
}

export function sanitizePlainText(value: string, maxLength: number) {
  return stripControlChars(value).replace(/\s+/g, " ").trim().slice(0, maxLength)
}

export function sanitizeMultilineText(value: string, maxLength: number) {
  return stripControlChars(value)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength)
}

export function sanitizeEmail(value: string) {
  return sanitizePlainText(value, 254).toLowerCase()
}

export function sanitizeDigits(value: string, maxLength: number) {
  return value.replace(/\D+/g, "").slice(0, maxLength)
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function safeExternalUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}
