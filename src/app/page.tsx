'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedBanner from '@/components/FeaturedBanner';
import BusinessCard from '@/components/BusinessCard';
import LocationModal from '@/components/LocationModal';
import { getBusinesses } from '@/lib/api';
import { Business } from '@/types';
import styles from './page.module.css';

export default function HomePage() {
    const router = useRouter();
    const [displayBusinesses, setDisplayBusinesses] = useState<Business[]>([]);
    const [nearYouBusinesses, setNearYouBusinesses] = useState<Business[]>([]);
    const [topRatedBusinesses, setTopRatedBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [userCity, setUserCity] = useState<string>('');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    useEffect(() => {
        const storedCity = localStorage.getItem('userCity');
        const source = localStorage.getItem('locationSource');

        if (storedCity) {
            setUserCity(storedCity);
            loadPageData(storedCity);
        }

        // Only auto-detect on refresh if it wasn't a manual choice
        if (!source || source === 'auto') {
            handleAutoDetect();
        }
    }, []);

    const handleAutoDetect = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
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
                        const city = data.address.city ||
                            data.address.town ||
                            data.address.city_district ||
                            data.address.village ||
                            data.address.suburb ||
                            data.address.municipality ||
                            data.address.state_district ||
                            'Nagpur';

                        const currentStored = localStorage.getItem('userCity');
                        // Use 'auto' source for background detection
                        if (city !== currentStored) {
                            handleLocationSelect(city, 'auto');
                        }
                    } catch (error) {
                        if (!localStorage.getItem('userCity')) {
                            handleLocationSelect('Nagpur', 'auto');
                        }
                    }
                },
                (error) => {
                    if (!localStorage.getItem('userCity')) {
                        setIsLocationModalOpen(true);
                        loadPageData('Nagpur');
                    }
                }
            );
        } else if (!localStorage.getItem('userCity')) {
            setIsLocationModalOpen(true);
            loadPageData('Nagpur');
        }
    };

    const loadPageData = async (city: string) => {
        setLoading(true);
        try {
            const allBusinesses = await getBusinesses({ city, status: 'approved' });

            // 1. Featured Businesses
            const featured = allBusinesses.filter(b => b.featured).slice(0, 6);
            setDisplayBusinesses(featured);

            // 2. Top Rated Businesses (Sorted by rating)
            const topRated = [...allBusinesses]
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 6);
            setTopRatedBusinesses(topRated);

            // 3. Near You (Default list)
            setNearYouBusinesses(allBusinesses.slice(0, 6));
        } catch (error) {
            console.error("Error loading page data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (city: string, source: 'auto' | 'manual' = 'manual') => {
        localStorage.setItem('userCity', city);
        localStorage.setItem('locationSource', source);
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
                        <h2 className={styles.sectionTitle}>Featured Businesses</h2>
                        <a href={`/businesses?city=${userCity}&featured=true`} className={styles.viewAll}>
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

            {/* Top Rated Businesses */}
            {!loading && topRatedBusinesses.length > 0 && (
                <section className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Top Rated Businesses</h2>
                        <a href={`/businesses?city=${userCity}&sort=rating`} className={styles.viewAll}>
                            View All
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </a>
                    </div>
                    <div className={styles.businessGrid}>
                        {topRatedBusinesses.map((business, index) => (
                            <BusinessCard key={business._id || `top-rated-${index}`} business={business} />
                        ))}
                    </div>
                </section>
            )}


            {/* Popular Searches */}
            <section className="container">
                <h2 className={styles.sectionTitle}>Popular Searches</h2>
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
                onClose={() => setIsLocationModalOpen(false)}
            />
        </div>
    );
}
