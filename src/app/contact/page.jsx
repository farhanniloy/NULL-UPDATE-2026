import styles from "./contactPage.module.css";
import Link from "next/link";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";

const ContactPage = () => {
    return (
        <main className={styles.container}>
            <div className={styles.scanline} aria-hidden="true" />
            <div className={styles.terminalBar}>
                <span className={styles.terminalDot} />
                <span className={styles.terminalDot} />
                <span className={styles.terminalDot} />
                <span className={styles.terminalPath}>root@nulll:~/contact</span>
                <span className={styles.status}>[ SECURE CHANNEL ]</span>
            </div>
            <section className={styles.hero}>
                <div>
                    <span className={styles.tag}>{'// contact_protocol'}</span>
                    <h1>Open a secure line.</h1>
                    <p>
                        You have reached the private relay. Send a clear signal,
                        outline your objective, and I will respond when the channel is clear.
                    </p>
                </div>
                <div className={styles.contactPanel}>
                    <div className={styles.contactCard}>
                        <FiMail className={styles.icon} />
                        <div>
                            <h2>MAILBOX</h2>
                            <a href="mailto:areyouokaynil@gmail.com">areyouokaynil@gmail.com</a>
                        </div>
                    </div>
                    <div className={styles.contactCard}>
                        <FiPhone className={styles.icon} />
                        <div>
                            <h2>VOICE_LINE</h2>
                            <a href="tel:+8801794102371">+880 1794102371</a>
                        </div>
                    </div>
                    <div className={styles.contactCard}>
                        <FiMapPin className={styles.icon} />
                        <div>
                            <h2>BASE_LOCATION</h2>
                            <p>Dhaka, Bangladesh</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.formSection}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2><span className={styles.prompt}>&gt;</span> transmit_message</h2>
                        <p>Share the objective, scope, or vulnerability you want to investigate.</p>
                    </div>
                    <form className={styles.form}>
                        <label>
                            <span>IDENTIFIER</span>
                            <input type="text" placeholder="your name" />
                        </label>
                        <label>
                            <span>RETURN_ADDRESS</span>
                            <input type="email" placeholder="your@email.com" />
                        </label>
                        <label>
                            <span>PAYLOAD</span>
                            <textarea placeholder="tell me about the project" rows="6" />
                        </label>
                        <button type="button" className={styles.sendButton}>
                            <FiSend className={styles.sendIcon} />
                            execute transmission
                        </button>
                    </form>
                </div>
                <div className={styles.infoCard}>
                    <h2>OPSEC NOTE</h2>
                    <p>
                        Use the email above if you already have a clear project brief. If you want to
                        explore collaboration or research, include a few keywords and the main goal.
                    </p>
                    <Link href="/about" className={styles.linkButton}>
                        discover my work
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default ContactPage;
