'use client';

import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch?: (query: string, location: string) => void;
    initialLocation?: string;
}

export default function SearchBar({ onSearch, initialLocation = '' }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState(initialLocation);

    useEffect(() => {
        if (initialLocation) {
            setLocation(initialLocation);
        }
    }, [initialLocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(query.trim(), location.trim());
        }
    };

    return (
        <div className={styles.searchContainer}>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
                {/* Location Input */}
                <div className={styles.inputGroup}>
                    <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Location (e.g., Mumbai, Bangalore)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.divider}></div>

                {/* Search Input */}
                <div className={styles.inputGroup}>
                    <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for Spa & Salons, Restaurants..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={styles.input}
                    />
                    <button type="button" className={styles.voiceBtn} aria-label="Voice search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    </button>
                </div>

                {/* Search Button */}
                <button type="submit" className={styles.searchBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
