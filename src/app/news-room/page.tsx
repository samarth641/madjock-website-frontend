'use client';

import styles from './page.module.css';

export default function NewsRoomPage() {
    return (
        <main className={styles.aboutPage}>
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>News Room</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    <div className={styles.mainContent}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Latest from MadJock</h2>
                            <p className={styles.text}>
                                Stay updated with our latest milestones, product launches, and media mentions as we
                                transform India&apos;s local commerce landscape.
                            </p>
                        </section>

                        <section className={styles.newsList}>
                            <article className={styles.newsItem}>
                                <span className={styles.newsDate}>Feb 15, 2026</span>
                                <h3>MadJock Reaches 5 Million Active Users Landmark</h3>
                                <p>We are proud to announce that our community has grown to over 5 million users across India...</p>
                                <a href="#" className={styles.readMore}>Read Full Story →</a>
                            </article>
                            <article className={styles.newsItem}>
                                <span className={styles.newsDate}>Jan 28, 2026</span>
                                <h3>New AI Video Tool for Small Businesses Launched</h3>
                                <p>Our latest update brings simplified video ad creation to every smartphone user...</p>
                                <a href="#" className={styles.readMore}>Read Full Story →</a>
                            </article>
                            <article className={styles.newsItem}>
                                <span className={styles.newsDate}>Jan 10, 2026</span>
                                <h3>Expansion into Tier 3 Cities Accelerates</h3>
                                <p>MadJock is now live in over 150 towns, helping local vendors find their digital voice...</p>
                                <a href="#" className={styles.readMore}>Read Full Story →</a>
                            </article>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
