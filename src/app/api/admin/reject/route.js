import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';
import { ensureCsrf } from '@/utils/csrf';

export const POST = async (req) => {
  const csrfError = ensureCsrf(req);
  if (csrfError) {
    return csrfError;
  }

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

    // default rejection: delete post. Could be changed to mark as rejected.
    await prisma.post.delete({ where: { slug } });

    // record moderation history for rejection
    try {
      await prisma.moderationHistory.create({
        data: {
          actorEmail: auth.email,
          targetUserEmail: post.userEmail,
          postSlug: slug,
          action: 'REJECT_POST',
          details: `Rejected and deleted post ${slug}`,
        }
      });
    } catch (e) {
      console.warn('failed writing moderation history', e);
    }

    return new NextResponse(JSON.stringify({ message: 'Rejected and deleted' }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Reject failed' }), { status: 500 });
  }
};
