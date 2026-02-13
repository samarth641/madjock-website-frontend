'use client';

import { useState, useEffect } from 'react';
import styles from './FeaturedBanner.module.css';

const banners = [
    {
        id: 1,
        title: "Valentine's Day Special",
        subtitle: "Find top offerings near you",
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
        emoji: '❤️',
    },
    {
        id: 2,
        title: 'B2B Services',
        subtitle: 'Quick Quotes for your business',
        gradient: 'linear-gradient(135deg, #0066ff 0%, #00c6ff 100%)',
        emoji: '💼',
    },
    {
        id: 3,
        title: 'Repairs & Services',
        subtitle: 'Find the nearest vendor',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        emoji: '🔧',
    },
    {
        id: 4,
        title: 'Real Estate',
        subtitle: 'Finest Agents in your city',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        emoji: '🏘️',
    },
    {
        id: 5,
        title: 'Doctors',
        subtitle: 'Book appointments now',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        emoji: '👨‍⚕️',
    },
];

export default function FeaturedBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    return (
        <div className={styles.bannerSection}>
            <div className={styles.bannerContainer}>
                <div
                    className={styles.bannerSlider}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className={styles.banner}
                            style={{ background: banner.gradient }}
                        >
                            <div className={styles.bannerContent}>
                                <span className={styles.emoji}>{banner.emoji}</span>
                                <h2 className={styles.bannerTitle}>{banner.title}</h2>
                                <p className={styles.bannerSubtitle}>{banner.subtitle}</p>
                                <button className={styles.exploreBtn}>Explore Now</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button className={styles.navBtn + ' ' + styles.prevBtn} onClick={prevSlide}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className={styles.navBtn + ' ' + styles.nextBtn} onClick={nextSlide}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                {/* Dots Indicator */}
                <div className={styles.dotsContainer}>
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
