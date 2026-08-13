export const dynamic = "force-dynamic";

import TerminalList from "@/components/postList/TerminalList";
import SiteTree from "@/components/siteTree/SiteTree";
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
    const categories = await prisma.category.findMany({ select: { title: true, slug: true } });
    const postsForCat = await prisma.post.findMany({
        where: {
            OR: [
                { catSlug: slug },
                { categories: { some: { categorySlug: slug } } },
            ],
            approved: true,
        },
        select: { title: true, slug: true },
        take: 30,
        orderBy: { createdAt: 'desc' },
    });

    const treeData = {
        name: 'Home',
        url: '/',
        children: [
            {
                name: 'Categories',
                children: categories.map((c) => ({ name: c.title, slug: c.slug, url: `/category/${encodeURIComponent(c.slug)}` })),
            },
        ],
    };

    // attach posts under the current category node so the tree shows the path to this page
    treeData.children[0].children = categories.map((c) => {
        const node = { name: c.title, slug: c.slug, url: `/category/${encodeURIComponent(c.slug)}` };
        if (c.slug === slug) {
            node.children = postsForCat.map((p) => ({ name: p.title, slug: p.slug, url: `/posts/${encodeURIComponent(p.slug)}` }));
        }
        return node;
    });

    return (
        <div className={styles.container}>
            <div className={styles.categoryHeader}>
                <span className={styles.kicker}>{'// CATEGORY_CHANNEL'}</span>
                <h1 className={styles.title}>{title}</h1>
                <span className={styles.marker}>FILTER: ACTIVE / ACCESS: PUBLIC</span>
            </div>

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
