// Normalize usernames: strip leading '@', fill empty usernames from email local part,
// and ensure uniqueness by appending numeric suffixes when necessary.

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
  } catch (e) {
    // ignore
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function normalize() {
  try {
    const users = await prisma.user.findMany();
    const seen = new Set();
    // pre-seed seen with existing usernames (normalized) to avoid collisions
    for (const u of users) {
      let name = u.username;
      if (!name && u.email) name = u.email.split('@')[0];
      if (!name) continue;
      if (name.startsWith('@')) name = name.slice(1);
      seen.add(name.toLowerCase());
    }

    for (const u of users) {
      let name = u.username;
      if (!name && u.email) name = u.email.split('@')[0];
      if (!name) continue;
      // strip leading @
      name = name.startsWith('@') ? name.slice(1) : name;
      // sanitize: lowercase, replace spaces with dashes
      let base = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
      if (!base) base = 'user' + u.id.slice(0,6);

      let candidate = base;
      let suffix = 1;
      while (true) {
        // check for collisions with other users (case-insensitive)
        const existing = await prisma.user.findFirst({ where: { username: candidate } });
        if (!existing || existing.id === u.id) break;
        candidate = `${base}-${suffix}`;
        suffix++;
      }

      if (candidate !== u.username) {
        await prisma.user.update({ where: { id: u.id }, data: { username: candidate } });
        console.log(`Updated user ${u.email} username -> ${candidate}`);
      }
    }

    console.log('Username normalization complete');
  } catch (e) {
    console.error('Normalization failed', e);
  } finally {
    await prisma.$disconnect();
  }
}

normalize();
