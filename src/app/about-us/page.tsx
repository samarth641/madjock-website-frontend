'use client';

import styles from './page.module.css';

const InfoIcon = () => (
    <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const MissionIcon = () => (
    <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const CorporateIcon = () => (
    <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export default function AboutUsPage() {
    return (
        <main className={styles.aboutPage}>
            {/* Banner Section */}
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>About Us</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    <div className={styles.mainContent}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <InfoIcon />
                                <h2 className={styles.sectionTitle}>Welcome to MadJock</h2>
                            </div>
                            <p className={styles.text}>
                                This is the About Us page. MadJock is India&apos;s emerging Local Search engine.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
