-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "phone" TEXT,
    "initial" TEXT NOT NULL DEFAULT 'U',
    "completion_pct" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color_name" TEXT,
    "vin" TEXT,
    "odometer_mi" INTEGER NOT NULL DEFAULT 0,
    "oil_spec" TEXT,
    "last_service" TEXT,
    "health_pct" INTEGER NOT NULL DEFAULT 100,
    "health_label" TEXT NOT NULL DEFAULT 'Good',
    "oil_due_in_mi" INTEGER,
    "market_value" JSONB,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT,
    "parts" JSONB NOT NULL,
    "photo_refs" TEXT[],
    "ai_type" TEXT,
    "ai_part" TEXT,
    "ai_severity" TEXT,
    "ai_price_low" INTEGER,
    "ai_price_high" INTEGER,
    "ai_confidence" DOUBLE PRECISION,
    "shops_notified" INTEGER NOT NULL DEFAULT 0,
    "after_hours" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "damage_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "damage_request_id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "dealer_name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "price_high" INTEGER,
    "note" TEXT NOT NULL,
    "parts" TEXT NOT NULL,
    "pin_top" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "pin_left" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "tier" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "dealer_name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'maintenance',
    "services" JSONB NOT NULL,
    "date" TEXT,
    "time" TEXT,
    "total_cents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'card',
    "purpose" TEXT NOT NULL DEFAULT 'booking',
    "status" TEXT NOT NULL DEFAULT 'succeeded',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "type" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "date_label" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🛢️',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "image_ref" TEXT,
    "extracted" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "policy_number" TEXT NOT NULL,
    "account_number" TEXT,
    "deductible" INTEGER NOT NULL DEFAULT 500,
    "premium_per_year" INTEGER NOT NULL,
    "covers" TEXT,
    "renewal" TEXT,
    "claims_phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_ledger" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pro_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL DEFAULT 1000,
    "lifetime" BOOLEAN NOT NULL DEFAULT true,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pro_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🔔',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ago_label" TEXT,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "tint" TEXT NOT NULL DEFAULT 'neutral',
    "target" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL DEFAULT 'honda',
    "author_id" TEXT,
    "author_name" TEXT NOT NULL,
    "initial" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7F77DD',
    "car" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "has_photo" BOOLEAN NOT NULL DEFAULT false,
    "ago_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "initial" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7F77DD',
    "car" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_requests" ADD CONSTRAINT "damage_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_damage_request_id_fkey" FOREIGN KEY ("damage_request_id") REFERENCES "damage_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_memberships" ADD CONSTRAINT "pro_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
