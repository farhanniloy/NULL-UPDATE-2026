-- Migration: add-postcategory

CREATE TABLE IF NOT EXISTS "PostCategory" (
  "postId" TEXT NOT NULL,
  "categorySlug" TEXT NOT NULL,
  PRIMARY KEY ("postId", "categorySlug"),
  CONSTRAINT "PostCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE,
  CONSTRAINT "PostCategory_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category" ("slug") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "PostCategory_categorySlug_idx" ON "PostCategory" ("categorySlug");
