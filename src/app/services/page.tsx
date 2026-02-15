'use client';

import styles from './page.module.css';

const ChevronIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

export default function ServicesPage() {
    const digitalServices = [
        "Social Media Marketing", "SEO (Search Engine Optimization)", "PPC (Pay Per Click)",
        "Email Marketing", "Facebook/Meta Ads", "Display Advertisement",
        "Banner Ads", "Digital Advertisement", "Interactive Advertisement"
    ];

    const creativeServices = [
        "Content Creation", "Graphic Designing", "Videography",
        "Photography", "Corporate Films", "Video Viral", "AI Video Advertisement"
    ];

    const mediaServices = [
        "Television Commercials", "Native Advertising", "Influencer Advertisement",
        "Radio Commercials", "Print Advertisement", "Outdoor Advertisement"
    ];

    return (
        <main className={styles.aboutPage}>
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>Services We Offer</h1>
            </section>

            <div className="container">
                <div className={styles.contentRow}>
                    <div className={styles.mainContent}>
                        {/* High Level Ecosystem */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>The MadJock Ecosystem</h2>
                            <p className={styles.text}>
                                We provide a comprehensive suite of tools designed to bridge the gap between businesses and consumers
                                through intelligence and accessibility.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.serviceGrid}>
                                <div className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>🔍</div>
                                    <h3>Hyperlocal Search</h3>
                                    <p>Find anything you need within your immediate vicinity with real-time accuracy.</p>
                                </div>
                                <div className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>📢</div>
                                    <h3>AI Advertising</h3>
                                    <p>Create and deploy targeted video ads in minutes using our distance-specified AI platform.</p>
                                </div>
                                <div className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>🏢</div>
                                    <h3>SME Transformation</h3>
                                    <p>We help small and medium enterprises digitize their operations and reach thousands of new customers.</p>
                                </div>
                                <div className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>💳</div>
                                    <h3>Merchant Tools</h3>
                                    <p>Integrated payment solutions and customer engagement analytics for local vendors.</p>
                                </div>
                            </div>
                        </section>

                        {/* All Services Categorized */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Our Specialized Solutions</h2>
                            <p className={styles.text}>From digital dominance to traditional excellence, we cover every aspect of your brand&apos;s journey.</p>

                            <div className={styles.categoriesContainer}>
                                <div className={styles.categoryBlock}>
                                    <h3>Digital Marketing</h3>
                                    <ul className={styles.serviceList}>
                                        {digitalServices.map(service => <li key={service}><ChevronIcon /> {service}</li>)}
                                    </ul>
                                </div>
                                <div className={styles.categoryBlock}>
                                    <h3>Creative & Production</h3>
                                    <ul className={styles.serviceList}>
                                        {creativeServices.map(service => <li key={service}><ChevronIcon /> {service}</li>)}
                                    </ul>
                                </div>
                                <div className={styles.categoryBlock}>
                                    <h3>Media & Advertising</h3>
                                    <ul className={styles.serviceList}>
                                        {mediaServices.map(service => <li key={service}><ChevronIcon /> {service}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Detailed Highlights */}
                        <section className={styles.highlightsContainer}>
                            <div className={styles.highlightBlock}>
                                <h2>Television Commercials</h2>
                                <p>
                                    MadJock specializes in crafting compelling television commercials, strategically aired during
                                    program breaks or program transitions. These advertisements, ranging from 30 seconds to one minute,
                                    effectively showcase and promote products or services to captivate the audience.
                                </p>
                            </div>

                            <div className={styles.highlightBlock}>
                                <h2>Corporate Films</h2>
                                <p>
                                    MadJock delivers tailored, non-advertisement based video content for businesses, companies,
                                    corporations, or organizations. Our expertise ensures the creation of engaging and purposeful
                                    films aligned with your corporate goals and messaging.
                                </p>
                            </div>

                            <div className={styles.highlightBlock}>
                                <h2>Video Viral</h2>
                                <p>
                                    MadJock is your go-to for crafting viral videos that gain popularity through the Internet&apos;s viral
                                    sharing process. Leveraging platforms like YouTube, social media, and email, we specialize in
                                    creating content that captivates audiences and spreads organically, making your brand or message
                                    widely recognized.
                                </p>
                            </div>

                            <div className={styles.highlightBlock}>
                                <h2>Videography</h2>
                                <p>
                                    MadJock specializes in videography, seamlessly capturing dynamic moving images on electronic
                                    and streaming media. Our services encompass the entire spectrum of video production and post-production,
                                    ensuring a comprehensive approach to bring your vision to life with precision and creativity.
                                </p>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <p className={styles.closingText}>
                                Assertively exploit wireless initiatives rather than synergistic core competencies.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
