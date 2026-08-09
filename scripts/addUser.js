// Script to add a User row to the local Prisma SQLite DB
// Usage: node scripts/addUser.js email [name]

const fs = require('fs');
// Load .env.local if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    env.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m) {
        const key = m[1];
        let val = m[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        // remove surrounding single quotes too
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  } catch (err) {
    // ignore if .env.local missing
  }
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/addUser.js email [name]');
  process.exit(1);
}
const name = process.argv[3] || email.split('@')[0];

async function main() {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('User already exists:', existing);
      return;
    }

    const user = await prisma.user.create({ data: { email, name } });
    console.log('Created user:', { id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Failed to create user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
