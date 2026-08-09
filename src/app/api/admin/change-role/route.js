import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';

export const POST = async (req) => {
  const session = await getAuthSession();
  if (!session?.user?.email) return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
  const auth = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, role, reason } = body;
    if (!email || !role) return new NextResponse(JSON.stringify({ message: 'Missing parameters' }), { status: 400 });

    // validate role
    const validRoles = ['USER', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(role)) return new NextResponse(JSON.stringify({ message: 'Invalid role' }), { status: 400 });

    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) return new NextResponse(JSON.stringify({ message: 'Target user not found' }), { status: 404 });

    const updated = await prisma.user.update({ where: { email }, data: { role } });

    // record moderation history
    try {
      await prisma.moderationHistory.create({
        data: {
          actorEmail: auth.email,
          targetUserEmail: email,
          action: 'CHANGE_ROLE',
          details: `Changed role to ${role}` + (reason ? `; reason: ${reason}` : ''),
        }
      });
    } catch (e) {
      console.warn('failed writing moderation history', e);
    }

    return new NextResponse(JSON.stringify({
      user: { id: updated.id, email: updated.email, name: updated.name, username: updated.username, role: updated.role },
    }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Change role failed' }), { status: 500 });
  }
};
