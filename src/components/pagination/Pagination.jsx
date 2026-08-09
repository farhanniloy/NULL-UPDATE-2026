"use client"
import React from 'react'
import styles from "./pagination.module.css";
import {useRouter} from "next/navigation";

const Pagination = ({ page, totalPages, hasPrev, hasNext, hrefPrefix = "" }) => {
    const router = useRouter()
    const getHref = (nextPage) => `${hrefPrefix}?page=${nextPage}`;
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    const mobilePages = totalPages <= 5
        ? pages
        : page <= 3
            ? [1, 2, 3, 4, "ellipsis-end", totalPages]
            : page >= totalPages - 2
                ? [1, "ellipsis-start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
                : [1, "ellipsis-start", page - 1, page, page + 1, "ellipsis-end", totalPages];

    const renderPage = (pageNumber, key = pageNumber) => {
        if (typeof pageNumber !== "number") {
            return (
                <span key={key} className={styles.ellipsis} aria-hidden="true">
                    ...
                </span>
            );
        }

        return (
            <button
                key={key}
                type="button"
                className={`${styles.pageButton} ${pageNumber === page ? styles.active : ""}`}
                aria-current={pageNumber === page ? "page" : undefined}
                aria-label={`Go to page ${pageNumber}`}
                onClick={() => router.push(getHref(pageNumber))}
            >
                {pageNumber}
            </button>
        );
    };

    return (
        <nav className={styles.container} aria-label="Pagination">
            <button
                type="button"
                disabled={!hasPrev}
                className={styles.button}
                onClick={() => router.push(getHref(page - 1))}
            >
                <span className={styles.desktopLabel}>Previous</span>
                <span className={styles.mobileLabel}>Prev</span>
            </button>
            <div className={`${styles.pages} ${styles.desktopPages}`}>
                {pages.map((pageNumber) => renderPage(pageNumber))}
            </div>
            <div className={`${styles.pages} ${styles.mobilePages}`}>
                {mobilePages.map((pageNumber, index) => renderPage(pageNumber, `${pageNumber}-${index}`))}
            </div>
            <button
                type="button"
                disabled={!hasNext}
                className={styles.button}
                onClick={() => router.push(getHref(page + 1))}
            >
                <span className={styles.desktopLabel}>Next</span>
                <span className={styles.mobileLabel}>Next</span>
            </button>
        </nav>
    )
}

export default Pagination