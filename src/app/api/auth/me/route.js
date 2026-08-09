import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';

export const GET = async (req) => {
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return new NextResponse(JSON.stringify({ message: 'User not found' }), { status: 401 });
  }
  // Return minimal public-safe user object
  const safe = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    image: user.image,
  };
  return new NextResponse(JSON.stringify({ user: safe }), { status: 200 });
};
