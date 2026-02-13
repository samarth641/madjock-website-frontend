'use client';

import styles from '../about/page.module.css';
import { useEffect, useState } from 'react';

export default function PrivacyPolicyPage() {
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
            behavior: 'smooth'
        });
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.content}>
                    <iframe
                        src="/Privacy-Policy.html"
                        style={{
                            width: '100%',
                            minHeight: '100vh',
                            border: 'none',
                            display: 'block'
                        }}
                        title="Privacy Policy"
                    />
                </div>

                {isVisible && (
                    <button
                        onClick={scrollToTop}
                        className={styles.scrollToTop}
                        aria-label="Scroll to top"
                    >
                        ↑
                    </button>
                )}
            </main>
        </div>
    );
}
