// Demo script: create a normal user, create a pending post, approve it as admin, and print DB rows
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
  } catch (err) {
    // ignore
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const userEmail = 'normal@example.com';
  const adminEmail = 'areyouokaynil@gmail.com';

  // ensure category
  let cat = await prisma.category.findUnique({ where: { slug: 'general' } });
  if (!cat) {
    cat = await prisma.category.create({ data: { slug: 'general', title: 'General' } });
    console.log('Created category general');
  }

  // create normal user
  let user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    user = await prisma.user.create({ data: { email: userEmail, name: 'Normal User', username: '@normal' } });
    console.log('Created user', userEmail);
  } else {
    console.log('User already exists:', userEmail);
  }

  // create pending post
  const slug = 'demo-post-' + Date.now();
  const post = await prisma.post.create({ data: {
    slug,
    title: 'Demo Post by normal user',
    desc: 'This is a demo post created by the end-to-end script.',
    summary: 'Demo post',
    img: null,
    catSlug: cat.slug,
    userEmail: user.email,
    approved: false
  }});
  console.log('Created post (pending):', post.slug);

  // simulate admin approval
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.warn('Admin user not found:', adminEmail, '— approval step will still mark post approved but actorEmail will be null');
  }

  const updated = await prisma.post.update({ where: { slug }, data: { approved: true } });

  // write moderation history
  await prisma.moderationHistory.create({ data: {
    actorEmail: adminEmail,
    targetUserEmail: user.email,
    postSlug: slug,
    action: 'APPROVE_POST',
    details: `Script-approved post ${slug}`
  }});

  console.log('Approved post and recorded moderation history.');

  // print post and moderation entries
  const fetched = await prisma.post.findUnique({ where: { slug } });
  console.log('Post row:', fetched);
  const hist = await prisma.moderationHistory.findMany({ where: { targetUserEmail: user.email }, orderBy: { createdAt: 'desc' } });
  console.log('Moderation history for user:', hist);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
