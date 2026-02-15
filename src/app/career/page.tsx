'use client';

import styles from './page.module.css';

const InfoIcon = () => (
    <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const LocationIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

export default function CareerPage() {
    return (
        <main className={styles.aboutPage}>
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>Work with MadJock</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    <div className={styles.mainContent}>
                        {/* Hero Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <InfoIcon />
                                <h2 className={styles.sectionTitle}>Join Our Vision</h2>
                            </div>
                            <p className={styles.text}>
                                At MadJock, we are on a mission to revolutionize how India discovers local businesses.
                                We&apos;re looking for passionate individuals who want to build the future of hyperlocal search and advertising.
                                Join us in creating technology that empowers millions of small businesses across the country.
                            </p>
                        </section>

                        {/* Values Section */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Our Core Values</h2>
                            <div className={styles.valuesGrid}>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>💡</div>
                                    <h3>Innovation</h3>
                                    <p>We push boundaries and encourage out-of-the-box thinking to solve complex problems.</p>
                                </div>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>🤝</div>
                                    <h3>Collaboration</h3>
                                    <p>We believe great things are achieved through teamwork and open communication.</p>
                                </div>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>🎯</div>
                                    <h3>Impact</h3>
                                    <p>Every piece of code we write and every decision we make aims to create real-world value.</p>
                                </div>
                            </div>
                        </section>

                        {/* Openings Section */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Current Openings</h2>
                            <p className={styles.text}>Be a part of a fast-growing team. Explore our current career opportunities.</p>

                            <div className={styles.jobList}>
                                {/* Job 1 */}
                                <div className={styles.jobItem}>
                                    <div className={styles.jobInfo}>
                                        <div className={styles.jobHeader}>
                                            <h3>Senior Frontend Engineer</h3>
                                            <span className={styles.tag}>Engineering</span>
                                        </div>
                                        <div className={styles.jobMeta}>
                                            <span><LocationIcon /> Remote / Hybrid</span>
                                            <span><ClockIcon /> Full-time</span>
                                        </div>
                                    </div>
                                    <button className={styles.applyBtn}>Apply Now</button>
                                </div>

                                {/* Job 2 */}
                                <div className={styles.jobItem}>
                                    <div className={styles.jobInfo}>
                                        <div className={styles.jobHeader}>
                                            <h3>Product Marketing Manager</h3>
                                            <span className={styles.tag}>Marketing</span>
                                        </div>
                                        <div className={styles.jobMeta}>
                                            <span><LocationIcon /> Mysuru Office</span>
                                            <span><ClockIcon /> Full-time</span>
                                        </div>
                                    </div>
                                    <button className={styles.applyBtn}>Apply Now</button>
                                </div>

                                {/* Job 3 */}
                                <div className={styles.jobItem}>
                                    <div className={styles.jobInfo}>
                                        <div className={styles.jobHeader}>
                                            <h3>Operations Coordinator</h3>
                                            <span className={styles.tag}>Operations</span>
                                        </div>
                                        <div className={styles.jobMeta}>
                                            <span><LocationIcon /> Nagpur Office</span>
                                            <span><ClockIcon /> Full-time</span>
                                        </div>
                                    </div>
                                    <button className={styles.applyBtn}>Apply Now</button>
                                </div>

                                {/* Job 4 */}
                                <div className={styles.jobItem}>
                                    <div className={styles.jobInfo}>
                                        <div className={styles.jobHeader}>
                                            <h3>Data Analyst</h3>
                                            <span className={styles.tag}>Science</span>
                                        </div>
                                        <div className={styles.jobMeta}>
                                            <span><LocationIcon /> Hybrid</span>
                                            <span><ClockIcon /> Full-time</span>
                                        </div>
                                    </div>
                                    <button className={styles.applyBtn}>Apply Now</button>
                                </div>
                            </div>
                        </section>

                        {/* Process Section */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Our Hiring Process</h2>
                            <div className={styles.processSteps}>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>01</div>
                                    <div className={styles.stepContent}>
                                        <h3>Application</h3>
                                        <p>Submit your resume and portfolio for initial screening by our talent team.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>02</div>
                                    <div className={styles.stepContent}>
                                        <h3>Technical Review</h3>
                                        <p>A deep dive into your skills through assessment or technical interview.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>03</div>
                                    <div className={styles.stepContent}>
                                        <h3>Final Interview</h3>
                                        <p>Meet the team and leadership to discuss culture and role expectations.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Benefits Section */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Life at MadJock</h2>
                            <div className={styles.benefitContainer}>
                                <div className={styles.benefitItem}>🚀 Growth mindset culture</div>
                                <div className={styles.benefitItem}>🏥 Health & Wellness coverage</div>
                                <div className={styles.benefitItem}>🏝️ Generous vacation policy</div>
                                <div className={styles.benefitItem}>📈 Performance incentives</div>
                                <div className={styles.benefitItem}>🎓 Learning & development support</div>
                                <div className={styles.benefitItem}>🎉 Festive celebrations</div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
