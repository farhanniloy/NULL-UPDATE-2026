import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';

export const POST = async (req) => {
  const session = await getAuthSession();
  if (!session?.user?.email) return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
  const auth = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'MODERATOR')) {
    return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await req.json();
    const { slug } = body;
    if (!slug) return new NextResponse(JSON.stringify({ message: 'Missing slug' }), { status: 400 });

    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post) return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });

    // mark approved
    const updated = await prisma.post.update({ where: { slug }, data: { approved: true } });

    // record moderation history
    try {
      await prisma.moderationHistory.create({
        data: {
          actorEmail: auth.email,
          targetUserEmail: post.userEmail,
          postSlug: slug,
          action: 'APPROVE_POST',
          details: `Approved post ${slug}`,
        }
      });
    } catch (e) {
      console.warn('failed writing moderation history', e);
    }

    // After approving, check if author should be auto-promoted to MODERATOR
    try {
      const author = await prisma.user.findUnique({ where: { email: post.userEmail } });
      if (author && author.role === 'USER') {
        const approvedCount = await prisma.post.count({ where: { userEmail: author.email, approved: true } });
        const PROMOTION_THRESHOLD = 3; // configurable: promote after 3 approved posts
        if (approvedCount >= PROMOTION_THRESHOLD) {
          await prisma.user.update({ where: { email: author.email }, data: { role: 'MODERATOR' } });

          // record promotion in moderation history
          try {
            await prisma.moderationHistory.create({
              data: {
                actorEmail: auth.email,
                targetUserEmail: author.email,
                action: 'PROMOTE_TO_MODERATOR',
                details: `Auto-promoted after ${approvedCount} approved posts`,
              }
            });
          } catch (e) {
            console.warn('failed writing promotion history', e);
          }
        }
      }
    } catch (e) {
      console.warn('promotion check failed', e);
    }

    return new NextResponse(JSON.stringify({ post: updated }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Approval failed' }), { status: 500 });
  }
};
