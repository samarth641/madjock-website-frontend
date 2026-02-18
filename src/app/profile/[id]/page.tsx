'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../Profile.module.css';
import communityStyles from '../../community/Community.module.css';
import PostCard from '@/components/community/PostCard';
import PostModal from '@/components/community/PostModal';
import LoginModal from '@/components/LoginModal';
import { getUserProfile, getPostsByUserId, followUser, unfollowUser, getUserBusinesses } from '@/lib/api';
import { Post, UserProfile, Business } from '@/types';
import { useAuth } from '@/context/AuthContext';
import EditProfileModal from '@/components/community/EditProfileModal';
import CommunityHeader from '@/components/community/CommunityHeader';
import UsersModal from '@/components/community/UsersModal';

type TabType = 'posts' | 'videos' | 'threads' | 'polls' | 'businesses';

export default function ProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [videos, setVideos] = useState<Post[]>([]);
    const [threads, setThreads] = useState<Post[]>([]);
    const [polls, setPolls] = useState<Post[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [profileData, postsData, businessData] = await Promise.all([
                    getUserProfile(id as string, currentUser?.id),
                    getPostsByUserId(id as string),
                    getUserBusinesses(id as string)
                ]);

                if (profileData) {
                    setProfile(profileData);
                }

                // Filter posts into specialized arrays
                const videoList = postsData.filter((p: Post) => p.type === 'video' || p.video);
                const pollList = postsData.filter((p: Post) => p.type === 'poll' || p.poll);
                const threadList = postsData.filter((p: Post) =>
                    p.type === 'text' && (!p.images || p.images.length === 0) && !p.video && !p.poll
                );
                const imagePosts = postsData.filter((p: Post) =>
                    (p.type === 'image' || (p.images && p.images.length > 0) || p.gif) &&
                    p.type !== 'poll' && !p.poll &&
                    !(p.type === 'text' && (!p.images || p.images.length === 0) && !p.video)
                );

                setPosts(imagePosts);
                setVideos(videoList);
                setThreads(threadList);
                setPolls(pollList);
                setBusinesses(businessData);
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
        // Priority 1: Video
        if (post.type === 'video' || post.video) {
            const videoUrl = post.video || '';
            // Using #t=0.5 helps avoid black frames by starting slightly into the video
            const thumbUrl = videoUrl ? `${videoUrl}#t=0.5` : '';

            return (
                <>
                    {videoUrl ? (
                        <video
                            src={thumbUrl}
                            className={styles.thumbnailImage}
                            preload="metadata"
                            muted
                            playsInline
                        />
                    ) : (
                        <div className={styles.textThumbnail}>Video Unavailable</div>
                    )}
                    <div className={styles.reelIndicator}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                </>
            );
        }

        // Priority 2: GIF
        if (post.gif) {
            return (
                <Image
                    src={post.gif}
                    alt="GIF thumbnail"
                    fill
                    className={styles.thumbnailImage}
                    unoptimized
                />
            );
        }

        // Priority 3: Image
        const imageUrl = post.images?.[0] || null;
        if (imageUrl) {
            return (
                <Image
                    src={imageUrl}
                    alt="Post thumbnail"
                    fill
                    className={styles.thumbnailImage}
                    unoptimized
                />
            );
        }

        // Priority 4: Text fallback
        return (
            <div className={styles.textThumbnail}>
                {post.content ? (
                    post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content
                ) : (
                    post.poll?.question || 'Shared Content'
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
    const allPostsCount = posts.length + videos.length + threads.length + polls.length;

    return (
        <div className={styles.profileContainer}>
            <div style={{ marginBottom: '20px' }}>
                <CommunityHeader
                    onSearch={(query) => router.push(`/community?search=${encodeURIComponent(query)}`)}
                    onHomeClick={() => router.push('/community')}
                    onMembersClick={() => setActiveTab('posts')} // Default behavior or ignore
                />
            </div>
            <header className={styles.profileHeader}>
                <div className={styles.avatarSection}>
                    <Image
                        src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                        alt={profile.name}
                        width={150}
                        height={150}
                        className={styles.profileAvatar}
                        unoptimized
                    />
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.nameRow}>
                        <h1 className={styles.profileName}>{profile.name}</h1>
                        {isOwnProfile ? (
                            <button
                                className={styles.editProfileBtn}
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                className={`${styles.followBtn} ${profile.isFollowing ? styles.followingBtn : ''}`}
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                            >
                                {followLoading ? '...' : (profile.isFollowing ? 'Following' : 'Follow')}
                            </button>
                        )}
                    </div>

                    <ul className={styles.statsRow}>
                        <li className={styles.statItem}>
                            <span className={styles.statCount}>{allPostsCount}</span> posts
                        </li>
                        <li className={styles.statItem}>
                            <span className={styles.statCount}>{profile.followersCount}</span> followers
                        </li>
                        <li className={styles.statItem}>
                            <span className={styles.statCount}>{profile.followingCount}</span> following
                        </li>
                    </ul>

                    <div className={styles.bioSection}>
                        <span className={styles.fullName}>{profile.name}</span>
                        <p className={styles.bioText}>
                            {profile.bio || `Welcome to ${profile.name}'s profile! Madjock community member since ${profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'recently'}.`}
                        </p>
                        {profile.location && (
                            <div className={styles.locationText}>
                                📍 {profile.location}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className={styles.profileFeed}>
                <nav className={styles.tabsWrapper}>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'posts' ? styles.tabItemActive : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="3" y1="15" x2="21" y2="15"></line>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                            <line x1="15" y1="3" x2="15" y2="21"></line>
                        </svg>
                        POSTS
                    </div>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'videos' ? styles.tabItemActive : ''}`}
                        onClick={() => setActiveTab('videos')}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M10 9l5 3-5 3V9z"></path>
                            <path d="M2 12h20"></path>
                        </svg>
                        VIDEOS
                    </div>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'threads' ? styles.tabItemActive : ''}`}
                        onClick={() => setActiveTab('threads')}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        THREADS
                    </div>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'polls' ? styles.tabItemActive : ''}`}
                        onClick={() => setActiveTab('polls')}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3v18h18"></path>
                            <path d="M18 9l-5 5-2-2-4 4"></path>
                        </svg>
                        POLLS
                    </div>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'businesses' ? styles.tabItemActive : ''}`}
                        onClick={() => setActiveTab('businesses')}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        BUSINESSES
                    </div>
                </nav>

                {activeTab === 'posts' && (
                    posts.length > 0 ? (
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
                                            <span>❤️ {post.likes?.length || 0}</span>
                                            <span>💬 {post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            {profile.name} hasn't shared any posts with media yet.
                        </div>
                    )
                )}

                {activeTab === 'videos' && (
                    videos.length > 0 ? (
                        <div className={styles.postGrid}>
                            {videos.map(video => (
                                <div
                                    key={video._id}
                                    className={styles.gridItem}
                                    onClick={() => handlePostClick(video)}
                                >
                                    {renderThumbnail(video)}
                                    <div className={styles.gridOverlay}>
                                        <div className={styles.overlayStats}>
                                            <span>❤️ {video.likes?.length || 0}</span>
                                            <span>💬 {video.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            {profile.name} hasn't shared any videos yet.
                        </div>
                    )
                )}

                {activeTab === 'threads' && (
                    threads.length > 0 ? (
                        <div className={styles.listFeed}>
                            {threads.map(thread => (
                                <div
                                    key={thread._id}
                                    className={styles.listItem}
                                    onClick={() => handlePostClick(thread)}
                                >
                                    <p className={styles.listContent}>{thread.content}</p>
                                    <div className={styles.listStats}>
                                        <span>❤️ {thread.likes?.length || 0} likes</span>
                                        <span>💬 {thread.comments?.length || 0} comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            {profile.name} hasn't shared any threads (text posts) yet.
                        </div>
                    )
                )}

                {activeTab === 'polls' && (
                    polls.length > 0 ? (
                        <div className={styles.listFeed}>
                            {polls.map(poll => (
                                <div
                                    key={poll._id}
                                    className={styles.listItem}
                                    onClick={() => handlePostClick(poll)}
                                >
                                    <h3 className={styles.listContent} style={{ fontWeight: 600 }}>{poll.poll?.question}</h3>
                                    <p className={styles.listContent} style={{ fontSize: '14px', color: '#65676b' }}>
                                        Interactive Poll • {poll.poll?.options.length} options
                                    </p>
                                    <div className={styles.listStats}>
                                        <span>📊 {poll.poll?.totalVotes || 0} votes</span>
                                        <span>💬 {poll.comments?.length || 0} comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            {profile.name} hasn't shared any polls yet.
                        </div>
                    )
                )}

                {activeTab === 'businesses' && (
                    businesses.length > 0 ? (
                        <div className={styles.businessGrid}>
                            {businesses.map(biz => (
                                <Link
                                    href={`/businesses/${biz._id}`}
                                    key={biz._id}
                                    className={styles.businessCard}
                                >
                                    <div className={styles.businessCardHeader}>
                                        <Image
                                            src={biz.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(biz.businessName)}&background=random`}
                                            alt={biz.businessName}
                                            width={50}
                                            height={50}
                                            className={styles.businessLogo}
                                            unoptimized
                                        />
                                        <div className={styles.businessInfo}>
                                            <h3 className={styles.businessName}>{biz.businessName}</h3>
                                            <span className={styles.businessCategory}>{biz.businessCategory}</span>
                                        </div>
                                    </div>
                                    <p className={styles.businessDesc}>
                                        {biz.description || 'Verified local business in our community.'}
                                    </p>
                                    <div className={styles.businessFooter}>
                                        <span>📍 {biz.city || 'Local'}</span>
                                        <span className={styles.viewBtn}>View Detail</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            {profile.name} hasn't listed any businesses yet.
                        </div>
                    )
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
                        setVideos(prev => prev.map(p => p._id === updated._id ? updated : p));
                        setThreads(prev => prev.map(p => p._id === updated._id ? updated : p));
                        setPolls(prev => prev.map(p => p._id === updated._id ? updated : p));
                        setSelectedPost(updated);
                    }}
                    onLoginReq={() => setIsLoginModalOpen(true)}
                />
            )}

            {isEditModalOpen && profile && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    profile={profile}
                    onUpdate={(updated) => setProfile(updated)}
                />
            )}
        </div>
    );
}
