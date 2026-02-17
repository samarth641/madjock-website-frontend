'use client';

import React, { useEffect, useState } from 'react';
import styles from './Community.module.css';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/community/PostCard';
import CreatePostWidget from '@/components/community/CreatePostWidget';
import LoginModal from '@/components/LoginModal';
import CommunityHeader from '@/components/community/CommunityHeader';
import { getPosts, searchCommunity } from '@/lib/api';
import { Post } from '@/types';

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<{ posts: Post[]; users: any[] } | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await getPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }
        setLoading(true);
        try {
            const results = await searchCommunity(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginReq = () => {
        setIsLoginModalOpen(true);
    };

    const displayPosts = searchResults ? searchResults.posts : posts;

    return (
        <div className={styles.container}>
            <div className={styles.mainLayout}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <CommunityHeader onSearch={handleSearch} />
                </div>

                {/* Left Sidebar */}
                <div className={styles.leftSidebar}>
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarSection}>
                            <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                                <div className={styles.sidebarIcon}>🏠</div>
                                <span>Home Feed</span>
                            </div>
                            <div className={styles.sidebarItem}>
                                <div className={styles.sidebarIcon}>👥</div>
                                <span>Friends</span>
                            </div>
                            <div className={styles.sidebarItem}>
                                <div className={styles.sidebarIcon}>🛡️</div>
                                <span>Groups</span>
                            </div>
                            <div className={styles.sidebarItem}>
                                <div className={styles.sidebarIcon}>📺</div>
                                <span>Watch</span>
                            </div>
                            <div className={styles.sidebarItem}>
                                <div className={styles.sidebarIcon}>🏙️</div>
                                <span>Marketplace</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Feed */}
                <div className={styles.feed}>
                    {!searchResults && (
                        <CreatePostWidget
                            onPostCreated={fetchPosts}
                            onLoginReq={handleLoginReq}
                        />
                    )}

                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading feed...</div>
                    ) : (
                        <>
                            {searchResults && searchResults.users.length > 0 && (
                                <div className={styles.userSearchSection}>
                                    <h2 className={styles.feedTitle} style={{ border: 'none', marginBottom: '1rem' }}>People</h2>
                                    <div className={styles.userResultsGrid}>
                                        {searchResults.users.map(u => (
                                            <Link href={`/profile/${u._id}`} key={u._id} className={styles.userResultCard}>
                                                <Image
                                                    src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}
                                                    alt={u.name}
                                                    width={64}
                                                    height={64}
                                                    className={styles.userResultAvatar}
                                                    unoptimized
                                                />
                                                <span className={styles.userResultName}>{u.name}</span>
                                                <button className={styles.userResultFollowBtn}>View Profile</button>
                                            </Link>
                                        ))}
                                    </div>
                                    <h2 className={styles.feedTitle} style={{ border: 'none', marginBottom: '1rem' }}>Posts</h2>
                                </div>
                            )}

                            {displayPosts.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onLoginReq={handleLoginReq}
                                />
                            ))}
                        </>
                    )}

                    {!loading && displayPosts.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            {searchResults ? 'No matches found for your search.' : 'No posts yet.'}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className={styles.rightSidebar}>
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarSection}>
                            <h3 style={{ margin: '0 0.75rem 0.75rem', fontSize: '1rem', color: '#65676b', fontWeight: 600 }}>Contacts</h3>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={styles.sidebarItem}>
                                    <div className={styles.sidebarIcon} style={{ fontSize: '1rem' }}>👤</div>
                                    <span>MadJock User {i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
}
