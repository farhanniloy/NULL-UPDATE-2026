// Seed script to create sample categories, a sample author, and 20 sample posts.
// Usage: DATABASE_URL="postgres://..." node scripts/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Seeding database with sample categories, user, and posts...');

  const categories = [
    { slug: 'philosophy', title: 'Philosophy' },
    { slug: 'science', title: 'Science' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'projects', title: 'Projects' },
    { slug: 'infiltration', title: 'Infiltration' },
    { slug: 'security', title: 'Security' },
    { slug: 'design', title: 'Design' },
    { slug: 'tools', title: 'Tools' },
    { slug: 'opinion', title: 'Opinion' },
    { slug: 'guides', title: 'Guides' },
  ];

  // Upsert categories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, img: c.img || null },
      create: { slug: c.slug, title: c.title, img: c.img || null },
    });
  }

  // Create or upsert a sample user
  const authorEmail = 'sample@null.test';
  await prisma.user.upsert({
    where: { email: authorEmail },
    update: {
      name: 'Sample Author',
      username: 'sample',
      image: null,
      password: null,
      role: 'USER',
    },
    create: {
      email: authorEmail,
      name: 'Sample Author',
      username: 'sample',
      emailVerified: null,
      image: null,
      password: null,
      role: 'USER',
    },
  });

  // Build 20 sample posts distributed across categories
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.';

  const posts = Array.from({ length: 20 }).map((_, i) => {
    const idx = i % categories.length;
    const title = `Sample post ${i + 1} — ${categories[idx].title}`;
    const slug = slugify(`sample-post-${i + 1}-${categories[idx].slug}`);
    return {
      slug,
      title,
      summary: `${title} — a short summary.`,
      desc: `${lorem}\n\n${lorem}`,
      img: null,
      catSlug: categories[idx].slug,
      userEmail: authorEmail,
      approved: true,
    };
  });

  for (const p of posts) {
    try {
      // use create to avoid overwriting intentional existing content; if slug exists, skip
      const existing = await prisma.post.findUnique({ where: { slug: p.slug } });
      if (existing) {
        console.log(`Skipping existing post: ${p.slug}`);
        continue;
      }

      const created = await prisma.post.create({
        data: p,
      });

      // Also create a PostCategory entry linking the post to its category (many-to-many table)
      await prisma.postCategory.create({
        data: {
          postId: created.id,
          categorySlug: p.catSlug,
        },
      });

      console.log(`Created post: ${p.slug}`);
    } catch (err) {
      console.error('Error creating post', p.slug, err.message || err);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
