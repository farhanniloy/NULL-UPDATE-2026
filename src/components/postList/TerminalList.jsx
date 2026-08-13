export const dynamic = "force-dynamic";

import React from 'react';
import styles from './terminal.module.css';
import Link from 'next/link';
import Pagination from '../pagination/Pagination';
import prisma from '@/utils/connect';

const getData = async (page, cat) => {
    try {
        const POST_PER_PAGE = 10;
        const query = {
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (page - 1),
            where: {
                ...(cat && {
                    OR: [
                        { catSlug: cat },
                        { categories: { some: { categorySlug: cat } } },
                    ],
                }),
                approved: true,
            },
            orderBy: { createdAt: 'desc' },
        };

        const [posts, count] = await prisma.$transaction([
            prisma.post.findMany({ ...query, include: { categories: true } }),
            prisma.post.count({ where: query.where }),
        ]);

        return { posts, count };
    } catch (err) {
        console.error('Error fetching posts', err);
        return { posts: [], count: 0 };
    }
};

const fmtDate = (iso) => {
    try {
        const d = new Date(iso);
        return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
};

const pad = (s, len = 6) => String(s).padStart(len, ' ');

const TerminalList = async ({ page = 1, cat, paginationPrefix = '' }) => {
    const { posts = [], count = 0 } = await getData(page, cat);
    const POST_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(count / POST_PER_PAGE));
    const hasPrev = POST_PER_PAGE * (page - 1) > 0;
    const hasNext = POST_PER_PAGE * (page - 1) + POST_PER_PAGE < count;

    return (
        <div className={styles.container}>
            <div className={styles.headerRow} aria-hidden>
                <span className={styles.perm}>mode</span>
                <span className={styles.size}>size</span>
                <span className={styles.user}>owner</span>
                <span className={styles.date}>date</span>
                <span className={styles.name}>name</span>
            </div>
            <div className={styles.list}>
                {posts.map((item) => (
                    <div className={styles.row} key={item.id}>
                        <span className={styles.perm}>-rw-r--r--</span>
                        <span className={styles.size}>{pad(item.views ?? 0, 6)}</span>
                        <span className={styles.user}>farhan</span>
                        <span className={styles.date}>{fmtDate(item.createdAt)}</span>
                        <span className={styles.name}>
                            <Link href={`/posts/${encodeURIComponent(item.slug)}`} className={styles.link}>
                                <span className={styles.fsSlash}>/</span>
                                <span className={styles.filename}>{item.title}</span>
                            </Link>
                        </span>
                    </div>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} hasPrev={hasPrev} hasNext={hasNext} hrefPrefix={paginationPrefix} />
        </div>
    );
};

export default TerminalList;
