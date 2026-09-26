-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('PROJECT', 'RETAINER');

-- CreateEnum
CREATE TYPE "RenewalHealth" AS ENUM ('HEALTHY', 'AT_RISK', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DealItemKind" AS ENUM ('BASE', 'PACKAGE', 'ADD_ON');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('CREATED', 'VIEWED', 'ACCEPTED', 'DECLINED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'RENEWAL_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'RETAINER_AT_RISK';

-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'PROPOSAL';

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "churnReason" TEXT,
ADD COLUMN     "engagementType" "EngagementType" NOT NULL DEFAULT 'PROJECT',
ADD COLUMN     "monthlyRecurringValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "oneTimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "renewalDate" TIMESTAMP(3),
ADD COLUMN     "renewalHealth" "RenewalHealth" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "renewalProbability" INTEGER,
ADD COLUMN     "serviceStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DealItem" ADD COLUMN     "kind" "DealItemKind" NOT NULL DEFAULT 'BASE';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "onboardingKey" TEXT;

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'CREATED',
    "snapshot" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "selectedPackageId" TEXT,
    "selectedAddonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_tokenHash_key" ON "Proposal"("tokenHash");

-- CreateIndex
CREATE INDEX "Proposal_ownerId_dealId_createdAt_idx" ON "Proposal"("ownerId", "dealId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_id_ownerId_key" ON "Proposal"("id", "ownerId");

-- CreateIndex
CREATE INDEX "Deal_ownerId_engagementType_renewalDate_idx" ON "Deal"("ownerId", "engagementType", "renewalDate");

-- CreateIndex
CREATE UNIQUE INDEX "Task_ownerId_dealId_onboardingKey_key" ON "Task"("ownerId", "dealId", "onboardingKey");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
