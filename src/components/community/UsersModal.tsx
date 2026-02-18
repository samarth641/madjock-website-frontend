'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/community/Community.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { getFollowers, getFollowing, followUser, unfollowUser, getUserProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface User {
    _id: string;
    name: string;
    avatar?: string;
    isFollowing?: boolean;
}

interface UsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialTab?: 'followers' | 'following';
}

export default function UsersModal({ isOpen, onClose, userId, initialTab = 'followers' }: UsersModalProps) {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (isOpen && userId) {
            fetchUsers();
        }
    }, [isOpen, activeTab, userId]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const currentId = currentUser?.id || currentUser?._id;
            const data = activeTab === 'followers'
                ? await getFollowers(userId, currentId)
                : await getFollowing(userId, currentId);

            setUsers(data || []);
        } catch (error) {
            console.error(`Error fetching ${activeTab}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFollow = async (e: React.MouseEvent, targetId: string, currentlyFollowing: boolean) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) return;

        const currentId = currentUser.id || currentUser._id || '';
        try {
            if (currentlyFollowing) {
                await unfollowUser(targetId, currentId);
            } else {
                await followUser(targetId, currentId);
            }

            // Optimistic update
            setUsers(prev => prev.map(u =>
                u._id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u
            ));
        } catch (error) {
            console.error('Follow toggle failed:', error);
        }
    };

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.glassModalOverlay} onClick={onClose}>
            <div className={styles.glassModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{activeTab === 'followers' ? 'Followers' : 'Following'}</h2>
                    <button className={styles.closeModalBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.modalTabList}>
                    <button
                        className={`${styles.modalTab} ${activeTab === 'followers' ? styles.modalTabActive : ''}`}
                        onClick={() => setActiveTab('followers')}
                    >
                        Followers
                    </button>
                    <button
                        className={`${styles.modalTab} ${activeTab === 'following' ? styles.modalTabActive : ''}`}
                        onClick={() => setActiveTab('following')}
                    >
                        Following
                    </button>
                </div>

                <div style={{ padding: '0 16px 16px' }}>
                    <div className={styles.searchContainer} style={{ maxWidth: '100%' }}>
                        <div className={styles.searchIconWrapper}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Filter members..."
                            className={styles.headerSearch}
                            style={{ paddingLeft: '2.2rem' }}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.usersList}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#65676b' }}>
                            <div className={styles.loadingSpinner} style={{ marginBottom: '1rem' }} />
                            Fetching {activeTab}...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#65676b' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
                            <p style={{ fontWeight: 500 }}>
                                {searchQuery ? 'No members match your search.' : `No ${activeTab} yet.`}
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map(u => (
                            <div key={u._id} className={styles.userListItem}>
                                <Link href={`/profile/${u._id}`} className={styles.userListMain} onClick={onClose}>
                                    <Image
                                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}
                                        alt={u.name}
                                        width={44}
                                        height={44}
                                        className={styles.userListAvatar}
                                        unoptimized
                                    />
                                    <span className={styles.userListName}>{u.name}</span>
                                </Link>

                                {currentUser && (currentUser.id || currentUser._id) !== u._id && (
                                    <button
                                        className={`${styles.followButtonSm} ${u.isFollowing ? styles.followBtnSecondary : styles.followBtnPrimary}`}
                                        onClick={(e) => handleToggleFollow(e, u._id, u.isFollowing || false)}
                                    >
                                        {u.isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
