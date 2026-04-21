-- CreateTable
CREATE TABLE "chat_questions" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_questions" ADD CONSTRAINT "chat_questions_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
