import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getAuthSession } from '@/utils/auth';
import prisma from '@/utils/connect';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const allowedTypes = {
  jpg: { mime: 'image/jpeg', magic: (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
  jpeg: { mime: 'image/jpeg', magic: (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
  png: { mime: 'image/png', magic: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  gif: { mime: 'image/gif', magic: (buffer) => buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a' },
  webp: { mime: 'image/webp', magic: (buffer) => buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP' },
};

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
    }

    const body = await req.json();
    // Expecting { filename, data } where data is a data URL or base64 string
    const { filename, data } = body;
    if (!filename || !data) {
      return new Response(JSON.stringify({ message: 'Invalid payload' }), { status: 400 });
    }

    const extension = path.extname(filename).slice(1).toLowerCase();
    const type = allowedTypes[extension];
    if (!type) {
      return new Response(JSON.stringify({ message: 'Only JPEG, PNG, GIF, and WebP images are allowed' }), { status: 400 });
    }

    let base64;
    let declaredMime;
    if (data.startsWith('data:')) {
      const match = data.match(/^data:([^;,]+);base64,(.+)$/s);
      if (!match) {
        return new Response(JSON.stringify({ message: 'Invalid image data' }), { status: 400 });
      }
      declaredMime = match[1].toLowerCase();
      base64 = match[2];
    } else {
      base64 = data;
    }

    if (declaredMime && declaredMime !== type.mime) {
      return new Response(JSON.stringify({ message: 'Image type does not match its extension' }), { status: 400 });
    }

    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > MAX_UPLOAD_SIZE || !type.magic(buffer)) {
      return new Response(JSON.stringify({ message: 'Invalid or oversized image' }), { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeName = `${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${safeName}`;
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Upload failed' }), { status: 500 });
  }
}
