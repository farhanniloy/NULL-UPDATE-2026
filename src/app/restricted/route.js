export async function GET() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>503 Service Unavailable</title></head><body style="font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#08120a; color:#cdebd3; display:flex; align-items:center; justify-content:center; height:100vh;">
  <div style="text-align:center; max-width:640px; padding:24px;">
    <h1 style="font-size:28px; margin-bottom:12px;">503 — Restricted</h1>
    <p style="opacity:0.9;">The requested resource is temporarily unavailable or restricted. If you believe this is an error, please sign in with an authorized account.</p>
  </div>
</body></html>`;
  return new Response(html, { status: 503, headers: { 'content-type': 'text/html' } });
}
