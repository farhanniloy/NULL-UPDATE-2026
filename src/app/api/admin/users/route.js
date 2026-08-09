import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';

export const GET = async (req) => {
  const session = await getAuthSession();
  if (!session?.user?.email) return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
  const auth = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!auth || auth.role !== 'ADMIN') return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, username: true, role: true } });
    return new NextResponse(JSON.stringify({ users }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ message: 'Failed' }), { status: 500 });
  }
};