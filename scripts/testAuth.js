// Test credentials authorize logic: verify password against stored hash
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

const email = process.argv[2] || 'areyouokaynil@gmail.com';
const password = process.argv[3] || 'Okay/56822/903309@PassCode/';

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('No user', email);
      return;
    }
    console.log('Found user:', { id: user.id, email: user.email, password: !!user.password });
    if (!user.password) {
      console.log('User has no password field set');
      return;
    }
    const ok = await bcrypt.compare(password, user.password);
    console.log('Password match:', ok);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
