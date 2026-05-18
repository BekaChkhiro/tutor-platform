-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tutor" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;
