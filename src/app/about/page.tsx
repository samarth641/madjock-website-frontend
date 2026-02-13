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

export default function AboutPage() {
    return (
        <main className={styles.aboutPage}>
            {/* Banner Section */}
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>About MadJock</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    {/* Main Content Area */}
                    <div className={styles.mainContent}>

                        {/* About Us Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <InfoIcon />
                                <h2 className={styles.sectionTitle}>About Us</h2>
                            </div>
                            <p className={styles.text}>
                                MadJock is India&apos;s emerging Local Search engine that provides local search related services
                                to users across India through multiple platforms such as website, mobile website, and Apps.
                                Our mission is to bridge the gap between users and businesses by providing conveniently
                                actionable information instantly. MadJock has initiated several innovative services aimed
                                at making daily tasks more accessible to users through a single, unified platform.
                            </p>
                            <p className={styles.text}>
                                From being a provider of local search and related information, MadJock has transitioned into
                                being an enabler of transactions. We have launched specialized solutions for SMEs to shift
                                their business online and maintain a robust digital presence. Our platform also integrates
                                secure payment options and social sharing tools to provide a comprehensive experience
                                for both vendors and customers.
                            </p>
                        </section>

                        {/* What We Do Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <MissionIcon />
                                <h2 className={styles.sectionTitle}>What We Do?</h2>
                            </div>
                            <h3 className={styles.subtitle}>Join us in reshaping the future of &quot;INTERACTIVE ADVERTISING&quot;. Let’s make every ad count!</h3>
                            <p className={styles.text}>
                                At MadJock, we&apos;re revolutionizing how businesses connect with their actual audiences. Our Distance Specified AI-powered advertising platform is designed to empower businesses of all sizes, simplifying the complex world of digital advertising into a seamless and impactful experience.
                            </p>
                            <p className={styles.text}>
                                We understand that crafting and engaging ad campaigns can be challenging, especially in a fast-paced complex digital landscape which is curated by trained professionals campaigners. That’s why we built MadJock – a self-advertising social platform which can be handled by a basic Smartphone user.
                            </p>
                            <p className={styles.text}>
                                Any Business owners or an individual can easily make, post videos and publish them seamlessly by choosing a certain distance making high-quality advertisements. From automated AI video creation to advanced sentiment analysis, audience segmentation, and real-time performance optimization, we bring cutting-edge tools to your fingertips.
                            </p>
                            <p className={styles.text}>
                                Our mission is to help businesses grow by delivering ads that resonate. Whether you&apos;re a small business owner or a marketing professional, MadJock provides the platform and simplified tools you need to create, optimize, and succeed in your campaigns.
                            </p>
                            <p className={styles.text}>
                                At MadJock, creativity meets intelligence, and your success is our priority. Join us in reshaping the future of interactive advertising. Let’s make every ad count!
                            </p>
                        </section>

                        {/* Corporate Information */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <CorporateIcon />
                                <h2 className={styles.sectionTitle}>Corporate Information</h2>
                            </div>
                            <ul className={styles.corporateList}>
                                <li className={styles.corporateItem}>Our operations began with a vision to revolutionize the local search industry.</li>
                                <li className={styles.corporateItem}>Headquartered in Mysuru, we serve millions of users across different states.</li>
                                <li className={styles.corporateItem}>We are committed to technological innovation and user-centric service design.</li>
                                <li className={styles.corporateItem}>Our platform supports multiple Indian languages to ensure inclusivity.</li>
                            </ul>
                        </section>

                    </div>

                    {/* Sidebar Area */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarBox}>
                            <h3 className={styles.sidebarTitle}>Contact Us</h3>
                            <div className={styles.contactList}>
                                <div className={styles.contactItem}>
                                    <span>📧 MAIL:</span>
                                    <a href="mailto:SUPPORT@MADJOCK.COM">SUPPORT@MADJOCK.COM</a>
                                </div>
                                <div className={styles.contactItem}>
                                    <span>💬 SKYPE:</span>
                                    <span>MADJOCK</span>
                                </div>
                                <div className={styles.contactItem}>
                                    <span>🌐 WEB:</span>
                                    <a href="http://WWW.MADJOCK.COM">WWW.MADJOCK.COM</a>
                                </div>
                                <div className={styles.contactItem}>
                                    <span>📱 TELEGRAM:</span>
                                    <span>MADJOCK</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sidebarBox}>
                            <h3 className={styles.sidebarTitle}>
                                For more details check:
                            </h3>
                            <div className={styles.linkList}>
                                <a href="/privacy-policy" className={styles.sidebarLink}>📄 Privacy Policy</a>
                                <a href="/terms-and-conditions" className={styles.sidebarLink}>📜 Terms & Conditions</a>
                                <a href="/child-safety" className={styles.sidebarLink}>🛡️ Child Safety</a>
                                <a href="#" className={styles.sidebarLink}>📰 Press Releases</a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
