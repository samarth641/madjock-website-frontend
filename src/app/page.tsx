'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedBanner from '@/components/FeaturedBanner';
import BusinessCard from '@/components/BusinessCard';
import LocationModal from '@/components/LocationModal';
import { getFeaturedBusinesses, getBusinesses } from '@/lib/api';
import { Business } from '@/types';
import styles from './page.module.css';

export default function HomePage() {
    const router = useRouter();
    const [displayBusinesses, setDisplayBusinesses] = useState<Business[]>([]);
    const [nearYouBusinesses, setNearYouBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [userCity, setUserCity] = useState<string>('');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    useEffect(() => {
        // Check for stored location
        const storedCity = localStorage.getItem('userCity');
        if (storedCity) {
            setUserCity(storedCity);
            loadPageData(storedCity);
        } else {
            // Try to use browser geolocation directly
            handleAutoDetect();
        }
    }, []);

    const handleAutoDetect = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const detectedCity = 'Nagpur';
                    handleLocationSelect(detectedCity);
                },
                (error) => {
                    console.error("❌ Geolocation error or denied:", error);
                    setIsLocationModalOpen(true);
                    if (!userCity) {
                        loadPageData('Nagpur');
                    }
                }
            );
        } else {
            setIsLocationModalOpen(true);
            loadPageData('Nagpur');
        }
    };

    const loadPageData = async (city: string) => {
        setLoading(true);
        const [featured, nearYou] = await Promise.all([
            getFeaturedBusinesses(city),
            getBusinesses({ city, status: 'approved' })
        ]);

        setDisplayBusinesses(Array.isArray(featured) ? featured : []);
        setNearYouBusinesses(Array.isArray(nearYou) ? nearYou.slice(0, 6) : []);
        setLoading(false);
    };

    const handleLocationSelect = (city: string) => {
        localStorage.setItem('userCity', city);
        setUserCity(city);
        setIsLocationModalOpen(false);
        loadPageData(city);
    };

    const handleSearch = (query: string, location: string) => {
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        params.set('city', location || userCity);

        router.push(`/businesses?${params.toString()}`);
    };

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Search across <span className={styles.highlight}>5.3 Crore+</span> Businesses
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Find the best local businesses, services, and professionals near you
                        </p>
                        <SearchBar onSearch={handleSearch} initialLocation={userCity} />
                    </div>
                </div>
            </section>

            {/* Featured Banners */}
            <section className="container">
                <FeaturedBanner />
            </section>

            {/* Categories */}
            <section className="container">
                <h2 className={styles.sectionTitle}>Browse by Category</h2>
                <CategoryGrid />
            </section>

            {/* Featured Businesses */}
            {loading ? (
                <section className="container">
                    <h2 className={styles.sectionTitle}>Featured Businesses</h2>
                    <div className={styles.businessGrid}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={styles.skeleton}></div>
                        ))}
                    </div>
                </section>
            ) : displayBusinesses.length > 0 ? (
                <section className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Featured Businesses in {userCity}</h2>
                        <a href={`/businesses?city=${userCity}`} className={styles.viewAll}>
                            View All
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </a>
                    </div>
                    <div className={styles.businessGrid}>
                        {displayBusinesses.map((business, index) => (
                            <BusinessCard key={business._id || `featured-${index}`} business={business} />
                        ))}
                    </div>
                </section>
            ) : null}

            {/* Near You Businesses */}
            {!loading && nearYouBusinesses.length > 0 && (
                <section className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Best Rated in {userCity}</h2>
                        <a href={`/businesses?city=${userCity}`} className={styles.viewAll}>
                            View All
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </a>
                    </div>
                    <div className={styles.businessGrid}>
                        {nearYouBusinesses.map((business, index) => (
                            <BusinessCard key={business._id || `near-you-${index}`} business={business} />
                        ))}
                    </div>
                </section>
            )}

            {/* Popular Searches */}
            <section className="container">
                <h2 className={styles.sectionTitle}>Popular Searches in {userCity}</h2>
                <div className={styles.popularSearches}>
                    {[
                        'Interior Designers',
                        'Banquet Halls',
                        'Caterers',
                        'Car Rental',
                        'Dentists',
                        'Gyms',
                        'Packers & Movers',
                        'Restaurants',
                        'Beauty Parlours',
                        'Hotels',
                        'Real Estate Agents',
                        'Wedding Planners',
                    ].map((search) => (
                        <a
                            key={search}
                            href={`/businesses?search=${encodeURIComponent(search)}&city=${userCity}`}
                            className={styles.searchTag}
                        >
                            {search}
                        </a>
                    ))}
                </div>
            </section>

            {/* Tourist Places */}
            <section className="container">
                <h2 className={styles.sectionTitle}>
                    Explore Top Tourist Places <span className={styles.newBadge}>NEW</span>
                </h2>
                <div className={styles.touristGrid}>
                    {[
                        { name: 'Ujjain', image: '🕉️' },
                        { name: 'Hyderabad', image: '🏛️' },
                        { name: 'Prayagraj', image: '🌊' },
                        { name: 'Nashik', image: '⛰️' },
                    ].map((place) => (
                        <a key={place.name} href={`/places/${place.name.toLowerCase()}`} className={styles.touristCard}>
                            <div className={styles.touristEmoji}>{place.image}</div>
                            <h3 className={styles.touristName}>{place.name}</h3>
                            <span className={styles.exploreLink}>Explore →</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Location Selection Modal */}
            <LocationModal
                isOpen={isLocationModalOpen}
                onSelect={handleLocationSelect}
            />
        </div>
    );
}
