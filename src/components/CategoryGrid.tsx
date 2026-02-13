'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';
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

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    // Fallback categories if API returns empty
    const displayCategories = categories.length > 0 ? categories : [
        { _id: '1', name: 'Restaurants', description: 'Food & Dining' },
        { _id: '2', name: 'Hotels', description: 'Accommodation' },
        { _id: '3', name: 'Beauty Spa', description: 'Beauty & Wellness' },
        { _id: '4', name: 'Education', description: 'Schools & Training' },
        { _id: '5', name: 'Healthcare', description: 'Hospitals & Clinics' },
        { _id: '6', name: 'Fitness', description: 'Gyms & Sports' },
    ];

    return (
        <div className={styles.categorySection}>
            <div className={styles.categoryGrid}>
                {displayCategories.slice(0, 20).map((category, index) => (
                    <Link
                        key={category._id || `cat-${index}`}
                        href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className={styles.categoryCard}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className={styles.iconWrapper}>
                            <span className={styles.icon}>{getCategoryIcon(category.name)}</span>
                        </div>
                        <span className={styles.categoryName}>{category.name}</span>
                    </Link>
                ))}

                {/* More button */}
                <Link
                    key="more-categories"
                    href="/categories"
                    className={styles.categoryCard}
                    style={{ animationDelay: `${Math.min(displayCategories.length, 20) * 0.05}s` }}
                >
                    <div className={styles.iconWrapper}>
                        <span className={styles.icon}>⋯</span>
                    </div>
                    <span className={styles.categoryName}>More</span>
                </Link>
            </div>
        </div>
    );
}
