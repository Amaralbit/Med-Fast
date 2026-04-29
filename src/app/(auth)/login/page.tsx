import { createLoginActionToken } from "@/app/actions/auth"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const actionToken = await createLoginActionToken()
  return <LoginForm actionToken={actionToken} />
}
