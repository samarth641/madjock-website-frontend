'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import styles from './CategoryDrawer.module.css';

interface CategoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    getIcon: (name: string) => string;
}

export default function CategoryDrawer({ isOpen, onClose, categories, getIcon }: CategoryDrawerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const drawerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Focus search input when drawer opens
            setTimeout(() => searchInputRef.current?.focus(), 100);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const sortedCategories = [...categories].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    });

    const filteredCategories = sortedCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
                onClick={(e) => e.stopPropagation()}
                ref={drawerRef}
            >
                <div className={styles.header}>
                    <div className={styles.headerLayout}>
                        <div className={styles.headerLeft}>
                            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                            <h2 className={styles.title}>Popular Categories</h2>
                        </div>
                        <div className={styles.searchContainer}>
                            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search"
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    {filteredCategories.length > 0 ? (
                        <div className={styles.grid}>
                            {filteredCategories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className={styles.item}
                                    onClick={onClose}
                                >
                                    <span className={styles.itemIcon}>
                                        {category.icon ? (
                                            <img src={category.icon} alt={category.name} className={styles.itemIconImg} />
                                        ) : (
                                            getIcon(category.name)
                                        )}
                                    </span>
                                    <span className={styles.itemName}>{category.name}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <span>No categories found matching "{searchTerm}"</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
