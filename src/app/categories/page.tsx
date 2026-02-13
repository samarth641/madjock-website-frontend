'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';
import styles from './page.module.css';

// Icon mapping for categories (matching CategoryGrid)
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

const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (categoryIcons[name]) return categoryIcons[name];
    for (const [key, icon] of Object.entries(categoryIcons)) {
        if (name.includes(key) || key.includes(name)) return icon;
    }
    return categoryIcons['default'];
};

export default function CategoriesPage() {
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

    const displayCategories = categories.length > 0 ? categories : [
        { _id: '1', name: 'Restaurants', description: 'Food & Dining' },
        { _id: '2', name: 'Hotels', description: 'Accommodation' },
        { _id: '3', name: 'Beauty Spa', description: 'Wellness' },
        { _id: '4', name: 'Education', description: 'Learning' },
        { _id: '5', name: 'Healthcare', description: 'Medical service' },
        { _id: '6', name: 'Fitness Gym', description: 'Workouts' },
        { _id: '7', name: 'Real Estate', description: 'Property' },
        { _id: '8', name: 'Events', description: 'Celebrations' },
    ];

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading categories...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>All Categories</h1>
                    <p className={styles.subtitle}>Explore businesses by their specialty</p>
                </header>

                <div className={styles.grid}>
                    {displayCategories.map((category, index) => (
                        <Link
                            key={category._id || `cat-${index}`}
                            href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className={styles.categoryCard}
                        >
                            <div className={styles.iconWrapper}>
                                {getCategoryIcon(category.name)}
                            </div>
                            <span className={styles.categoryName}>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
