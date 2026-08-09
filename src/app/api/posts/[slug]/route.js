import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/utils/auth";
import { sanitizePostHtml } from "@/utils/sanitizeHtml";
import { getSafePostImageUrl } from "@/utils/imageUrl";
import { ensureCsrf } from "@/utils/csrf";
import { revalidatePath } from "next/cache";

// GET SINGLE POST (increments views)
export const GET = async (req, { params }) => {
    const { slug } = await params;

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            include: { user: { select: { id: true, name: true, username: true, email: true, image: true } } },
        });
        if (!post) return new NextResponse(JSON.stringify({ message: 'Not found' }), { status: 404 });

        const session = await getAuthSession();
        let authUser = null;
        if (session?.user?.email) {
            authUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        }

        // restrict unapproved posts
        if (!post.approved && !(authUser?.role === 'ADMIN' || session?.user?.email === post.userEmail)) {
            return new NextResponse(JSON.stringify({ message: 'Not found' }), { status: 404 });
        }

        // increment views
        await prisma.post.update({ where: { slug }, data: { views: { increment: 1 } } });

        return new NextResponse(JSON.stringify(post), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }),
            { status: 500 }
        );
    }
};

// UPDATE POST (only post owner)
export const PUT = async (req, { params }) => {
    const csrfError = ensureCsrf(req);
    if (csrfError) {
        return csrfError;
    }

    const session = await getAuthSession();
    if (!session || !session.user?.email) {
        return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
    }
    const authUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!authUser) {
        return new NextResponse(JSON.stringify({ message: 'Not authenticated: user not found' }), { status: 401 });
    }

    const { slug } = await params;

    try {
        const body = await req.json();
        const post = await prisma.post.findUnique({ where: { slug } });
        if (!post) {
            return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
        }
        // allow update if owner or admin
        const isAdmin = authUser?.role === 'ADMIN';
        if (post.userEmail !== session.user.email && !isAdmin) {
            return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        // If a new category is provided, create it and use it.
        let finalCat = post.catSlug;
        if (body.newCategory && body.newCategory.trim()) {
            const newCatSlug = slugify(body.newCategory);
            await prisma.category.upsert({
                where: { slug: newCatSlug },
                update: {},
                create: {
                    slug: newCatSlug,
                    title: body.newCategory.trim(),
                },
            });
            finalCat = newCatSlug;
        } else if (body.catSlug && body.catSlug !== post.catSlug) {
            const existingCat = await prisma.category.findUnique({ where: { slug: body.catSlug } });
            if (!existingCat) {
                await prisma.category.create({ data: { slug: body.catSlug, title: body.catSlug } });
            }
            finalCat = body.catSlug;
        }

        let finalSlug = post.slug;
        if (body.slug !== undefined) {
            finalSlug = slugify(body.slug);
            if (!finalSlug) {
                return new NextResponse(JSON.stringify({ message: 'Slug cannot be empty' }), { status: 400 });
            }
            const slugOwner = await prisma.post.findUnique({ where: { slug: finalSlug } });
            if (slugOwner && slugOwner.id !== post.id) {
                return new NextResponse(JSON.stringify({ message: 'That slug is already in use' }), { status: 409 });
            }
        }

        const updateData = {
            title: body.title ?? post.title,
            summary: body.summary ?? post.summary,
            desc: body.desc !== undefined ? sanitizePostHtml(body.desc) : post.desc,
            img: body.img !== undefined ? getSafePostImageUrl(body.img) : post.img,
            catSlug: finalCat,
            slug: finalSlug,
        };

        // Allow updating createdAt if provided
        if (body.createdAt) {
            const parsedCreatedAt = new Date(body.createdAt);
            if (!Number.isNaN(parsedCreatedAt.valueOf())) {
                updateData.createdAt = parsedCreatedAt;
            }
        }

        const updated = await prisma.post.update({
            where: { slug },
            data: updateData,
        });
        revalidatePath(`/posts/${updated.slug}`);
        revalidatePath("/");

        return new NextResponse(JSON.stringify(updated), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    const csrfError = ensureCsrf(req);
    if (csrfError) {
        return csrfError;
    }

    const session = await getAuthSession();
    if (!session || !session.user?.email) {
        return new NextResponse(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
    }
    const authUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!authUser) {
        return new NextResponse(JSON.stringify({ message: 'Not authenticated: user not found' }), { status: 401 });
    }

    const { slug } = await params;
    try {
        const post = await prisma.post.findUnique({ where: { slug } });
        if (!post) {
            return new NextResponse(JSON.stringify({ message: 'Post not found' }), { status: 404 });
        }
        // allow delete if owner or admin
        const isAdmin = authUser?.role === 'ADMIN';
        if (post.userEmail !== session.user.email && !isAdmin) {
            return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }
        await prisma.post.delete({ where: { slug } });
        return new NextResponse(JSON.stringify({ message: 'Post deleted' }), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
    }
};

function slugify(str) {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
