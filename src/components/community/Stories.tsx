'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from '@/app/community/Stories.module.css';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getStories, createStory, uploadCommunityMedia } from '@/lib/api';
import { Story } from '@/types';
import StoryViewer from './StoryViewer';

interface StoriesProps {
    onLoginReq?: () => void;
}

export default function Stories({ onLoginReq }: StoriesProps) {
    const { user } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedUserStories, setSelectedUserStories] = useState<Story[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchStories = async () => {
        try {
            const data = await getStories();
            setStories(data);
        } catch (error) {
            console.error('Failed to fetch stories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group stories by userId
    const groupedStories = stories.reduce((acc: Record<string, Story[]>, story) => {
        const userId = story.userId;
        if (!acc[userId]) {
            acc[userId] = [];
        }
        acc[userId].push(story);
        return acc;
    }, {});

    const storyUsers = Object.keys(groupedStories);

    useEffect(() => {
        fetchStories();
    }, []);

    const handleAddStorySource = () => {
        if (!user) {
            if (onLoginReq) onLoginReq();
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            setCreating(true);
            try {
                // 1. Upload media
                const url = await uploadCommunityMedia(file);
                if (!url) throw new Error('Upload failed');

                // 2. Create story record
                const isVideo = file.type.startsWith('video/');
                await createStory({
                    userId: user.id || user._id,
                    userName: user.name || 'User',
                    userAvatar: user.avatar || '',
                    media: {
                        url,
                        type: isVideo ? 'video' : 'image'
                    }
                });

                // 3. Refresh
                await fetchStories();
            } catch (error) {
                console.error('Failed to create story:', error);
                alert('Failed to create story. Please try again.');
            } finally {
                setCreating(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={styles.storiesContainer}>
            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                onChange={handleFileSelect}
            />

            {/* Add Story Card */}
            <div
                className={`${styles.storyCard} ${styles.addStoryCard}`}
                onClick={creating ? undefined : handleAddStorySource}
            >
                <div className={styles.addStoryTop}>
                    <Image
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                        alt="Your Story"
                        fill
                        className={styles.storyMedia}
                        unoptimized
                    />
                </div>
                <div className={styles.addStoryBottom}>
                    <div className={styles.plusButton}>
                        {creating ? '...' : '+'}
                    </div>
                    <span className={styles.addStoryText}>
                        {creating ? 'Creating...' : 'Create story'}
                    </span>
                </div>
            </div>

            {/* User Stories */}
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.storyCard} style={{ opacity: 0.5 }}>
                        <div className={styles.storyMediaWrapper} style={{ background: '#eee' }} />
                    </div>
                ))
            ) : (
                storyUsers.map((userId) => {
                    const userStories = groupedStories[userId];
                    const latestStory = userStories[userStories.length - 1];

                    return (
                        <div
                            key={userId}
                            className={styles.storyCard}
                            onClick={() => setSelectedUserStories(userStories)}
                        >
                            <div className={styles.storyMediaWrapper}>
                                {latestStory.media.type === 'video' ? (
                                    <video
                                        src={`${latestStory.media.url}#t=0.1`}
                                        className={styles.storyMedia}
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <Image
                                        src={latestStory.media.url}
                                        alt={latestStory.userName}
                                        fill
                                        className={styles.storyMedia}
                                        unoptimized
                                    />
                                )}
                                <div className={styles.storyOverlay} />
                            </div>
                            <div className={styles.userAvatarWrapper}>
                                <Image
                                    src={latestStory.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(latestStory.userName)}&background=random`}
                                    alt={latestStory.userName}
                                    width={38}
                                    height={38}
                                    className={styles.userAvatar}
                                    unoptimized
                                />
                            </div>
                            <span className={styles.userName}>{latestStory.userName}</span>
                        </div>
                    );
                })
            )}

            {/* Viewer Modal */}
            {selectedUserStories && (
                <StoryViewer
                    stories={selectedUserStories}
                    initialIndex={0}
                    onClose={() => setSelectedUserStories(null)}
                />
            )}
        </div>
    );
}
