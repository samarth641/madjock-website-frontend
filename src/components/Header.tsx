'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const { user, logout, isLoading } = useAuth();
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
        // Automatically open login modal after 5 seconds if not logged in and not loading
        if (!isLoading && !user) {
            const timer = setTimeout(() => {
                setIsLoginModalOpen(true);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [user, isLoading]);

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
                                    {user.avatar ? (
                                        <Image
                                            src={user.avatar}
                                            alt={user.name || 'User'}
                                            width={42}
                                            height={42}
                                            className={styles.profileBtnImage}
                                            unoptimized
                                        />
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    )}
                                </button>
                                {showProfileMenu && (
                                    <div className={styles.profileMenu}>
                                        {/* User selection card */}
                                        <Link
                                            href={`/profile/${user.id || user._id}`}
                                            className={styles.userCardLink}
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <div className={styles.userCard}>
                                                <Image
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                                                    alt={user.name || 'User'}
                                                    width={40}
                                                    height={40}
                                                    className={styles.userCardAvatar}
                                                    unoptimized
                                                />
                                                <div className={styles.userCardInfo}>
                                                    <p className={styles.userCardName}>{user.name || 'User'}</p>
                                                    <span className={styles.menuActionItemSubtext}>See your profile</span>
                                                </div>
                                            </div>
                                            <div className={styles.userCardAction}>
                                                <button className={styles.seeAllProfiles}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                        <circle cx="9" cy="7" r="4" />
                                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                    See all profiles
                                                </button>
                                            </div>
                                        </Link>

                                        {/* Menu List */}
                                        <div className={styles.menuSection}>
                                            <Link href="/dashboard" className={styles.menuActionItem} onClick={() => setShowProfileMenu(false)}>
                                                <div className={styles.menuIconWrapper}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                                                    </svg>
                                                </div>
                                                <span className={styles.menuItemText}>Dashboard</span>
                                                <svg className={styles.menuChevron} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </Link>

                                            <Link href={`/profile/${user.id || user._id}?edit=true`} className={styles.menuActionItem} onClick={() => setShowProfileMenu(false)}>
                                                <div className={styles.menuIconWrapper}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </div>
                                                <span className={styles.menuItemText}>Edit profile</span>
                                                <svg className={styles.menuChevron} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </Link>

                                            <button className={styles.menuActionItem} onClick={() => { /* Placeholder */ }}>
                                                <div className={styles.menuIconWrapper}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                                    </svg>
                                                </div>
                                                <span className={styles.menuItemText}>Help & support</span>
                                                <svg className={styles.menuChevron} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </button>

                                            <button className={styles.menuActionItem} onClick={logout}>
                                                <div className={styles.menuIconWrapper}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                        <polyline points="16 17 21 12 16 7" />
                                                        <line x1="21" y1="12" x2="9" y2="12" />
                                                    </svg>
                                                </div>
                                                <span className={styles.menuItemText}>Log out</span>
                                            </button>
                                        </div>

                                        <div className={styles.menuFooter}>
                                            <div className={styles.footerLinks}>
                                                <Link href="/privacy-policy" className={styles.footerLink}>Privacy</Link> ·
                                                <Link href="/terms-and-conditions" className={styles.footerLink}>Terms</Link> ·
                                                <Link href="#" className={styles.footerLink}>Advertising</Link> ·
                                                <Link href="#" className={styles.footerLink}>Ad choices</Link> ·
                                                <Link href="#" className={styles.footerLink}>Cookies</Link> ·
                                                <Link href="#" className={styles.footerLink}>More</Link>
                                            </div>
                                            <p style={{ marginTop: '8px', opacity: 0.6 }}>MadJock © 2026</p>
                                        </div>
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
                                <Link href={`/profile/${user.id || user._id}`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                                    My Profile
                                </Link>
                                <Link href={`/profile/${user.id || user._id}?edit=true`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                                    Edit Profile
                                </Link>
                                <Link href="/dashboard" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                                    Dashboard
                                </Link>
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
