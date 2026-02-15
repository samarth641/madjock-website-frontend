'use client';

import styles from './page.module.css';

export default function ContactPage() {
    return (
        <main className={styles.aboutPage}>
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>Get in Touch</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    <div className={styles.mainContent}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>We&apos;d Love to Hear From You</h2>
                            <p className={styles.text}>
                                Whether you have a question about our services, need technical support, or are interested
                                in a partnership, our team is ready to assist you.
                            </p>
                        </section>

                        <section className={styles.contactContainer}>
                            <div className={styles.contactForm}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your Name" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input type="email" placeholder="email@example.com" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Message</label>
                                    <textarea placeholder="How can we help?"></textarea>
                                </div>
                                <button className={styles.submitBtn}>Send Message</button>
                            </div>

                            <div className={styles.contactInfo}>
                                <div className={styles.infoBlock}>
                                    <h3>Corporate Office</h3>
                                    <p>MadJock Technologies Pvt Ltd,<br />123 Tech Park, Hebbal Industrial Area,<br />Mysuru - 570018</p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <h3>Technical Support</h3>
                                    <p>Email: support@madjock.com<br />Telegram: @MadJockSupport</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
