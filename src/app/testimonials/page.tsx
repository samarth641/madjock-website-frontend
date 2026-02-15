'use client';

import styles from './page.module.css';

export default function TestimonialsPage() {
    return (
        <main className={styles.aboutPage}>
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>Testimonials</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    <div className={styles.mainContent}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>What Our Community Says</h2>
                            <p className={styles.text}>
                                MadJock has helped thousands of businesses grow and millions of users find what they need.
                                Here are some of their stories.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.testimonialGrid}>
                                <div className={styles.testimonialCard}>
                                    <p className={styles.quote}>&quot;MadJock transformed my boutique into a local landmark. Their ad platform is so easy to use!&quot;</p>
                                    <div className={styles.author}>
                                        <strong>Priya Sharma</strong>
                                        <span>Boutique Owner, Mysuru</span>
                                    </div>
                                </div>
                                <div className={styles.testimonialCard}>
                                    <p className={styles.quote}>&quot;I found the best local bakery thanks to MadJock. The reviews are genuine and helpful.&quot;</p>
                                    <div className={styles.author}>
                                        <strong>Rahul Verma</strong>
                                        <span>Regular User, Nagpur</span>
                                    </div>
                                </div>
                                <div className={styles.testimonialCard}>
                                    <p className={styles.quote}>&quot;The merchant tools provided by MadJock have simplified our daily operations significantly.&quot;</p>
                                    <div className={styles.author}>
                                        <strong>Amit Gupta</strong>
                                        <span>Retail Chain Manager</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Partner Success Stories</h2>
                            <p className={styles.text}>
                                We collaborate with local chambers of commerce and business associations to empower the SME sector across India.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
