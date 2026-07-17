-- CreateTable
CREATE TABLE "sequences" (
    "key" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("key")
);
