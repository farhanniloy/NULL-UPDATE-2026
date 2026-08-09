import styles from "./card.module.css";
import Link from "next/link";
import React from "react";

const Card = ({ item }) => {
    const createdAt = item?.createdAt
        ? new Date(item.createdAt).toISOString().substring(0, 10)
        : "";

    const summaryText = item?.summary ? String(item.summary).trim() : null;
    const rawText = item?.desc ? String(item.desc).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const excerpt = summaryText || rawText;
    const desc = excerpt ? excerpt.substring(0, 160) + (excerpt.length > 160 ? '...' : '') : '';

    return (
        <article className={styles.post}>
            <Link href={`/posts/${item.slug}`}>
                <h2 className={styles.title}>{item.title}</h2>
            </Link>

            <div className={styles.meta}>
                <span className={styles.category}>{String(item.catSlug || '').toLowerCase()}</span>
                <span className={styles.date}>{createdAt}</span>
            </div>
            <p className={styles.blogpostContent}>{desc}</p>
            <Link href={`/posts/${item.slug}`}>
                <button className={styles.button}>
                    <span>read more</span>
                </button>
            </Link>
        </article>
    );
}

export default Card