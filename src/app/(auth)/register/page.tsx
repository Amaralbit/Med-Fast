import { createRegisterActionToken } from "@/app/actions/auth"
import { RegisterForm } from "./register-form"

export default async function RegisterPage() {
  const actionToken = await createRegisterActionToken()
  return <RegisterForm actionToken={actionToken} />
}
