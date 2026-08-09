import { NextResponse } from 'next/server';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getRequestOrigin(req) {
  const originHeader = req.headers.get('origin');
  if (originHeader) return originHeader;

  const refererHeader = req.headers.get('referer');
  if (refererHeader) {
    try {
      return new URL(refererHeader).origin;
    } catch {
      return null;
    }
  }

  return null;
}

function getExpectedOrigin(req) {
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'http';
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');

  if (!forwardedHost) return null;

  return `${forwardedProto}://${forwardedHost}`;
}

export function ensureCsrf(req) {
  if (!STATE_CHANGING_METHODS.has(req.method?.toUpperCase())) {
    return null;
  }

  const requestOrigin = getRequestOrigin(req);
  const expectedOrigin = getExpectedOrigin(req);

  if (!requestOrigin || !expectedOrigin) {
    return new NextResponse(JSON.stringify({ message: 'Invalid CSRF request' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const requestUrl = new URL(requestOrigin);
    const expectedUrl = new URL(expectedOrigin);
    const sameOrigin = requestUrl.origin === expectedUrl.origin;

    if (sameOrigin) {
      return null;
    }
  } catch {
    // Fall through to the forbidden response.
  }

  return new NextResponse(JSON.stringify({ message: 'Invalid CSRF request' }), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}
