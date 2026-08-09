// Script to set password, username and image for an existing user
// Usage: node scripts/setPassword.js email password username imagePath

const fs = require('fs');
if (!process.env.DATABASE_URL) {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    env.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m) {
        const key = m[1];
        let val = m[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  } catch (err) {}
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const email = process.argv[2];
const password = process.argv[3];
const username = process.argv[4] || null;
const image = process.argv[5] || null;

if (!email || !password) {
  console.error('Usage: node scripts/setPassword.js email password [username] [imagePath]');
  process.exit(1);
}

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('No user found with email', email);
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { email },
      data: { password: hash, username: username, image: image }
    });
    console.log('Updated user:', { id: updated.id, email: updated.email, username: updated.username, image: updated.image });
  } catch (err) {
    console.error('Failed to update user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
