export const dynamic = "force-dynamic";

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

    return (
        <div className={styles.container}>
            <div className={styles.categoryHeader}>
                <span className={styles.kicker}>{'// CATEGORY_CHANNEL'}</span>
                <h1 className={styles.title}>{title}</h1>
                <span className={styles.marker}>FILTER: ACTIVE / ACCESS: PUBLIC</span>
            </div>
            <div className={styles.content}>
                <TerminalList page={page} cat={slug} paginationPrefix={`/category/${encodeURIComponent(slug)}`} />
            </div>
        </div>
    );
};

export default CategoryPage;
