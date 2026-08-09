// List sessions for a user email
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
const prisma = new PrismaClient();

const email = process.argv[2] || 'areyouokaynil@gmail.com';

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('No user', email);
      return;
    }
    const sessions = await prisma.session.findMany({ where: { userId: user.id } });
    console.log('User:', { id: user.id, email: user.email });
    console.log('Sessions:', sessions);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
