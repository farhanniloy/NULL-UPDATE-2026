export const dynamic = "force-dynamic";

import SiteTree from "@/components/siteTree/SiteTree";
import TerminalList from "@/components/postList/TerminalList";
import styles from "./categoryPage.module.css";
import prisma from "@/utils/connect";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
        where: { slug },
        select: { title: true },
    });
    const title = category?.title || slug.replace(/-/g, " ");

    return {
        title: `${title} posts`,
        description: `Browse posts in the ${title} category on Null.`,
        alternates: { canonical: `/category/${encodeURIComponent(slug)}` },
    };
}

const CategoryPage = async ({ params, searchParams }) => {
    const { slug } = await params;
    const query = await searchParams;
    const page = parseInt(query?.page, 10) || 1;
    const category = await prisma.category.findUnique({ where: { slug } });
    const title = category?.title || slug.replace(/-/g, " ");

    // build a lightweight site-tree data structure: top -> categories -> current category -> posts
    // Fetch categories using DB ordering where possible. Use a short-lived cache to avoid repeated DB hits.
    let orderedCategories = [];
    try {
        const fetcher = async () => {
            try {
                return await prisma.category.findMany({
                    select: { id: true, slug: true, title: true, _count: { select: { postCategories: true } } },
                    orderBy: { _count: { postCategories: 'desc' } },
                });
            } catch (dbOrderErr) {
                console.warn('DB ordering for tree failed, falling back to client-side sort', dbOrderErr?.message || dbOrderErr);
                const list = await prisma.category.findMany({ select: { id: true, slug: true, title: true, _count: { select: { postCategories: true } } } });
                list.sort((a, b) => (b._count?.postCategories || 0) - (a._count?.postCategories || 0));
                return list;
            }
        };
        const siteCache = await import('@/utils/siteCache');
        orderedCategories = await siteCache.getCachedCategories('orderedCategories', 300, fetcher);
    } catch (err) {
        console.error('Error fetching ordered categories for tree', err);
        orderedCategories = [];
    }

    // Build path-style tree: /root -> /root/home -> /root/home/<category>
    const treeData = {
        name: '/root',
        url: '/',
        children: [
            {
                name: '/root/home',
                url: '/',
                children: orderedCategories.map((c) => ({ name: `/root/home/${c.slug}`, slug: c.slug, url: `/category/${encodeURIComponent(c.slug)}` })),
            },
        ],
    };

    // Only show the tree up to the category node (no posts beneath it)
    treeData.children[0].children = orderedCategories.map((c) => ({
        name: `/root/home/${c.slug}`,
        slug: c.slug,
        url: `/category/${encodeURIComponent(c.slug)}`,
    }));

    return (
        <div className={styles.container}>
            <div className={styles.treeWrapper}>
                <SiteTree treeData={treeData} highlightSlug={slug} />
            </div>

            <div className={styles.content}>
                <TerminalList page={page} cat={slug} paginationPrefix={`/category/${encodeURIComponent(slug)}`} />
            </div>
        </div>
    );
};

export default CategoryPage;
