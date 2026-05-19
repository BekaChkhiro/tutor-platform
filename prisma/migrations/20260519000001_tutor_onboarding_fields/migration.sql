-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Tutor" ADD COLUMN "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
