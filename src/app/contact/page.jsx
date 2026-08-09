import styles from "./contactPage.module.css";
import Link from "next/link";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";

const ContactPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.hero}>
                <div>
                    <span className={styles.tag}>contact</span>
                    <h1>Let’s keep the conversation quiet and sharp.</h1>
                    <p>
                        If you want a project that blends hacker aesthetics with calm, intentional design,
                        this is the place to reach out. I respond faster to thoughtful notes.
                    </p>
                </div>
                <div className={styles.contactPanel}>
                    <div className={styles.contactCard}>
                        <FiMail className={styles.icon} />
                        <div>
                            <h2>Email</h2>
                            <a href="mailto:contact@nulll.me">contact@nulll.me</a>
                        </div>
                    </div>
                    <div className={styles.contactCard}>
                        <FiPhone className={styles.icon} />
                        <div>
                            <h2>Phone</h2>
                            <p>+880 1234 567890</p>
                        </div>
                    </div>
                    <div className={styles.contactCard}>
                        <FiMapPin className={styles.icon} />
                        <div>
                            <h2>Location</h2>
                            <p>Dhaka, Bangladesh</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.formSection}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2>Send a message</h2>
                        <p>Share the idea, the scope, or the problem you want to solve.</p>
                    </div>
                    <form className={styles.form}>
                        <label>
                            <span>name</span>
                            <input type="text" placeholder="your name" />
                        </label>
                        <label>
                            <span>email</span>
                            <input type="email" placeholder="your@email.com" />
                        </label>
                        <label>
                            <span>message</span>
                            <textarea placeholder="tell me about the project" rows="6" />
                        </label>
                        <button type="button" className={styles.sendButton}>
                            <FiSend className={styles.sendIcon} />
                            send message
                        </button>
                    </form>
                </div>
                <div className={styles.infoCard}>
                    <h2>Need a fast note?</h2>
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
