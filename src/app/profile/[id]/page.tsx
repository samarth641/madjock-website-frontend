'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../Profile.module.css';
import communityStyles from '../../community/Community.module.css';
import PostCard from '@/components/community/PostCard';
import PostModal from '@/components/community/PostModal';
import LoginModal from '@/components/LoginModal';
import { getUserProfile, getPostsByUserId, followUser, unfollowUser } from '@/lib/api';
import { Post, UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [profileData, postsData] = await Promise.all([
                    getUserProfile(id as string, currentUser?.id),
                    getPostsByUserId(id as string)
                ]);

                if (profileData) {
                    setProfile(profileData);
                } else {
                    console.error('Profile not found');
                }
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser?.id]);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        if (!profile || followLoading) return;

        setFollowLoading(true);
        try {
            const success = profile.isFollowing
                ? await unfollowUser(profile._id, currentUser.id)
                : await followUser(profile._id, currentUser.id);

            if (success) {
                setProfile({
                    ...profile,
                    isFollowing: !profile.isFollowing,
                    followersCount: profile.isFollowing
                        ? profile.followersCount - 1
                        : profile.followersCount + 1
                });
            }
        } catch (error) {
            console.error('Follow toggle failed:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handlePostClick = (post: Post) => {
        setSelectedPost(post);
        setIsPostModalOpen(true);
    };

    const renderThumbnail = (post: Post) => {
        if (post.type === 'video' || post.video) {
            return (
                <>
                    <Image
                        src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop`}
                        alt="Video thumbnail"
                        fill
                        className={styles.thumbnailImage}
                        unoptimized
                    />
                    <div className={styles.mediaIcon}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </>
            );
        }

        const imageUrl = post.images?.[0] || null;

        if (imageUrl) {
            return (
                <>
                    <Image
                        src={imageUrl}
                        alt="Post thumbnail"
                        fill
                        className={styles.thumbnailImage}
                        unoptimized
                    />
                    {(post.images?.length || 0) > 1 && (
                        <div className={styles.mediaIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-11-2h9v-2H8v2zm0-4h9v-2H8v2zm0-4h9V7H8v2z" />
                            </svg>
                        </div>
                    )}
                </>
            );
        }

        return (
            <div className={styles.textThumbnail}>
                {post.content ? (
                    post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content
                ) : (
                    'Shared Content'
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={styles.profileContainer}>
                <div className="text-center py-20 text-gray-500">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={styles.profileContainer}>
                <div className="text-center py-20 text-gray-500">
                    <h2 className="text-2xl font-bold mb-4">User not found</h2>
                    <button
                        onClick={() => router.push('/community')}
                        className={styles.followBtn}
                    >
                        Back to Community
                    </button>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile._id;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div className={styles.avatarSection}>
                    <Image
                        src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                        alt={profile.name}
                        width={140}
                        height={140}
                        className={styles.profileAvatar}
                        unoptimized
                    />
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.nameRow}>
                        <h1 className={styles.profileName}>{profile.name}</h1>
                        {!isOwnProfile && (
                            <button
                                className={`${styles.followBtn} ${profile.isFollowing ? styles.followingBtn : ''}`}
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                            >
                                {followLoading ? '...' : (profile.isFollowing ? 'Following' : 'Follow')}
                            </button>
                        )}
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <span className={styles.statCount}>{posts.length}</span>
                            <span className={styles.statLabel}>posts</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statCount}>{profile.followersCount}</span>
                            <span className={styles.statLabel}>followers</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statCount}>{profile.followingCount}</span>
                            <span className={styles.statLabel}>following</span>
                        </div>
                    </div>

                    <div className={styles.bioSection}>
                        {profile.bio || `Welcome to ${profile.name}'s profile! Madjock community member since ${profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'recently'}.`}
                    </div>
                    {profile.location && (
                        <div style={{ marginTop: '0.5rem', color: '#65676b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📍 {profile.location}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.profileFeed}>
                <div className={styles.feedTitle}>
                    <div className={styles.feedTitleItem}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        POSTS
                    </div>
                </div>

                {posts.length > 0 ? (
                    <div className={styles.postGrid}>
                        {posts.map(post => (
                            <div
                                key={post._id}
                                className={styles.gridItem}
                                onClick={() => handlePostClick(post)}
                            >
                                {renderThumbnail(post)}
                                <div className={styles.gridOverlay}>
                                    <div className={styles.overlayStats}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            ❤️ {post.likes?.length || 0}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            💬 {post.comments?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        {profile.name} hasn't shared anything yet.
                    </div>
                )}
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            {isPostModalOpen && selectedPost && (
                <PostModal
                    post={selectedPost}
                    onClose={() => setIsPostModalOpen(false)}
                    onUpdate={(updated) => {
                        setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
                        setSelectedPost(updated);
                    }}
                    onLoginReq={() => setIsLoginModalOpen(true)}
                />
            )}
        </div>
    );
}
