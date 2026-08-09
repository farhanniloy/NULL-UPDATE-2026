import styles from "./aboutPage.module.css";
import Link from "next/link";

export const metadata = {
    title: "About",
    description: "Learn about Farhan Niloy, an AI security researcher and writer behind Null.",
    alternates: { canonical: "/about" },
};

const AboutPage = () => {
    return (
        <main className={styles.container}>
            <article className={styles.card}>
                <div className={styles.glow} aria-hidden="true" />
                <aside className={styles.rail}>
                    <div className={styles.railMark}>FN</div>
                    <span className={styles.railLabel}>OPERATOR FILE</span>
                    <div className={styles.railRule} />
                    <span className={styles.railKey}>HANDLE</span>
                    <strong>nil</strong>
                    <span className={styles.railKey}>STATUS</span>
                    <strong className={styles.online}>● ONLINE</strong>
                    <span className={styles.railKey}>CLEARANCE</span>
                    <strong>RED / 07</strong>
                    <div className={styles.barcode}>|||| ||| |||||| | |||</div>
                    <span className={styles.railFooter}>NOISE IS A<br />VULNERABILITY.</span>
                </aside>

                <div className={styles.content}>
                    <header className={styles.header}>
                        <span className={styles.eyebrow}>CURRICULUM VITAE / 2026</span>
                        <h1>Farhan<br /><em>Niloy</em></h1>
                        <p className={styles.role}>AI SECURITY RESEARCHER / OS VULNERABILITY HUNTER / HACKER</p>
                        <div className={styles.contact}>
                            <a href="mailto:areyouokaynil@gmail.com">areyouokaynil@gmail.com</a>
                            <a href="tel:+8801794102371">+880 1794102371</a>
                            <span>Dhaka, Bangladesh</span>
                        </div>
                    </header>

                    <section className={styles.section}>
                    <h2><span className={styles.sectionNumber}>01</span> Profile</h2>
                    <p>
                        I work where artificial intelligence meets offensive security. My focus is
                        operating-system-level vulnerability research, zero-day discovery, red-team
                        operations, and penetration testing. I enjoy going beneath the interface,
                        tracing how systems really behave, and turning broken assumptions into
                        stronger defenses and useful tools.
                    </p>
                    <section className={styles.section}>
                    <h2><span className={styles.sectionNumber}>02</span> Areas of expertise</h2>
                    <div className={styles.skills}>
                        <span>Artificial Intelligence</span>
                        <span>Machine Learning</span>
                        <span>OS Internals</span>
                        <span>Zero-Day Research</span>
                        <span>Red Team Operations</span>
                        <span>Penetration Testing</span>
                        <span>Exploit Analysis</span>
                        <span>Full-Stack Development</span>
                    </div>
                    </section>

                    <section className={styles.section}>
                    <h2><span className={styles.sectionNumber}>03</span> Selected operations</h2>
                    <div className={styles.entry}>
                        <div>
                            <h3>Independent AI & Security Researcher</h3>
                            <p className={styles.muted}>Indie practice · Ongoing</p>
                        </div>
                        <p>Building AI-assisted security tools, autonomous experiments, and focused utilities from first hypothesis to working prototype.</p>
                    </div>
                    <div className={styles.entry}>
                        <div>
                            <h3>Offensive Security Research</h3>
                            <p className={styles.muted}>Vulnerability research · Red team · Pentest</p>
                        </div>
                        <p>Studying attack surfaces at the OS and application layers: reproducing vulnerabilities, investigating exploit paths, testing defenses, and documenting practical mitigations.</p>
                    </div>
                    </section>

                    </section>

                    <section className={styles.section}>
                    <h2><span className={styles.sectionNumber}>04</span> Operating principles</h2>
                    <p>Think like an attacker. Build like an engineer. Stay precise. I value curiosity, responsible disclosure, technical depth, privacy, and useful results over security theater.</p>
                    </section>

                    <footer className={styles.footer}>
                        <Link href="/contact" className={styles.cta}>INITIATE CONTACT <span>↗</span></Link>
                        <span className={styles.status}>REFERENCES AVAILABLE ON REQUEST // END OF FILE</span>
                    </footer>
                </div>
            </article>
        </main>
    );
};

export default AboutPage;
