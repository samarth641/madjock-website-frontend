'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from '@/app/community/Stories.module.css';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getStories, createStory, uploadCommunityMedia } from '@/lib/api';
import { Story } from '@/types';
import StoryViewer from './StoryViewer';

export default function Stories() {
    const { user } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
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

    useEffect(() => {
        fetchStories();
    }, []);

    const handleAddStorySource = () => {
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
                stories.map((story, index) => (
                    <div
                        key={story._id || index}
                        className={styles.storyCard}
                        onClick={() => setSelectedStoryIndex(index)}
                    >
                        <div className={styles.storyMediaWrapper}>
                            {story.media.type === 'video' ? (
                                <video
                                    src={`${story.media.url}#t=0.1`}
                                    className={styles.storyMedia}
                                    muted
                                    playsInline
                                />
                            ) : (
                                <Image
                                    src={story.media.url}
                                    alt={story.userName}
                                    fill
                                    className={styles.storyMedia}
                                    unoptimized
                                />
                            )}
                            <div className={styles.storyOverlay} />
                        </div>
                        <div className={styles.userAvatarWrapper}>
                            <Image
                                src={story.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.userName)}&background=random`}
                                alt={story.userName}
                                width={38}
                                height={38}
                                className={styles.userAvatar}
                                unoptimized
                            />
                        </div>
                        <span className={styles.userName}>{story.userName}</span>
                    </div>
                ))
            )}

            {/* Viewer Modal */}
            {selectedStoryIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialIndex={selectedStoryIndex}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </div>
    );
}
