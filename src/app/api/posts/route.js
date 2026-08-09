import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { sanitizePostHtml } from "@/utils/sanitizeHtml";
import { getSafePostImageUrl } from "@/utils/imageUrl";
import { ensureCsrf } from "@/utils/csrf";

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page"), 10) || 1;
    const cat = searchParams.get("cat");

    const POST_PER_PAGE = 10;

    // Determine whether to show only approved posts
    const session = await getAuthSession();
    let authUser = null;
    try {
        if (session?.user?.email) {
            authUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        }
    } catch (e) { console.warn('auth lookup failed', e); }

    const query = {
        take: POST_PER_PAGE,
        skip: POST_PER_PAGE * (page - 1),
        where: {
            ...(cat && { catSlug: cat }),
            // show only approved posts to non-admin users
            ...(authUser?.role !== 'ADMIN' && { approved: true }),
        },
        orderBy: {
            createdAt: 'desc'
        }
    };








    try {
        const [posts, count] = await prisma.$transaction([
            prisma.post.findMany(query),
            prisma.post.count({ where: query.where }),
        ]);
        return new NextResponse(JSON.stringify({ posts, count }), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }),
            { status: 500 }
        );
    }
};










// CREATE A POST
export const POST = async (req) => {
    const csrfError = ensureCsrf(req);
    if (csrfError) {
        return csrfError;
    }

    const session = await getAuthSession();

    if (!session || !session.user?.email) {
        return new NextResponse(
            JSON.stringify({ message: "Not Authenticated!" }), { status: 401 }
        );
    }

    // ensure the session corresponds to a real user in the database
    const authUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!authUser) {
        return new NextResponse(
            JSON.stringify({ message: "Not Authenticated: user not found" }), { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { title, summary, desc, img, slug, catSlug, createdAt, newCategory } = body;

        if (!title || !desc) {
            return new NextResponse(
                JSON.stringify({ message: "Missing title or description" }), { status: 400 }
            );
        }

        // Generate a clean slug from title or provided slug.
        let baseSlug = slug?.trim() ? slugify(slug) : slugify(title);
        let finalSlug = baseSlug;
        let existingPost = await prisma.post.findUnique({ where: { slug: finalSlug } });
        while (existingPost) {
            finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
            existingPost = await prisma.post.findUnique({ where: { slug: finalSlug } });
        }

        let finalCatSlug = catSlug?.trim() ? slugify(catSlug) : '';
        let categoryTitle = finalCatSlug;

        if (newCategory && newCategory.trim()) {
            finalCatSlug = slugify(newCategory);
            categoryTitle = newCategory.trim();
        }

        if (!finalCatSlug) {
            finalCatSlug = 'philosophy';
            categoryTitle = 'Philosophy';
        }

        await prisma.category.upsert({
            where: { slug: finalCatSlug },
            update: {},
            create: {
                slug: finalCatSlug,
                title: categoryTitle || finalCatSlug.charAt(0).toUpperCase() + finalCatSlug.slice(1),
            },
        });

        let publishedAt = new Date();
        if (createdAt) {
            const parsed = new Date(createdAt);
            if (!Number.isNaN(parsed.valueOf())) {
                publishedAt = parsed;
            }
        }

        // enforce daily post limit (5 per user)
        const startOfDay = new Date(publishedAt);
        startOfDay.setUTCHours(0,0,0,0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23,59,59,999);
        const todayCount = await prisma.post.count({
            where: { userEmail: session.user.email, createdAt: { gte: startOfDay, lte: endOfDay } }
        });
        if (todayCount >= 5) {
            return new NextResponse(JSON.stringify({ message: 'Post limit reached for today (5)' }), { status: 429 });
        }

        // determine approval: admins auto-approve, others require moderation
        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.email === 'root@localhost';
        const approved = !!isAdmin;

        const post = await prisma.post.create({
            data: {
                title,
                summary: summary?.trim() || null,
                desc: sanitizePostHtml(desc),
                img: getSafePostImageUrl(img),
                slug: finalSlug,
                catSlug: finalCatSlug,
                userEmail: session.user.email,
                createdAt: publishedAt,
                approved,
            }
        });

        return new NextResponse(JSON.stringify(post), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong! " + err.message }),
            { status: 500 }
        );
    }
};

// Helper function to slugify
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}