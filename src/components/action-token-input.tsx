import { ACTION_TOKEN_FIELD } from "@/lib/security/form-protection-shared"

export function ActionTokenInput({ token }: { token: string }) {
  return <input type="hidden" name={ACTION_TOKEN_FIELD} value={token} />
}
