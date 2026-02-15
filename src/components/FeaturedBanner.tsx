import { useState, useEffect } from 'react';
import { getActiveSliders } from '@/lib/api';
import { Slider } from '@/types';
import styles from './FeaturedBanner.module.css';

export default function FeaturedBanner() {
    const [sliders, setSliders] = useState<Slider[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const data = await getActiveSliders();
                setSliders(data);
            } catch (error) {
                console.error('Error fetching sliders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSliders();
    }, []);

    useEffect(() => {
        if (sliders.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sliders.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [sliders]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        if (sliders.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % sliders.length);
    };

    const prevSlide = () => {
        if (sliders.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
    };

    if (loading) {
        return (
            <div className={styles.bannerSection}>
                <div className={styles.bannerContainer}>
                    <div className={styles.skeleton} />
                </div>
            </div>
        );
    }

    if (sliders.length === 0) return null;

    return (
        <div className={styles.bannerSection}>
            <div className={styles.bannerContainer}>
                <div
                    className={styles.bannerSlider}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {sliders.map((slider) => (
                        <div
                            key={slider._id}
                            className={styles.banner}
                            style={{
                                backgroundImage: `url(${slider.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className={styles.bannerOverlay} />
                            <div className={styles.bannerContent}>
                                <h2 className={styles.bannerTitle}>{slider.title}</h2>
                                {slider.description && (
                                    <p className={styles.bannerSubtitle}>{slider.description}</p>
                                )}
                                {slider.link && (
                                    <a href={slider.link} className={styles.exploreBtn}>
                                        Explore Now
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {sliders.length > 1 && (
                    <>
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
                            {sliders.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
