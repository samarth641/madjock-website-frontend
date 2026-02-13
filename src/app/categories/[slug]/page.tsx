'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBusinesses } from '@/lib/api';
import { Business } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import styles from '@/app/businesses/page.module.css';

export default function CategoryDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const categoryName = slug.replace(/-/g, ' ');

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBusinesses();
    }, [slug]);

    const loadBusinesses = async () => {
        setLoading(true);
        // We pass the category name to the API
        // The API function getBusinesses handles the search params
        const data = await getBusinesses({ category: categoryName, status: 'approved' });

        // Manual filter backup if API filtering is not working as expected
        const filtered = data.filter(b =>
            b.businessCategory?.toLowerCase().includes(categoryName.toLowerCase()) ||
            categoryName.toLowerCase().includes(b.businessCategory?.toLowerCase() || '')
        );

        setBusinesses(filtered.length > 0 ? filtered : data);
        setLoading(false);
    };

    return (
        <div className={styles.businessesPage}>
            <section className={styles.searchSection}>
                <div className="container">
                    <h1 className={styles.pageTitle}>
                        {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                    </h1>
                    <p style={{ color: 'white', textAlign: 'center', opacity: 0.9 }}>
                        Discover the best {categoryName} in your area
                    </p>
                </div>
            </section>

            <div className="container">
                <div className={styles.resultsHeader} style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className={styles.resultsTitle}>
                            {businesses.length} {categoryName} found
                        </h2>
                        <Link href="/categories" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                            View all categories →
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingGrid}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.skeleton}></div>
                        ))}
                    </div>
                ) : businesses.length > 0 ? (
                    <div className={styles.businessGrid}>
                        {businesses.map((business) => (
                            <BusinessCard key={business._id} business={business} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <h3>No businesses found</h3>
                        <p>We couldn't find any businesses in the "{categoryName}" category.</p>
                        <Link href="/categories" className={styles.filterActive} style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
                            Browse other categories
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
