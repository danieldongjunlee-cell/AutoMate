-- UGC moderation: reports on community posts (App Store guideline 1.2).
CREATE TABLE "community_reports" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT,
    "reason" TEXT NOT NULL DEFAULT 'inappropriate',
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
