"use client"
import React from 'react'
import styles from "./pagination.module.css";
import {useRouter} from "next/navigation";

const Pagination = ({ page = 1, totalPages = 1, hasPrev = false, hasNext = false, hrefPrefix = "" }) => {
    const router = useRouter()
    const getHref = (p) => `${hrefPrefix}?page=${p}`;

    // Build condensed page list with ellipses when needed
    const buildPages = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [];
        pages.push(1);
        if (page > 4) pages.push('start-ellipsis');
        const start = Math.max(2, Math.min(page - 1, totalPages - 4));
        const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
        for (let i = start; i <= end; i++) pages.push(i);
        if (page < totalPages - 3) pages.push('end-ellipsis');
        pages.push(totalPages);
        return pages;
    };

    const pages = buildPages();

    const renderPage = (p, key) => {
        if (typeof p !== 'number') {
            return (
                <span key={key} className={styles.ellipsis} aria-hidden="true">…</span>
            );
        }
        const isActive = p === page;
        return (
            <button
                key={key}
                type="button"
                className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isActive ? `Current page, page ${p}` : `Go to page ${p}`}
                onClick={() => router.push(getHref(p))}
            >
                {p}
            </button>
        );
    };

    // Mobile: show compact view with prev/next and current/total
    return (
        <nav className={styles.container} aria-label="Pagination">
            <div className={styles.leftControls}>
                <button
                    type="button"
                    disabled={page <= 1}
                    className={styles.iconButton}
                    aria-label="First page"
                    onClick={() => router.push(getHref(1))}
                >
                    «
                </button>
                <button
                    type="button"
                    disabled={page <= 1}
                    className={styles.iconButton}
                    aria-label="Previous page"
                    onClick={() => router.push(getHref(Math.max(1, page - 1)))}
                >
                    ‹
                </button>
            </div>

            <div className={`${styles.pages} ${styles.desktopPages}`}>
                {pages.map((p, i) => renderPage(p, `p-${i}`))}
            </div>

            <div className={styles.summary} aria-hidden={false}>
                <span className={styles.current}>{page}</span>
                <span className={styles.sep}>/</span>
                <span className={styles.total}>{totalPages}</span>
            </div>

            <div className={styles.rightControls}>
                <button
                    type="button"
                    disabled={page >= totalPages}
                    className={styles.iconButton}
                    aria-label="Next page"
                    onClick={() => router.push(getHref(Math.min(totalPages, page + 1)))}
                >
                    ›
                </button>
                <button
                    type="button"
                    disabled={page >= totalPages}
                    className={styles.iconButton}
                    aria-label="Last page"
                    onClick={() => router.push(getHref(totalPages))}
                >
                    »
                </button>
            </div>

            {/* Mobile condensed controls */}
            <div className={styles.mobileBar}>
                <button
                    type="button"
                    disabled={page <= 1}
                    className={styles.iconButton}
                    aria-label="Previous page"
                    onClick={() => router.push(getHref(Math.max(1, page - 1)))}
                >
                    ‹
                </button>
                <div className={styles.mobileLabelBar}>
                    <span className={styles.mobileCurrent}>{page}</span>
                    <span className={styles.mobileSlash}>/</span>
                    <span className={styles.mobileTotal}>{totalPages}</span>
                </div>
                <button
                    type="button"
                    disabled={page >= totalPages}
                    className={styles.iconButton}
                    aria-label="Next page"
                    onClick={() => router.push(getHref(Math.min(totalPages, page + 1)))}
                >
                    ›
                </button>
            </div>
        </nav>
    );
};

export default Pagination
