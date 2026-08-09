import prisma from '@/utils/connect';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const revalidate = 3600;

export default async function sitemap() {
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { approved: true },
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
  ]);

  const staticRoutes = ['', '/about', '/blog', '/contact'];
  const routes = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  return [
    ...routes,
    ...categories.map((category) => ({
      url: `${siteUrl}/category/${encodeURIComponent(category.slug)}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/posts/${encodeURIComponent(post.slug)}`,
      lastModified: post.createdAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ];
}
