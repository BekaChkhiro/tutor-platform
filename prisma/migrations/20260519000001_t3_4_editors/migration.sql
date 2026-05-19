-- AlterTable: add sortOrder to Skill, Certificate, Education, Experience
ALTER TABLE "Skill" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Certificate" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Education" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Experience" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: CommonSkill
CREATE TABLE "CommonSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',

    CONSTRAINT "CommonSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommonSkill_name_key" ON "CommonSkill"("name");
