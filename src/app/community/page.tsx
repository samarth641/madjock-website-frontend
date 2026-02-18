'use client';

import React, { useEffect, useState } from 'react';
import styles from './Community.module.css';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/community/PostCard';
import CreatePostWidget from '@/components/community/CreatePostWidget';
import LoginModal from '@/components/LoginModal';
import CommunityHeader from '@/components/community/CommunityHeader';
import UsersModal from '@/components/community/UsersModal';
import Stories from '@/components/community/Stories';
import { getPosts, searchCommunity } from '@/lib/api';
import { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function CommunityContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<{ posts: Post[]; users: any[] } | null>(null);
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [usersModalTab, setUsersModalTab] = useState<'followers' | 'following'>('followers');
    const { user } = useAuth();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let lat, lng;
            if (navigator.geolocation) {
                try {
                    const position: any = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            maximumAge: 300000 // 5 minutes cache
                        });
                    });
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                } catch (err) {
                    console.warn('Feed location detection failed:', err);
                }
            }
            const data = await getPosts(lat, lng);
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };


    const performSearch = async (query: string) => {
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

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            performSearch(query);
        } else {
            setSearchResults(null);
            fetchPosts();
        }
    }, [searchParams]);

    const handleLoginReq = () => {
        setIsLoginModalOpen(true);
    };

    const displayPosts = searchResults ? searchResults.posts : posts;

    return (
        <div className={styles.container}>
            <div className={styles.mainLayout}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <CommunityHeader
                        onSearch={(query) => router.push(`/community?search=${encodeURIComponent(query)}`)}
                        onHomeClick={() => {
                            setSearchResults(null);
                            router.push('/community');
                        }}
                        onMembersClick={() => {
                            if (!user) {
                                handleLoginReq();
                                return;
                            }
                            setUsersModalTab('followers');
                            setIsUsersModalOpen(true);
                        }}
                    />
                </div>

                {/* Left Sidebar */}
                <div className={styles.leftSidebar}>
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarSection}>
                            <div
                                className={`${styles.sidebarItem} ${!searchResults ? styles.sidebarItemActive : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    console.log('Home Feed Sidebar Clicked');
                                    setSearchResults(null);
                                    router.push('/community');
                                }}
                            >
                                <div className={styles.sidebarIcon}>🏠</div>
                                <span>Feed</span>
                            </div>
                            <div
                                className={styles.sidebarItem}
                                onClick={() => {
                                    if (!user) {
                                        handleLoginReq();
                                        return;
                                    }
                                    setUsersModalTab('followers');
                                    setIsUsersModalOpen(true);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.sidebarIcon}>👥</div>
                                <span>Friends</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Feed */}
                <div className={styles.feed}>
                    {!searchResults && (
                        <>
                            <Stories onLoginReq={handleLoginReq} />
                            <CreatePostWidget
                                onPostCreated={fetchPosts}
                                onLoginReq={handleLoginReq}
                            />
                        </>
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
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            {user && (
                <UsersModal
                    isOpen={isUsersModalOpen}
                    onClose={() => setIsUsersModalOpen(false)}
                    userId={user.id || user._id || ''}
                    initialTab={usersModalTab}
                />
            )}
        </div>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading community...</div>}>
            <CommunityContent />
        </Suspense>
    );
}
