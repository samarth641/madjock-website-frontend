'use client';

import { useState, useEffect } from 'react';
import styles from './LocationModal.module.css';

interface LocationModalProps {
    isOpen: boolean;
    onSelect: (city: string, source: 'auto' | 'manual') => void;
    onClose: () => void;
}

const POPULAR_CITIES = ['Nagpur', 'Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function LocationModal({ isOpen, onSelect, onClose }: LocationModalProps) {
    const [search, setSearch] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const handleDetectLocation = () => {
        setDetecting(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                        {
                            headers: {
                                'Accept-Language': 'en-US',
                                'User-Agent': 'Madjock-Website-Frontend'
                            }
                        }
                    );
                    const data = await response.json();

                    // Nominatim returns various fields. We try to find the most specific city-like name.
                    const city = data.address.city ||
                        data.address.town ||
                        data.address.city_district ||
                        data.address.village ||
                        data.address.suburb ||
                        data.address.municipality ||
                        data.address.state_district ||
                        data.address.county ||
                        data.address.state;

                    if (city) {
                        onSelect(city, 'auto');
                    } else {
                        onSelect('Nagpur', 'auto');
                    }
                    setDetecting(false);
                } catch (error) {
                    onSelect('Nagpur', 'auto');
                    setDetecting(false);
                }
            }, (error) => {
                alert("Location permission denied. Please select your city manually.");
                setDetecting(false);
            });
        } else {
            alert("Geolocation is not supported by your browser.");
            setDetecting(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            onSelect(search.trim(), 'manual');
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <h2 className={styles.title}>Select Your Location</h2>
                    <p className={styles.subtitle}>Get personalized search results for your city</p>
                </div>

                <div className={styles.searchArea}>
                    <button
                        className={styles.detectBtn}
                        onClick={handleDetectLocation}
                        disabled={detecting}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                        {detecting ? 'Detecting Location...' : 'Auto Detect My Location'}
                    </button>

                    <form onSubmit={handleSearchSubmit} className={styles.inputGroup}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Type your city manually (e.g. Mumbai, Bangalore)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                <div className={styles.popularCities}>
                    <h3 className={styles.popularTitle}>Popular Cities</h3>
                    <div className={styles.cityGrid}>
                        {POPULAR_CITIES.map(city => (
                            <button
                                key={city}
                                className={styles.cityBtn}
                                onClick={() => onSelect(city, 'manual')}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
