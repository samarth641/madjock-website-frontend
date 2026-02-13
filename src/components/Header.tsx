'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import styles from './Header.module.css';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        // Automatically open login modal after 5 seconds
        const timer = setTimeout(() => {
            setIsLoginModalOpen(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
                    {/* Logo */}
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoImageContainer}>
                            <Image
                                src="/madjock-logo.png"
                                alt="MadJock Logo"
                                fill
                                style={{ objectFit: 'contain', objectPosition: 'left' }}
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.desktopNav}>
                        <Link href="/" className={styles.navLink}>Home</Link>
                        <Link href="/businesses" className={styles.navLink}>Businesses</Link>
                        <Link href="/categories" className={styles.navLink}>Categories</Link>
                        <Link href="/about" className={styles.navLink}>About</Link>
                    </nav>

                    {/* Action Buttons */}
                    <div className={styles.actions}>
                        <button className={styles.btnSecondary} onClick={() => setIsLoginModalOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Login
                        </button>
                        <button className={styles.btnPrimary}>Sign Up</button>

                        {/* Mobile Menu Button */}
                        <button
                            className={styles.mobileMenuBtn}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {mobileMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <nav className={styles.mobileNav}>
                        <Link href="/" className={styles.mobileNavLink}>Home</Link>
                        <Link href="/businesses" className={styles.mobileNavLink}>Businesses</Link>
                        <Link href="/categories" className={styles.mobileNavLink}>Categories</Link>
                        <Link href="/about" className={styles.mobileNavLink}>About</Link>
                    </nav>
                )}
            </div>

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </header>
    );
}
