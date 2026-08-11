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
            include: {
                user: { select: { id: true, name: true, username: true, email: true, image: true } },
                categories: { select: { categorySlug: true } },
            },
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

        const selectedCategories = Array.isArray(body.catSlugs)
            ? body.catSlugs.map((category) => slugify(category)).filter(Boolean)
            : (body.catSlug ? [slugify(body.catSlug)] : [post.catSlug]);
        if (body.newCategory?.trim()) selectedCategories.push(slugify(body.newCategory));
        const finalCategorySlugs = [...new Set(selectedCategories)].filter(Boolean);
        const finalCat = finalCategorySlugs[0] || post.catSlug;

        await Promise.all(finalCategorySlugs.map((categorySlug) => prisma.category.upsert({
            where: { slug: categorySlug },
            update: {},
            create: {
                slug: categorySlug,
                title: categorySlug === slugify(body.newCategory || '')
                    ? body.newCategory.trim()
                    : categorySlug,
            },
        })));

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
        await prisma.postCategory.deleteMany({ where: { postId: post.id } });
        await prisma.postCategory.createMany({
            data: finalCategorySlugs.map((categorySlug) => ({ postId: post.id, categorySlug })),
        });
        revalidatePath(`/posts/${slug}`);
        revalidatePath(`/posts/${updated.slug}`);
        revalidatePath("/");

        return new NextResponse(JSON.stringify(updated), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(JSON.stringify({ message: 'Something went wrong', error: err.message }), { status: 500 });
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
