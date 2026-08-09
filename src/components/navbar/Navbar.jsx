import React from 'react'
import styles from "./navbar.module.css";
import Link from "next/link";
import AuthLinks from "@/components/authLinks/AuthLinks";
import ThemeToggle from "@/components/themeToggle/ThemeToggle";

const Navbar = () =>  {
    return (
        <div className={styles.container}>
            <a href="/">
                <div className={styles.logo}>null</div>
            </a>

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
                    <input id="nav-toggle" className={styles.toggle} type="checkbox" aria-hidden="true" />
                    <label htmlFor="nav-toggle" className={styles.toggleButton} aria-hidden="true">
                        <span className={styles.bar} />
                        <span className={styles.bar} />
                        <span className={styles.bar} />
                    </label>
                    <ThemeToggle className={styles.togg}/>
                    <nav className={styles.mobileMenu} role="menu">
                        <Link href="/" className={styles.mobileLink}>Home.()</Link>
                        <Link href="/about" className={styles.mobileLink}>About.()</Link>
                        <Link href="/contact" className={styles.mobileLink}>Contact.()</Link>
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
