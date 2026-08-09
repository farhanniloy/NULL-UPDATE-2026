import { NextResponse } from 'next/server';
import prisma from '@/utils/connect';

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    const normalized = username.startsWith('@') ? username.slice(1) : username;
    if (!normalized) return new NextResponse(JSON.stringify({ available: false }), { status: 200 });

    const existing = await prisma.user.findUnique({ where: { username: normalized } });
    return new NextResponse(JSON.stringify({ available: !existing }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ available: false }), { status: 500 });
  }
};