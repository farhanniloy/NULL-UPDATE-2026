import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';
import { ensureCsrf } from '@/utils/csrf';

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
  const auth = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!auth || auth.role !== 'ADMIN') return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

  try {
    const body = await req.json();
    const { email, username } = body;
    if (!email || !username) return new NextResponse(JSON.stringify({ message: 'Missing fields' }), { status: 400 });
    const newName = normalizeUsername(username);
    if (!newName) return new NextResponse(JSON.stringify({ message: 'Invalid username' }), { status: 400 });

    // ensure uniqueness
    const existing = await prisma.user.findUnique({ where: { username: newName } });
    if (existing && existing.email !== email) {
      return new NextResponse(JSON.stringify({ message: 'Username already taken' }), { status: 409 });
    }

    const updated = await prisma.user.update({ where: { email }, data: { username: newName } });

    try {
      await prisma.moderationHistory.create({ data: { actorEmail: session.user.email, targetUserEmail: email, action: 'ADMIN_CHANGE_USERNAME', details: `Changed username to ${newName}` } });
    } catch (e) { console.warn('failed writing moderation history', e); }

    return new NextResponse(JSON.stringify({ user: { email: updated.email, username: updated.username } }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Change username failed' }), { status: 500 });
  }
};