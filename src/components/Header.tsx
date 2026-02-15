'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [userCity, setUserCity] = useState<string>('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const storedCity = localStorage.getItem('userCity');
        if (storedCity) {
            setUserCity(storedCity);
        }

        // Keep track of changes to localStorage in case page.tsx updates it
        const handleStorageChange = () => {
            const currentCity = localStorage.getItem('userCity');
            if (currentCity) setUserCity(currentCity);
        };

        window.addEventListener('storage', handleStorageChange);

        // Listen for custom event if we want to sync in the same tab
        const handleCityUpdate = (e: any) => {
            if (e.detail?.city) setUserCity(e.detail.city);
        };
        window.addEventListener('cityUpdated', handleCityUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cityUpdated', handleCityUpdate);
        };
    }, []);

    const handleLocationSelect = (city: string, source: 'auto' | 'manual' = 'manual') => {
        localStorage.setItem('userCity', city);
        localStorage.setItem('locationSource', source);
        setUserCity(city);
        setIsLocationModalOpen(false);
        // Dispatch event for other components to listen
        window.dispatchEvent(new CustomEvent('cityUpdated', { detail: { city } }));
        // Refresh page to load new data (simplest way without global state management)
        window.location.reload();
    };

    useEffect(() => {
        // Automatically open login modal after 5 seconds if not logged in
        if (!user) {
            const timer = setTimeout(() => {
                setIsLoginModalOpen(true);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [user]);

    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
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
                        <Link href="/businesses" className={styles.navLink}>Business</Link>
                        <Link href="/community" className={styles.navLink}>Community</Link>
                        <Link href="/branding" className={styles.navLink}>Branding</Link>
                    </nav>

                    {/* Location Selector */}
                    <div className={styles.locationSelector} onClick={() => setIsLocationModalOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{userCity || 'Loading...'}</span>
                        <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actions}>
                        {user ? (
                            <div className={styles.profileContainer}>
                                <button
                                    className={styles.profileBtn}
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </button>
                                {showProfileMenu && (
                                    <div className={styles.profileMenu}>
                                        <div className={styles.menuHeader}>
                                            <p className={styles.menuName}>{user.name || 'User'}</p>
                                            <p className={styles.menuPhone}>{user.phone}</p>
                                        </div>
                                        <button className={styles.menuItem} onClick={logout}>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className={styles.btnPrimary} onClick={() => setIsLoginModalOpen(true)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Login / Signup
                            </button>
                        )}

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
                        <Link href="/businesses" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Business</Link>
                        <Link href="/community" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Community</Link>
                        <Link href="/branding" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Branding</Link>

                        {user ? (
                            <>
                                <div className={styles.mobileProfileInfo}>
                                    <span>{user.name || 'User'}</span>
                                    <span>{user.phone}</span>
                                </div>
                                <button className={styles.mobileNavLink} onClick={() => { logout(); setMobileMenuOpen(false); }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                className={styles.mobileNavLink}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setIsLoginModalOpen(true);
                                }}
                            >
                                Login / Signup
                            </button>
                        )}

                        <div className={styles.mobileLocation} onClick={() => setIsLocationModalOpen(true)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{userCity || 'Select Location'}</span>
                        </div>
                    </nav>
                )}
            </div>

            {/* Modals */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            <LocationModal
                isOpen={isLocationModalOpen}
                onSelect={handleLocationSelect}
                onClose={() => setIsLocationModalOpen(false)}
            />
        </header>
    );
}
