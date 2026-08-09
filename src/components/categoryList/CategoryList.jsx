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

const getData = async () => {
    try {
        const categories = await prisma.category.findMany();

        if (!categories || categories.length === 0) {
            await prisma.category.createMany({
                data: defaultCategories,
                skipDuplicates: true,
            });
            return await prisma.category.findMany();
        }

        return categories;
    } catch (err) {
        console.error('Failed to fetch categories', err);
        return defaultCategories;
    }
};

const CategoryList = async () => {
    const data = await getData();

    // Desired display order for categories
    const desiredOrder = ['philosophy', 'infiltration', 'science', 'programs', 'projects'];

    // Build an ordered array: categories appearing in desiredOrder first (in that order), then any others
    const ordered = (
        desiredOrder
            .map((slug) => data.find((d) => d.slug === slug))
            .filter(Boolean)
    ).concat((data || []).filter((d) => !desiredOrder.includes(d.slug)));

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Categories</h1>
            <div className={styles.categories}>
                {(ordered || []).map((item) => (
                    <Link
                        href={`/blog?cat=${item.slug}`}
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
                        {item.title}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;