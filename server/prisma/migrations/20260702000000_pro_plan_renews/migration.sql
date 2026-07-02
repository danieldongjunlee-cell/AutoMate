-- Pro is a subscription: track the plan tier and next renewal date.
ALTER TABLE "pro_memberships" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'annual';
ALTER TABLE "pro_memberships" ADD COLUMN "renews_at" TIMESTAMP(3);
