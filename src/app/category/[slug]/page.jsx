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
    const categories = await prisma.category.findMany({ select: { title: true, slug: true } });
    // Build path-style tree: / -> /home -> /home/<category>
    const treeData = {
        name: '/root',
        url: '/',
        children: [
            {
                name: '/root/home',
                url: '/',
                children: categories.map((c) => ({ name: `/root/home/${c.slug}`, slug: c.slug, url: `/category/${encodeURIComponent(c.slug)}` })),
            },
        ],
    };

    // Only show the tree up to the category node (no posts beneath it)
    treeData.children[0].children = categories.map((c) => ({
        name: `/root/home/${c.slug}`,
        slug: c.slug,
        url: `/category/${encodeURIComponent(c.slug)}`,
    }));

    return (
        <div className={styles.container}>
            {/* category header removed as requested */}

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
