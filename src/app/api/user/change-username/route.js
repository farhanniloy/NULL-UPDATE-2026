import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';
import { ensureCsrf } from '@/utils/csrf';

// sanitize and normalize username
function normalizeUsername(input){
  if (!input || typeof input !== 'string') return null;
  let s = input.trim();
  if (s.startsWith('@')) s = s.slice(1);
  s = s.toLowerCase();
  s = s.replace(/\s+/g, '-');
  s = s.replace(/[^a-z0-9-_]/g, '');
  if (!s) return null;
  return s;
}

export const POST = async (req) => {
  const csrfError = ensureCsrf(req);
  if (csrfError) {
    return csrfError;
  }

  const session = await getAuthSession();
  if (!session?.user?.email) return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });

  try {
    const body = await req.json();
    const { username } = body;
    const newName = normalizeUsername(username);
    if (!newName) return new NextResponse(JSON.stringify({ message: 'Invalid username' }), { status: 400 });

    // ensure uniqueness
    const existing = await prisma.user.findUnique({ where: { username: newName } });
    if (existing && existing.email !== session.user.email) {
      return new NextResponse(JSON.stringify({ message: 'Username already taken' }), { status: 409 });
    }

    const updated = await prisma.user.update({ where: { email: session.user.email }, data: { username: newName } });

    // update NextAuth token / session is handled by next-auth on next request; we can also write a moderation record
    try {
      await prisma.moderationHistory.create({ data: {
        actorEmail: session.user.email,
        targetUserEmail: session.user.email,
        action: 'CHANGE_USERNAME',
        details: `Changed username to ${newName}`,
      }});
    } catch (e) {
      console.warn('failed writing moderation history for username change', e);
    }

    return new NextResponse(JSON.stringify({ user: { email: updated.email, username: updated.username } }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Change username failed' }), { status: 500 });
  }
};
