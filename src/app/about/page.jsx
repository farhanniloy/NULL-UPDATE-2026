import styles from "./aboutPage.module.css";
import Link from "next/link";

const AboutPage = () => {
    return (
        <main className={styles.container}>
            <article className={styles.card}>
                <div className={styles.glow} aria-hidden="true" />
                <header className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>curriculum vitae</span>
                        <h1>Farhan Niloy</h1>
                        <p className={styles.role}>AI Security Researcher · OS Vulnerability Hunter · Hacker</p>
                    </div>
                    <div className={styles.contact}>
                        <a href="mailto:areyouokaynil@gmail.com">areyouokaynil@gmail.com</a>
                        <a href="tel:+8801794102371">+880 1794102371</a>
                        <span>Bangladesh</span>
                    </div>
                </header>

                <section className={styles.section}>
                    <h2>Profile</h2>
                    <p>
                        I work where artificial intelligence meets offensive security. My focus is
                        operating-system-level vulnerability research, zero-day discovery, red-team
                        operations, and penetration testing. I enjoy going beneath the interface,
                        tracing how systems really behave, and turning broken assumptions into
                        stronger defenses and useful tools.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Areas of expertise</h2>
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
                    <h2>Selected work</h2>
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

                <section className={styles.section}>
                    <h2>Working principles</h2>
                    <p>Think like an attacker. Build like an engineer. Stay precise. I value curiosity, responsible disclosure, technical depth, privacy, and useful results over security theater.</p>
                </section>

                <footer className={styles.footer}>
                    <Link href="/contact" className={styles.cta}>say hello <span>↗</span></Link>
                    <span className={styles.status}>References and further details available on request.</span>
                </footer>
            </article>
        </main>
    );
};

export default AboutPage;
