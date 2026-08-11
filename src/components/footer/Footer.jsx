import React from 'react';
import styles from "./footer.module.css";
import Link from "next/link";
import { TfiGithub } from 'react-icons/tfi';
import { BsLinkedin } from 'react-icons/bs';
import { RiTwitterXLine } from 'react-icons/ri';
import { ImFacebook2 } from 'react-icons/im';

import { FaHome } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";
import { IoMdContact } from "react-icons/io";
import { IoLogIn } from "react-icons/io5";
import { GiAtom, GiThink } from "react-icons/gi";
import { SiCodeproject, SiHackaday } from "react-icons/si";

const Footer = () => {
    return (
        <footer className={styles.container} aria-label="footer">
            <div className={styles.info}>
                <Link href="/" className={styles.logo}>null</Link>
                <div className={styles.quoteRow}>
                    <div className={styles.quoteBlock}>
                        <p className={styles.text}>
                            what’s good about love is, it’s a very strong desire that realigns the entire tensor of human mind toward a singular madness. the most fundamental incentive (fear) being completely hijacked by its total opposite force, that threshold, among all these mechanistic forces that arise in a human mind, this is the only true madness worth living for! even the gods be envy of...
                        </p>
                        <span className={styles.signature}>~ nil</span>
                    </div>
                </div>
            </div>

            <div className={styles.links}>
                <div className={styles.list}>
                    <span className={styles.listTitle}>topics</span>
                    <Link className={styles.linkItem} href="/category/article"><GiThink /> article</Link>
                    <Link className={styles.linkItem} href="/category/science"><GiAtom /> science</Link>
                    <Link className={styles.linkItem} href="/category/infiltration"><SiHackaday /> infiltration</Link>
                    <Link className={styles.linkItem} href="/category/projects"><SiCodeproject /> projects</Link>
                </div>
                <div className={styles.list}>
                    <span className={styles.listTitle}>explore</span>
                    <Link className={styles.linkItem} href="/"><FaHome /> home</Link>
                    <Link className={styles.linkItem} href="/about"><HiInformationCircle /> about</Link>
                    <Link className={styles.linkItem} href="/contact"><IoMdContact /> contact</Link>
                    <Link className={styles.linkItem} href="/login"><IoLogIn /> login</Link>
                </div>
                <div className={styles.list}>
                    <span className={styles.listTitle}>connect</span>
                    <Link className={styles.linkItem} target="_blank" rel="noreferrer" href="https://github.com/niloy-farhan"><TfiGithub /> github</Link>
                    <Link className={styles.linkItem} target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/niloy-farhan-6067b422b/"><BsLinkedin /> linkedin</Link>
                    <Link className={styles.linkItem} target="_blank" rel="noreferrer" href="https://twitter.com/MrFarhanNiloy"><RiTwitterXLine /> twitter</Link>
                    <Link className={styles.linkItem} target="_blank" rel="noreferrer" href="https://facebook.com/nulll.me"><ImFacebook2 /> facebook</Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
