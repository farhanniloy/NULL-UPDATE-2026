export const dynamic = "force-dynamic";

import CardList from "@/components/cardList/CardList";
import styles from "./blogPage.module.css";

export const metadata = {
    title: "Blog",
    description: "Explore the latest posts on philosophy, technology, security, science, and curious ideas.",
    alternates: { canonical: "/blog" },
};

const BlogPage = async ({ searchParams }) => {
    const params = await searchParams;
    const page = parseInt(params?.page, 10) || 1;
    const { cat } = params || {};
    const title = cat ? `${cat} Blog` : "Blog";

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.content}>
                <CardList page={page} cat={cat}/>
            </div>
        </div>
    );
};

export default BlogPage;