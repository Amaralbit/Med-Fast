import crypto from "node:crypto"
import { cookies, headers } from "next/headers"

export const ACTION_TOKEN_FIELD = "__action_token"
export const ACTION_TOKEN_HEADER = "x-action-token"
export const ACTION_TOKEN_COOKIE = "medfast_action_secret"

type UsedEntry = { expiresAt: number }
const usedTokens = new Map<string, UsedEntry>()

const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [token, entry] of usedTokens) {
    if (now >= entry.expiresAt) usedTokens.delete(token)
  }
}, 10 * 60 * 1000)

if (typeof cleanup === "object" && "unref" in cleanup) {
  ;(cleanup as NodeJS.Timeout).unref()
}

function sign(secret: string, scope: string, subject: string, nonce: string, issuedAt: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${scope}:${subject}:${nonce}:${issuedAt}`)
    .digest("base64url")
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export async function createActionToken(scope: string, subject = "anon") {
  const secret = (await cookies()).get(ACTION_TOKEN_COOKIE)?.value
  if (!secret) {
    throw new Error("CSRF secret cookie is missing")
  }

  const nonce = crypto.randomBytes(18).toString("base64url")
  const issuedAt = Date.now().toString()
  const mac = sign(secret, scope, subject, nonce, issuedAt)
  return `${nonce}.${issuedAt}.${mac}`
}

export async function verifySameOrigin() {
  const h = await headers()
  const origin = h.get("origin")
  const host = h.get("x-forwarded-host") ?? h.get("host")

  if (!origin || !host) return

  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    throw new Error("Origem inválida")
  }

  if (originUrl.host !== host) {
    throw new Error("Origem não permitida")
  }
}

export async function verifyActionToken(
  submittedToken: string | null | undefined,
  scope: string,
  subject = "anon",
  maxAgeMs = 2 * 60 * 60 * 1000,
  consume = false
) {
  await verifySameOrigin()

  if (!submittedToken) {
    throw new Error("Token de segurança ausente")
  }

  const secret = (await cookies()).get(ACTION_TOKEN_COOKIE)?.value
  if (!secret) {
    throw new Error("Token de segurança indisponível")
  }

  const [nonce, issuedAtRaw, mac] = submittedToken.split(".")
  if (!nonce || !issuedAtRaw || !mac) {
    throw new Error("Token de segurança inválido")
  }

  const issuedAt = Number(issuedAtRaw)
  if (!Number.isFinite(issuedAt)) {
    throw new Error("Token de segurança inválido")
  }

  if (Date.now() - issuedAt > maxAgeMs) {
    throw new Error("Token de segurança expirado")
  }

  const expectedMac = sign(secret, scope, subject, nonce, issuedAtRaw)
  if (!timingSafeEqual(mac, expectedMac)) {
    throw new Error("Token de segurança inválido")
  }

  if (consume) {
    if (usedTokens.has(submittedToken)) {
      throw new Error("Requisição já processada")
    }
    usedTokens.set(submittedToken, { expiresAt: issuedAt + maxAgeMs })
  }
}

export function getActionTokenValue(formData: FormData) {
  return formData.get(ACTION_TOKEN_FIELD)?.toString()
}
