import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { ensureCsrf } from "@/utils/csrf";

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
            const comment = await prisma.comment.create({ data: { desc: body.desc, postSlug: body.postSlug, userEmail: session.user.email, ipAddr: ip } });
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

        // generate avatar URL using dicebear (no-download approach)
        const seed = encodeURIComponent(name + '|' + Math.random().toString(36).slice(2, 8));
        const avatar = `https://avatars.dicebear.com/api/identicon/${seed}.svg`;

        const comment = await prisma.comment.create({ data: { desc: body.desc, postSlug: body.postSlug, name, avatar, ipAddr: ip } });
        return new NextResponse(JSON.stringify(comment), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }),
            { status: 500 }
        );
    }
};