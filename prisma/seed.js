import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(){
  const user = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', name: 'Local Admin' }
  });

  const categories = [
    { slug: 'philosophy', title: 'Philosophy' },
    { slug: 'infiltration', title: 'Infiltration' },
    { slug: 'science', title: 'Science' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'projects', title: 'Projects' },
  ];

  const categoryMap = {};
  for (const category of categories) {
    categoryMap[category.slug] = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Reassign posts that reference legacy categories (e.g. 'article') to the new 'philosophy' category
  await prisma.post.updateMany({
    where: { catSlug: 'article' },
    data: { catSlug: 'philosophy' },
  });

  // Now it is safe to remove any categories that are not in the desired list so UI shows the requested set/order only
  await prisma.category.deleteMany({
    where: { slug: { notIn: categories.map((c) => c.slug) } },
  });

  const samplePosts = [
    {
      slug: 'the-article-that-matters',
      title: 'The Article That Matters',
      desc: 'A thoughtful piece on why clear writing and honest storytelling make every web project stronger.',
      img: '/plus.png',
      catSlug: 'philosophy',
      createdAt: new Date('2026-07-20T10:00:00Z'),
    },
    {
      slug: 'entering-the-shadow-web',
      title: 'Entering the Shadow Web',
      desc: 'An infiltration story about navigating systems, privacy, and the risks of probing unseen networks.',
      img: '/plus.png',
      catSlug: 'infiltration',
      createdAt: new Date('2026-07-22T09:30:00Z'),
    },
    {
      slug: 'building-small-projects-with-impact',
      title: 'Building Small Projects with Impact',
      desc: 'Practical advice for turning personal ideas into projects that feel meaningful and maintainable.',
      img: '/plus.png',
      catSlug: 'projects',
      createdAt: new Date('2026-06-15T08:00:00Z'),
    },
    {
      slug: 'why-science-is-not-just-facts',
      title: 'Why Science Is Not Just Facts',
      desc: 'A science-minded post exploring how curiosity, experimentation, and narrative shape what we call knowledge.',
      img: '/plus.png',
      catSlug: 'science',
      createdAt: new Date('2026-05-30T12:00:00Z'),
    },
    {
      slug: 'infiltration-by-design',
      title: 'Infiltration by Design',
      desc: 'A post on systems thinking, boundaries, and the subtle art of moving through guarded spaces.',
      img: '/plus.png',
      catSlug: 'infiltration',
      createdAt: new Date('2026-07-10T07:45:00Z'),
    },
    {
      slug: 'projects-in-a-digital-monastery',
      title: 'Projects in a Digital Monastery',
      desc: 'How simple routines and careful focus can turn curious experiments into lasting creative work.',
      img: '/plus.png',
      catSlug: 'projects',
      createdAt: new Date('2026-04-02T15:20:00Z'),
    },
    {
      slug: 'article-on-observing-the-world',
      title: 'Article on Observing the World',
      desc: 'A short meditation on paying attention, writing down what matters, and sharing ideas with honesty.',
      img: '/plus.png',
      catSlug: 'philosophy',
      createdAt: new Date('2026-06-01T11:00:00Z'),
    },
    {
      slug: 'science-of-uncertainty',
      title: 'Science of Uncertainty',
      desc: 'A scientific reflection on how doubt, mistake, and surprise are essential parts of learning.',
      img: '/plus.png',
      catSlug: 'science',
      createdAt: new Date('2026-03-28T14:05:00Z'),
    },
    // New posts to test ordering and button behavior
    {
      slug: 'programs-for-curiosity',
      title: 'Programs for Curiosity',
      desc: 'Designing small programs and exercises that help sustain curiosity and skill growth.',
      img: '/plus.png',
      catSlug: 'programs',
      createdAt: new Date('2026-02-14T09:00:00Z'),
    },
    {
      slug: 'small-habits-large-effects',
      title: 'Small Habits, Large Effects',
      desc: 'How tiny, repeatable practices compound into meaningful creative results over months.',
      img: '/plus.png',
      catSlug: 'programs',
      createdAt: new Date('2026-01-05T06:30:00Z'),
    },
    {
      slug: 'transient-infiltrations',
      title: 'Transient Infiltrations',
      desc: 'Short notes on safely exploring systems and what we learn when we disappear back out.',
      img: '/plus.png',
      catSlug: 'infiltration',
      createdAt: new Date('2026-07-25T19:00:00Z'),
    },
    {
      slug: 'reflective-projects',
      title: 'Reflective Projects',
      desc: 'A set of tactics for reflecting on and iterating small projects so they keep improving.',
      img: '/plus.png',
      catSlug: 'projects',
      createdAt: new Date('2026-08-05T20:15:00Z'),
    },
  ];

  const posts = [];
  for (const postData of samplePosts) {
    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      // If a createdAt is provided in the seed entry, update existing records to match for consistency
      update: postData.createdAt ? { createdAt: postData.createdAt } : {},
      create: {
        ...postData,
        userEmail: user.email,
      },
    });
    posts.push(post);
  }

  const sampleComments = [
    {
      id: 'comment1',
      desc: 'Great read — the mix of clear ideas and careful structure really helps this topic land.',
      userEmail: user.email,
      postSlug: 'the-article-that-matters',
    },
    {
      id: 'comment2',
      desc: 'This is a strong perspective on infiltration and privacy, thanks for sharing.',
      userEmail: user.email,
      postSlug: 'entering-the-shadow-web',
    },
    {
      id: 'comment3',
      desc: 'I appreciate the science framing here; uncertainty is often the most interesting part.',
      userEmail: user.email,
      postSlug: 'science-of-uncertainty',
    },
  ];

  for (const commentData of sampleComments) {
    await prisma.comment.upsert({
      where: { id: commentData.id },
      update: {},
      create: commentData,
    });
  }

  console.log({ user, categories: Object.keys(categoryMap), posts: posts.map((p) => p.slug), comments: sampleComments.map((c) => c.id) });
}

main()
  .catch((e)=>{ console.error(e); process.exit(1); })
  .finally(()=>prisma.$disconnect());
