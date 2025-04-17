-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "embed_url" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "views" TEXT NOT NULL DEFAULT '0',
    "time" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_deleted" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);
