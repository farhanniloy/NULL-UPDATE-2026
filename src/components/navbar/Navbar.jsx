'use client'

import React, { useEffect, useState } from 'react'
import styles from "./navbar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthLinks from "@/components/authLinks/AuthLinks";
import ThemeToggle from "@/components/themeToggle/ThemeToggle";

const Navbar = () =>  {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <div className={styles.container}>
            <Link href="/" onClick={closeMenu}>
                <div className={styles.logo}>null</div>
            </Link>

            <div className={styles.right}>
                <div className={styles.navLinks}>
                    <Link href="/" className={styles.links}>Home.()</Link>
                    <Link href="/about" className={styles.links}>About.()</Link>
                    <Link href="/contact" className={styles.links}>Contact.()</Link>
                </div>

                <div className={styles.authWrapper}>
                    <AuthLinks />
                </div>

                <div className={styles.actions}>
                    <input
                        id="nav-toggle"
                        className={styles.toggle}
                        type="checkbox"
                        checked={menuOpen}
                        onChange={(event) => setMenuOpen(event.target.checked)}
                        aria-label="Toggle navigation menu"
                    />
                    <label htmlFor="nav-toggle" className={styles.toggleButton}>
                        <span className={styles.bar} />
                        <span className={styles.bar} />
                        <span className={styles.bar} />
                    </label>
                    <ThemeToggle className={styles.togg}/>
                    <nav className={styles.mobileMenu} role="menu">
                        <Link href="/" className={styles.mobileLink} onClick={closeMenu}>Home.()</Link>
                        <Link href="/about" className={styles.mobileLink} onClick={closeMenu}>About.()</Link>
                        <Link href="/contact" className={styles.mobileLink} onClick={closeMenu}>Contact.()</Link>
                        <div className={styles.mobileAuth}>
                            <AuthLinks />
                        </div>
                    </nav>
                </div>
            </div>
        </div>

    )
}

export default Navbar;
