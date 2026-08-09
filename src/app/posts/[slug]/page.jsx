export const dynamic = "force-dynamic";

import styles from "./singlePage.module.css";
import Image from "next/image";
import Link from 'next/link';
import Comments from "@/components/comments/Comments";

import prisma from "@/utils/connect";

import { getAuthSession } from '@/utils/auth';
import AdminPostControls from '@/components/admin/AdminPostControls';
import { sanitizePostHtml } from '@/utils/sanitizeHtml';

const getData = async (slug) => {
    try {
        // fetch post without incrementing first
        const post = await prisma.post.findUnique({
            where: { slug },
            include: { user: { select: { name: true, username: true, email: true, image: true } } },
        });
        return post;
    } catch (err) {
        console.error('Error fetching post', err);
        return null;
    }
};

const SinglePage = async ({ params }) => {
    const { slug } = params;

    const data = await getData(slug);
    const session = await getAuthSession();
    // restrict viewing unapproved posts to owner or admin
    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.infoContainer}>
                    <Link href="/" className={styles.top}>
                        <div className={styles.back}>
                            <p><span className={styles.baack}>&#8617;</span> back to home</p>
                        </div>
                    </Link>
                    <div className={styles.textContainer}>
                        <h2 className={styles.title}>Post not found</h2>
                        <p>Could not load this post. Please try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.email === data.userEmail;
    const isAdmin = !!(session && session.user && (await prisma.user.findUnique({ where: { email: session.user.email } }))?.role === 'ADMIN');

    if (!data.approved && !isOwner && !isAdmin) {
        return (
            <div className={styles.container}>
                <div className={styles.infoContainer}>
                    <Link href="/" className={styles.top}>
                        <div className={styles.back}>
                            <p><span className={styles.baack}>&#8617;</span> back to home</p>
                        </div>
                    </Link>
                    <div className={styles.textContainer}>
                        <h2 className={styles.title}>Post not found</h2>
                        <p>This post is pending moderation.</p>
                    </div>
                </div>
            </div>
        );
    }

    // increment views now that access is permitted
    try {
        await prisma.post.update({ where: { slug }, data: { views: { increment: 1 } } });
    } catch (e) { console.warn('Failed to increment views', e); }

    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <Link href="/" className={styles.top}>
                    <div className={styles.back}>
                        <p><span className={styles.baack}>&#8617;</span> back to home</p>
                    </div>
                </Link>
                <div className={styles.textContainer}>
                    <span className={styles.date}>
                        ∅∅∅
                    </span>
                    <h2 className={styles.title}>{data?.title}</h2>

                    <div className={styles.user}>
                        {data?.user?.image && (
                            <div className={styles.userImageContainer}>
                                <Image src={data.user.image} alt="" fill className={styles.avatar} />
                            </div>
                        )}
                        {/* Link to public profile by username. Use stored username if present, otherwise derive from email */}
                        {
                          (() => {
                            const raw = data?.user?.username || (data?.user?.email ? data.user.email.split('@')[0] : 'user');
                            const display = raw.startsWith('@') ? raw : `@${raw}`;
                            // link to /u/<username> without the leading @ to avoid encoding issues in URLs
                            const href = `/u/${encodeURIComponent(raw.startsWith('@') ? raw.slice(1) : raw)}`;
                            return (
                              <Link href={href}>
                                <div className={styles.userTextContainer}>
                                  <span className={styles.username}>{data?.user?.name}</span>
                                  <span className={styles.lin}>{display}</span>
                                </div>
                              </Link>
                            );
                          })()
                        }
                    </div>

                    {/* admin controls */}
                    <div style={{ marginTop: 12 }}>
                        {/* render client-side controls only if owner or admin */}
                        <AdminPostControls slug={slug} canManage={isOwner || isAdmin} />
                    </div>
                </div>

            </div>
            {data?.img && (
                <div className={styles.imageContainer}>
                    <Image src={data.img} alt="" fill className={styles.image} />
                </div>
            )}
            <div className={styles.content}>
                <div className={styles.post}>
                    <div
                        className={`${styles.description} ql-editor`}
                        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(data?.desc) }}
                    />
                </div>
                <div className={styles.solid}></div>
                <Comments postSlug={slug} />
            </div>
        </div>
    )
};

export default SinglePage;