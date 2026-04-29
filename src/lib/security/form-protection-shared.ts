export const ACTION_TOKEN_FIELD = "__action_token"
export const ACTION_TOKEN_HEADER = "x-action-token"
export const ACTION_TOKEN_COOKIE = "medfast_action_secret"

export function getActionTokenValue(formData: FormData) {
  return formData.get(ACTION_TOKEN_FIELD)?.toString()
}
