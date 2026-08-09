import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';

export const GET = async (req) => {
  const session = await getAuthSession();
  if (!session?.user?.email) return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
  const auth = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'MODERATOR')) {
    return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  try {
    const pending = await prisma.post.findMany({
      where: { approved: false },
      include: { user: { select: { name: true, username: true, email: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return new NextResponse(JSON.stringify({ posts: pending }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Failed to load pending posts' }), { status: 500 });
  }
};
