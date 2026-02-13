'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BusinessCard from '@/components/BusinessCard';
import SearchBar from '@/components/SearchBar';
import { getBusinesses, searchBusinesses } from '@/lib/api';
import { Business } from '@/types';
import styles from './page.module.css';

function BusinessesContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const initialCity = searchParams.get('city') || '';

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [userCity, setUserCity] = useState<string>('');

    useEffect(() => {
        const storedCity = localStorage.getItem('userCity') || '';
        const effectiveCity = initialCity || storedCity;

        if (effectiveCity) {
            setUserCity(effectiveCity);
        }

        if (initialSearch || effectiveCity) {
            handleSearch(initialSearch, effectiveCity);
        } else {
            loadBusinesses(effectiveCity);
        }
    }, [initialSearch, initialCity]);

    const loadBusinesses = async (city?: string) => {
        setLoading(true);
        const data = await getBusinesses({ status: 'approved', city: city || userCity });
        setBusinesses(data);
        setLoading(false);
    };

    const handleSearch = async (query: string, location: string) => {
        setLoading(true);
        const results = await searchBusinesses(query, location);
        setBusinesses(results);
        setLoading(false);
    };

    const filteredBusinesses = businesses.filter(business => {
        if (filter === 'all') return true;
        return business.businessCategory.toLowerCase().includes(filter.toLowerCase());
    });

    return (
        <div className={styles.businessesPage}>
            {/* Search Section */}
            <section className={styles.searchSection}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Find Local Businesses</h1>
                    <SearchBar onSearch={handleSearch} initialLocation={userCity} />
                </div>
            </section>

            {/* Filters */}
            <section className="container">
                <div className={styles.filters}>
                    <button
                        className={filter === 'all' ? styles.filterActive : styles.filterBtn}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={filter === 'retail' ? styles.filterActive : styles.filterBtn}
                        onClick={() => setFilter('retail')}
                    >
                        Retail
                    </button>
                    <button
                        className={filter === 'food' ? styles.filterActive : styles.filterBtn}
                        onClick={() => setFilter('food')}
                    >
                        Food & Beverage
                    </button>
                    <button
                        className={filter === 'service' ? styles.filterActive : styles.filterBtn}
                        onClick={() => setFilter('service')}
                    >
                        Services
                    </button>
                    <button
                        className={filter === 'health' ? styles.filterActive : styles.filterBtn}
                        onClick={() => setFilter('health')}
                    >
                        Healthcare
                    </button>
                </div>
            </section>
            {/* Results */}
            <section className="container">
                <div className={styles.resultsHeader}>
                    <h2 className={styles.resultsTitle}>
                        {loading ? 'Loading...' : `${filteredBusinesses.length} Businesses Found`}
                    </h2>
                </div>

                {loading ? (
                    <div className={styles.loadingGrid}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={styles.skeleton}></div>
                        ))}
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className={styles.businessGrid}>
                        {filteredBusinesses.map((business, index) => (
                            <BusinessCard key={business._id || `business-${index}`} business={business} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <h3>No businesses found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function BusinessesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BusinessesContent />
        </Suspense>
    );
}
