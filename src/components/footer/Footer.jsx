import React from 'react';
import styles from "./footer.module.css";
import Link from "next/link";
import {TfiGithub} from 'react-icons/tfi';
import {BsLinkedin} from 'react-icons/bs';
import {RiTwitterXLine} from 'react-icons/ri';
import {ImFacebook2} from 'react-icons/im';

import {FaHome} from "react-icons/fa";
import {HiInformationCircle} from "react-icons/hi";
import {IoMdContact} from "react-icons/io";
import {IoLogIn} from "react-icons/io5";
import {GiAtom, GiThink} from "react-icons/gi";
import {SiCodeproject, SiHackaday} from "react-icons/si";

const Footer = () => {
    return (
        <div className={styles.container}>
            <div className={styles.info}>
                    <h1 className={styles.logo}>null</h1>
                <p className={styles.text}>What’s good about love is, it’s a very strong desire that realigns the entire tensor of human mind toward a singular madness. The most fundamental incentive (fear) being completely hijacked by its total opposite force, that threshold, among all these mechanistic forces that arise in a human mind, this is the only true madness worth living for! Even the gods be envy of...</p>
                <strong className={styles.text2}>
                    <br/>~ nil</strong>
            </div>

            <div className={styles.links}>
                <div className={styles.list}>
                    <span className={styles.listTitle}>tags</span>
                    <Link className={styles.linkItem} href="/category/article"><GiThink /> article</Link>
                    <Link className={styles.linkItem} href="/category/science"><GiAtom /> science</Link>
                    <Link className={styles.linkItem} href="/category/infiltration"><SiHackaday /> infiltration</Link>
                    <Link className={styles.linkItem} href="/category/projects"><SiCodeproject /> projects</Link>

                </div>
                <div className={styles.list}>
                    <span className={styles.listTitle}>links</span>
                    <Link className={styles.linkItem} href="/" ><FaHome /> home</Link>
                    <Link className={styles.linkItem} href="/about"><HiInformationCircle /> about</Link>
                    <Link className={styles.linkItem} href="/contact"><IoMdContact /> contact</Link>
                    <Link className={styles.linkItem} href="/login"><IoLogIn /> login</Link>
                </div>
                <div className={styles.list}>
                    <span className={styles.listTitle}>networks</span>
                    <Link className={styles.linkItem} target="_blank" href="https://github.com/niloy-farhan"><TfiGithub/> github</Link>
                    <Link className={styles.linkItem} target="_blank" href="https://www.linkedin.com/in/niloy-farhan-6067b422b/"><BsLinkedin/> linkedin</Link>
                    <Link className={styles.linkItem} target="_blank" href="https://twitter.com/MrFarhanNiloy"><RiTwitterXLine/> twitter</Link>
                    <Link className={styles.linkItem} target="_blank" href="https://facebook.com/nulll.me"><ImFacebook2/> facebook</Link>
                </div>
            </div>
        </div>
    )
}

export default Footer;
