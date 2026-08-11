export const dynamic = "force-dynamic";

import React from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/utils/connect";

const defaultCategories = [
    { slug: 'philosophy', title: 'Philosophy' },
    { slug: 'infiltration', title: 'Infiltration' },
    { slug: 'science', title: 'Science' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'projects', title: 'Projects' },
];

// Simple in-memory cache for categories to reduce DB load. TTL in ms.
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
let categoriesCache = null;
let categoriesCacheAt = 0;

const getData = async () => {
    try {
        const now = Date.now();
        if (categoriesCache && (now - categoriesCacheAt) < CACHE_TTL) {
            return categoriesCache;
        }

        // Query only the fields needed and include a count of linked posts via PostCategory
        // Try to let the DB order by the relation count. If the Prisma client or DB doesn't
        // support ordering by relation count in this environment, gracefully fall back to
        // fetching the counts and sorting in JS.
        let categories;
        try {
            categories = await prisma.category.findMany({
                select: { id: true, slug: true, title: true, img: true, _count: { select: { postCategories: true } } },
                orderBy: { _count: { postCategories: 'desc' } },
            });
        } catch (dbOrderErr) {
            // Fallback: fetch without DB ordering and sort in JS
            console.warn('DB ordering by _count failed, falling back to client-side sort:', dbOrderErr.message || dbOrderErr);
            categories = await prisma.category.findMany({
                select: { id: true, slug: true, title: true, img: true, _count: { select: { postCategories: true } } },
            });
            categories.sort((a, b) => (b._count?.postCategories || 0) - (a._count?.postCategories || 0));
        }

        if (!categories || categories.length === 0) {
            categoriesCache = defaultCategories;
            categoriesCacheAt = now;
            return defaultCategories;
        }

        categoriesCache = categories;
        categoriesCacheAt = now;
        return categories;
    } catch (err) {
        console.error('Failed to fetch categories', err);
        return defaultCategories;
    }
};

const CategoryList = async () => {
    const data = await getData();

    // Use the order returned by getData (which is ordered by post count descending).
    const ordered = data || [];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>categories</h1>
            <div className={styles.categories}>
                {(ordered || []).map((item) => (
                    <Link
                        href={`/category/${encodeURIComponent(item.slug)}`}
                        className={`${styles.category} ${styles[item.slug]}`}
                        key={item.id ?? item._id ?? item.slug}
                    >
                        {item.img && (
                            <Image
                                src={item.img}
                                alt=""
                                width={32}
                                height={32}
                                className={styles.image}
                            />
                        )}
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;