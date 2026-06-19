-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id"          SERIAL NOT NULL,
    "token_hash"  TEXT NOT NULL,
    "expires_at"  TIMESTAMP(3) NOT NULL,
    "revoked"     BOOLEAN NOT NULL DEFAULT false,
    "user_id"     INTEGER NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_info" TEXT,
    "ip_address"  TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: drop refreshToken column from User (nullify existing rows first to avoid data loss errors)
UPDATE "User" SET "refreshToken" = NULL;
ALTER TABLE "User" DROP COLUMN IF EXISTS "refreshToken";
