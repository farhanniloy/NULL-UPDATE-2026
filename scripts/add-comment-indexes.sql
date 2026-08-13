-- SQL statements to add indexes to make COUNT queries faster on comments
-- Run these in your database (e.g., Neon SQL console) when ready. Always backup before applying.

-- index to speed up counting comments per user per day
CREATE INDEX IF NOT EXISTS idx_comment_user_createdat ON "Comment" ("userEmail", "createdAt");

-- index to speed up counting anonymous comments by ip + createdAt
CREATE INDEX IF NOT EXISTS idx_comment_ip_createdat ON "Comment" ("ipAddr", "createdAt");

-- Consider adding a partial index filtering approved comments if only approved are counted:
-- CREATE INDEX IF NOT EXISTS idx_comment_user_approved_createdat ON "Comment" ("userEmail", "createdAt") WHERE approved = true;

-- Notes:
-- - These improve the performance of COUNT queries used as a fallback when the in-memory rate-limit store isn't available.
-- - For Prisma-based migration, you can create a migration that runs the same SQL, or add indexes via schema changes if desired.
