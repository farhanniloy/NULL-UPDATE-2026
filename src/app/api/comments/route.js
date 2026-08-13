import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { ensureCsrf } from "@/utils/csrf";
import { makeAvatar, stableHash, styles } from "@/utils/avatars";

// GET ALL COMMENTS OF A POST
export const GET = async (req) => {
    const { searchParams } = new URL(req.url);

    const postSlug = searchParams.get("postSlug");

    try {
        const comments = await prisma.comment.findMany({
            where: {
                ...(postSlug && { postSlug }),
            },
            include: {
                user: {
                    select: { id: true, name: true, username: true, email: true, image: true },
                },
            },
        });

        return new NextResponse(JSON.stringify(comments), { status: 200 });
    } catch (err) {
        // console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }),
            { status: 500 }
        );
    }
};

// CREATE A COMMENT
export const POST = async (req) => {
    const csrfError = ensureCsrf(req);
    if (csrfError) {
        return csrfError;
    }

    const session = await getAuthSession();

    try {
        const body = await req.json();

        // rate-limit comments: max 5 per day per author (by userEmail if logged-in, otherwise by ip+name)
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const start = new Date();
        start.setUTCHours(0,0,0,0);
        const end = new Date();
        end.setUTCHours(23,59,59,999);

        if (session && session.user && session.user.email) {
            const count = await prisma.comment.count({ where: { userEmail: session.user.email, createdAt: { gte: start, lte: end } } });
            if (count >= 5) {
                return new NextResponse(JSON.stringify({ message: 'Comment rate limit reached (5 per day)' }), { status: 429 });
            }

            // If the user doesn't have a profile image, assign a deterministic DiceBear avatar and store it on the comment

            let avatarUrl = null;
            // prefer user's profile image if available (on the client UI the user image is shown when present)
            if (!session.user.image) {
                const seed = session.user.email || session.user.id || JSON.stringify(session.user);
                avatarUrl = makeAvatar(seed);
            }

            const comment = await prisma.comment.create({ data: { desc: body.desc, postSlug: body.postSlug, userEmail: session.user.email, ipAddr: ip, ...(avatarUrl ? { avatar: avatarUrl } : {}) } });
            return new NextResponse(JSON.stringify(comment), { status: 200 });
        }

        // anonymous commenter: require name and desc
        const name = (body.name || '').trim();
        if (!name) return new NextResponse(JSON.stringify({ message: 'Name required for anonymous comments' }), { status: 400 });
        if (!body.desc || !body.postSlug) return new NextResponse(JSON.stringify({ message: 'Missing fields' }), { status: 400 });

        // count anonymous comments today by ip
        const anonCount = await prisma.comment.count({ where: { ipAddr: ip, createdAt: { gte: start, lte: end } } });
        if (anonCount >= 5) {
            return new NextResponse(JSON.stringify({ message: 'Comment rate limit reached for this IP (5 per day)' }), { status: 429 });
        }

        // Use cookie-based anon seed so avatar stays stable across IP changes
        const cookieHeader = req.headers.get('cookie') || '';
        const getCookie = (name) => {
            const pairs = cookieHeader.split(';').map(s => s.trim()).filter(Boolean);
            for (const p of pairs) {
                const [k, v] = p.split('=');
                if (k === name) return decodeURIComponent(v || '');
            }
            return null;
        };
        let anonId = getCookie('anon_id');
        let setAnonCookie = false;
        if (!anonId) {
            anonId = 'anon_' + Math.random().toString(36).slice(2, 10);
            setAnonCookie = true;
        }

        // deterministic avatar assignment using DiceBear (seeded by name+anonId so it's stable per browser)
        const seed = `${name}|${anonId}`;
        const avatar = makeAvatar(seed);

        const comment = await prisma.comment.create({ data: { desc: body.desc, postSlug: body.postSlug, name, avatar, ipAddr: ip } });

        const res = new NextResponse(JSON.stringify(comment), { status: 200 });
        if (setAnonCookie) {
            // set a persistent cookie for 1 year
            res.headers.set('Set-Cookie', `anon_id=${encodeURIComponent(anonId)}; Path=/; Max-Age=31536000; SameSite=Lax`);
        }
        return res;
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }),
            { status: 500 }
        );
    }
};