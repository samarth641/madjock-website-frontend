'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserBusinesses } from '@/lib/api';
import { Business } from '@/types';
import styles from './page.module.css';
import Link from 'next/link';

export default function Dashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        if (user) {
            fetchUserBusinesses();
        }
    }, [user, authLoading]);

    const fetchUserBusinesses = async () => {
        try {
            const userId = user?.id || (user as any)?._id;
            if (userId) {
                const data = await getUserBusinesses(userId);
                setBusinesses(data);
            }
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={styles.dashboardPage}>
                <div className="container">
                    <div className={styles.loadingWrapper}>
                        <div className={styles.skeleton} style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardPage}>
            <div className="container">
                <header className={styles.dashboardHeader}>
                    <h1 className={styles.welcomeText}>Welcome, {user?.name || 'User'}!</h1>
                    <p className={styles.subText}>Manage your activity and businesses here.</p>
                </header>

                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>My Businesses</h2>
                </div>

                <div className={styles.grid}>
                    {businesses.map((business, index) => {
                        const imageUrl = business.logo || business.banner || (business.images && business.images[0]) || '/placeholder-business.jpg';
                        const status = (business.status || 'pending').toLowerCase();

                        return (
                            <Link
                                key={business._id || `biz-${index}`}
                                href={`/businesses/${business._id}?edit=true`}
                                className={styles.card}
                            >
                                <div className={styles.cardImageWrapper}>
                                    <img src={imageUrl} alt={business.businessName} className={styles.cardImage} />
                                    <div className={`${styles.statusBadge} ${status === 'approved' ? styles.statusApproved : styles.statusPending}`}>
                                        {status === 'approved' ? 'Approved' : 'Under Review'}
                                    </div>
                                </div>

                                <div className={styles.cardContent}>
                                    <h2 className={styles.cardTitle}>{business.businessName}</h2>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardCategory}>{business.businessCategory}</span>
                                        {business.city && (
                                            <span className={styles.cardLocation}>
                                                • {business.city}, {business.state}
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.cardDescription}>
                                        {business.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className={styles.cardFooter}>
                                    Manage Business
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Add New Business Card */}
                    <Link href="/dashboard/add-business" className={styles.addCard}>
                        <div className={styles.addIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                        <span className={styles.addText}>Add New Business</span>
                    </Link>
                </div>

                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Account Settings</h2>
                </div>

                <div className={styles.grid}>
                    {/* My Profile Card */}
                    <Link href={`/profile/${user?.id || (user as any)?._id}`} className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>My Profile</h2>
                            <p className={styles.cardSubtitle}>Update your personal information</p>
                        </div>
                        <div className={styles.cardFooter}>
                            View Profile
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
