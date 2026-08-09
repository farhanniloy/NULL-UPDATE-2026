
export const dynamic = "force-dynamic";

import React from "react";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";
import prisma from "@/utils/connect";

const getData = async (page, cat) => {
    try {
        const POST_PER_PAGE = 10;
        const query = {
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (page - 1),
            where: {
                ...(cat && { catSlug: cat }),
                approved: true,
            },
            orderBy: { createdAt: "desc" },
        };

        const [posts, count] = await prisma.$transaction([
            prisma.post.findMany({
                ...query,
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    summary: true,
                    desc: true,
                    catSlug: true,
                    createdAt: true,
                },
            }),
            prisma.post.count({ where: query.where }),
        ]);

        return { posts, count };
    } catch (err) {
        console.error('Error fetching posts', err);
        return { posts: [], count: 0 };
    }
};

const CardList = async ({ page, cat, paginationPrefix = "" }) => {
    const { posts = [], count = 0 } = await getData(page, cat);

    const POST_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(count / POST_PER_PAGE));

    const hasPrev = POST_PER_PAGE * (page - 1) > 0;
    const hasNext = POST_PER_PAGE * (page - 1) + POST_PER_PAGE < count;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>latest posts</h1>
            <div className={styles.posts}>
                {(posts || []).map((item) => (
                    <Card item={item} key={item.id ?? item._id ?? item.slug} />
                ))}
            </div>
            <Pagination page={page} totalPages={totalPages} hasPrev={hasPrev} hasNext={hasNext} hrefPrefix={paginationPrefix} />
        </div>
    );
};

export default CardList;