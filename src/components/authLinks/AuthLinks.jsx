"use client"
import styles from "./authLinks.module.css";
import Link from "next/link";
import {useState} from "react";
import {signIn, signOut, useSession} from "next-auth/react";
const AuthLinks = () => {

    const [open, setOpen] = useState(false)

    const { data: session, status } = useSession();
    const role = session?.user?.role;
    const rawUsername = session?.user?.username || session?.user?.name || '';
    const usernameDisplay = rawUsername ? (rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`) : 'Profile';
    const usernameSlug = rawUsername ? (rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername) : '';

    return(
        <>
            {status === "unauthenticated" ? (
                <Link href={"/login"} className={styles.link}>Login.()</Link>
            ):(

                <>
                <Link href={"/write"} className={styles.link}>Write.()</Link>
                {/* show pending for moderators and admins */}
                {(role === 'ADMIN' || role === 'MODERATOR') && (
                    <Link href={"/admin/moderation"} className={styles.link}>Pending.()</Link>
                )}
                {/* show username linking to profile */}
                {usernameSlug ? (
                  <Link href={`/u/${encodeURIComponent(usernameSlug)}`} className={styles.link}>{usernameDisplay}.()</Link>
                ) : (
                  <Link href={'/profile'} className={styles.link}>{usernameDisplay}.()</Link>
                )}
                <span className={styles.link} onClick={() => signOut({ callbackUrl: '/' }).then(() => window.location.reload())}>Logout.()</span>
                </>
            )}
            <div className={styles.buttn} onClick={()=>setOpen(!open)}>
                 <div className={styles.line}></div>
                 <div className={styles.line}></div>
                 <div className={styles.line}></div>
            </div>
            {open && (
                <div className={styles.responsiveMenu}>
                    <Link className={styles.item} href="/">Home</Link>
                    <Link className={styles.item} href="/">About</Link>
                    <Link className={styles.item} href="/">Contact</Link>
                    {status === "unauthenticated" ? (
                        <Link className={styles.item} href={"/login"}>Login</Link>
                    ):(
                        <>
                            <Link className={styles.item} href={"/write"}>Write</Link>
                            {(role === 'ADMIN' || role === 'MODERATOR') && (
                                <Link className={styles.item} href={'/admin/moderation'}>Pending</Link>
                            )}
                            <Link className={styles.item} href={'/profile'}>{username || 'Profile'}</Link>
                        <span className={styles.item} onClick={() => signOut({ callbackUrl: '/' }).then(() => window.location.reload())}>Logout</span>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default AuthLinks;