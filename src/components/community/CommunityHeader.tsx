'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/community/Community.module.css';

interface CommunityHeaderProps {
    onSearch: (query: string) => void;
    onMembersClick: () => void;
    onHomeClick?: () => void;
}

export default function CommunityHeader({ onSearch, onMembersClick, onHomeClick }: CommunityHeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleHomeClick = () => {
        setSearchQuery('');
        if (onHomeClick) {
            onHomeClick();
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <form className={styles.searchContainer} onSubmit={handleSearch}>
                    <div className={styles.searchIconWrapper}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.headerSearch}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <div className={styles.headerCenter}>
                <Link
                    href="/community"
                    className={`${styles.navIcon} ${styles.navActive}`}
                    title="Home Feed"
                    onClick={handleHomeClick}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                </Link>
                <Link
                    href="/community?filter=following"
                    className={styles.navIcon}
                    title="Following"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                </Link>
                <div
                    className={styles.navIcon}
                    title="Members"
                    onClick={onMembersClick}
                    style={{ cursor: 'pointer' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div className={styles.navIcon} title="Safety & Support">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
            </div>

            <div className={styles.headerRight}>
                {/* User info moved to main header as requested */}
                <button className={styles.navIcon} style={{ background: 'none', border: 'none' }} title="Help Center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </button>
            </div>
        </header>
    );
}
