'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './AboutUsNavbar.module.css';
const AboutUsNavbar = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'CAREER', path: '/career' },
        { name: 'TESTIMONIALS', path: '/testimonials' },
        { name: 'SERVICES', path: '/services' },
        { name: 'NEWS ROOM', path: '/news-room' },
        { name: 'CONTACT', path: '/contact' },
    ];

    return (
        <nav className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
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

                    {/* Desktop Menu */}
                    <div className={styles.desktopNav}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`${styles.navLink} ${pathname === link.path ? styles.active : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className={styles.rightSection}>
                        <button
                            className={styles.mobileMenuBtn}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={styles.mobileNav}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`${styles.mobileNavLink} ${pathname === link.path ? styles.active : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </nav>
    );
};

export default AboutUsNavbar;
