'use client';

import { useState, useEffect } from 'react';
import styles from './LocationModal.module.css';

interface LocationModalProps {
    isOpen: boolean;
    onSelect: (city: string) => void;
}

const POPULAR_CITIES = ['Nagpur', 'Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function LocationModal({ isOpen, onSelect }: LocationModalProps) {
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
                    // Use a reverse geocoding API or a simple mock since we don't have a key
                    // For now, let's assume we detected 'Nagpur' for demo if it's successful
                    // In a real app, you'd call a geocoding service here
                    console.log(`📍 Detected coordinates: ${latitude}, ${longitude}`);

                    // Mocking detection success
                    setTimeout(() => {
                        onSelect('Nagpur');
                        setDetecting(false);
                    }, 1000);
                } catch (error) {
                    console.error("❌ Error detecting location:", error);
                    alert("Could not detect your exact location. Please select manually.");
                    setDetecting(false);
                }
            }, (error) => {
                console.error("❌ Geolocation permission denied:", error);
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
            onSelect(search.trim());
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
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
                            placeholder="Type your city manually (e.g. Nagpur)"
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
                                onClick={() => onSelect(city)}
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
