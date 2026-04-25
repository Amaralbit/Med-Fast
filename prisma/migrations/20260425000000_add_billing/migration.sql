ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_profiles_stripeCustomerId_key" ON "doctor_profiles"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_profiles_stripeSubscriptionId_key" ON "doctor_profiles"("stripeSubscriptionId");
