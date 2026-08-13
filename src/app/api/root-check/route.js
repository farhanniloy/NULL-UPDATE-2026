import { getAuthSession } from '@/utils/auth';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.email) {
      return new Response(JSON.stringify({ allowed: false }), { status: 503, headers: { 'content-type': 'application/json' } });
    }

    // allow any authenticated user to go to their profile
    const username = session.user.username || session.user.name || session.user.email;
    const redirect = `/u/${encodeURIComponent(username)}`;
    return new Response(JSON.stringify({ allowed: true, redirect }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    console.error('root-check error', e);
    return new Response(JSON.stringify({ allowed: false }), { status: 503, headers: { 'content-type': 'application/json' } });
  }
}
