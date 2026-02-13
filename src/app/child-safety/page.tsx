'use client';

import styles from '../about/page.module.css';
import { useEffect, useState } from 'react';

export default function ChildSafetyPage() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <main className={styles.aboutPage}>
            <section className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1 className={styles.bannerTitle}>Child Safety</h1>
            </section>

            <div className="container" style={{ marginTop: '60px' }}>
                <div className={styles.mainContent}>
                    <header>
                        <h1><u>Child Safety Guidelines for MadJock</u></h1>
                    </header>
                    <main>
                        {/* Back button */}
                        <a href="/" className="back-button">Back to Home</a>
                        <h2>Introduction</h2>
                        <p>Your child's safety is our top priority. These guidelines outline the measures MadJock takes to ensure a secure and enriching experience for younger users.</p>

                        <h2>Key Safety Features</h2>
                        <ul>
                            <li><strong>Age-Appropriate Content:</strong> MadJock ensures all content is appropriate for the target age group and complies with Play Store policies.</li>
                            <li><strong>Parental Controls:</strong> Features are available to help parents manage access to specific sections of the app.</li>
                            <li><strong>No Direct Communication:</strong> Children cannot communicate with other users directly within the app.</li>
                            <li><strong>Ad Filtering:</strong> Ads displayed in the app are carefully selected to ensure they are child-friendly and comply with regulatory guidelines.</li>
                        </ul>

                        <h2>Parental Involvement</h2>
                        <p>We encourage parents to:</p>
                        <ul>
                            <li>Monitor their child’s usage of the app.</li>
                            <li>Set up and use parental controls available in the app.</li>
                            <li>Educate their child about safe online behavior.</li>
                        </ul>

                        <h2>Data Privacy</h2>
                        <p>MadJock complies with all relevant child data protection laws, including:</p>
                        <ul>
                            <li><strong>Children’s Online Privacy Protection Act (COPPA):</strong> We do not collect personal information without parental consent.</li>
                            <li><strong>General Data Protection Regulation (GDPR-K):</strong> Protecting children’s data in compliance with European standards.</li>
                        </ul>

                        <h2>Reporting and Support</h2>
                        <p>If you notice any issues or have concerns about your child's safety while using MadJock, please contact our support team at <a href="mailto:support@MadJock.com">support@MadJock.com</a>.</p>
                    </main>
                    <footer>
                        <p>&copy; 2025 MadJock. All rights reserved.</p>
                    </footer>
                </div>
            </div>

            {isVisible && (
                <button
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        padding: '10px 15px',
                        fontSize: '18px',
                        backgroundColor: '#FFD700',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Scroll to Top"
                >
                    ↑
                </button>
            )}
        </main>
    );
}
