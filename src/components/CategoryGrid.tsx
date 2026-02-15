'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';
import CategoryDrawer from './CategoryDrawer';
import styles from './CategoryGrid.module.css';

// Icon mapping for categories
const categoryIcons: { [key: string]: string } = {
    'restaurant': '🍽️',
    'restaurants': '🍽️',
    'hotel': '🏨',
    'hotels': '🏨',
    'beauty': '💆',
    'spa': '💆',
    'home': '🏠',
    'decor': '🏠',
    'wedding': '💒',
    'education': '🎓',
    'rent': '🚗',
    'hire': '🚗',
    'hospital': '🏥',
    'healthcare': '🏥',
    'medical': '🏥',
    'contractor': '🔨',
    'construction': '🔨',
    'pet': '🐾',
    'hostel': '🛏️',
    'pg': '🛏️',
    'estate': '🏢',
    'real estate': '🏢',
    'dentist': '🦷',
    'dental': '🦷',
    'gym': '💪',
    'fitness': '💪',
    'loan': '💰',
    'finance': '💰',
    'event': '🎉',
    'driving': '🚙',
    'packer': '📦',
    'mover': '📦',
    'courier': '📮',
    'delivery': '📮',
    'food': '🍔',
    'retail': '🛍️',
    'shopping': '🛍️',
    'service': '🔧',
    'default': '📋'
};

// Get icon for category
const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();

    // Check for exact match
    if (categoryIcons[name]) {
        return categoryIcons[name];
    }

    // Check for partial match
    for (const [key, icon] of Object.entries(categoryIcons)) {
        if (name.includes(key) || key.includes(name)) {
            return icon;
        }
    }

    return categoryIcons['default'];
};

export default function CategoryGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadCategories();
        const handleOpenDrawer = () => setIsDrawerOpen(true);
        window.addEventListener('open-category-drawer', handleOpenDrawer);
        return () => window.removeEventListener('open-category-drawer', handleOpenDrawer);
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    // Use API categories or fallbacks
    const allCategories = categories.length > 0 ? categories : [
        { _id: '1', name: 'Restaurants', description: 'Food & Dining' },
        { _id: '2', name: 'Hotels', description: 'Accommodation' },
        { _id: '3', name: 'Beauty Spa', description: 'Beauty & Wellness' },
        { _id: '4', name: 'Education', description: 'Schools & Training' },
        { _id: '5', name: 'Healthcare', description: 'Hospitals & Clinics' },
        { _id: '6', name: 'Fitness', description: 'Gyms & Sports' },
        { _id: '7', name: 'Real Estate', description: 'Property' },
        { _id: '8', name: 'Event Setup', description: 'Parties' },
        { _id: '9', name: 'Logistics', description: 'Delivery' },
        { _id: '10', name: 'Pet Care', description: 'Pets' },
        { _id: '11', name: 'Repairs', description: 'Handyman' },
        { _id: '12', name: 'Car Hire', description: 'Rentals' },
        { _id: '13', name: 'Dental', description: 'Dentists' },
    ];

    // Take featured categories for the home grid
    const gridCategories = allCategories
        .filter(cat => cat.featured === true)
        .slice(0, 13);

    return (
        <div className={styles.categorySection}>
            <div className={styles.categoryGrid}>
                {gridCategories.map((category, index) => (
                    <Link
                        key={category._id || `cat-${index}`}
                        href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className={styles.categoryCard}
                    >
                        <div className={styles.iconWrapper}>
                            {category.icon ? (
                                <img src={category.icon} alt={category.name} className={styles.categoryIconImg} />
                            ) : (
                                <span className={styles.icon}>{getCategoryIcon(category.name)}</span>
                            )}
                        </div>
                        <span className={styles.categoryName}>{category.name}</span>
                    </Link>
                ))}

                {/* 14th item: More button */}
                <button
                    className={styles.moreCard}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <div className={styles.iconWrapper}>
                        <div className={styles.moreIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <path d="M3 14h7m-3.5-3.5v7" />
                            </svg>
                        </div>
                    </div>
                    <span className={styles.categoryName}>More</span>
                </button>
            </div>

            <CategoryDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                categories={allCategories}
                getIcon={getCategoryIcon}
            />
        </div>
    );
}
