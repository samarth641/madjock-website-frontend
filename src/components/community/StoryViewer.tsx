'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from '@/app/community/Stories.module.css';
import { Story } from '@/types';

interface StoryViewerProps {
    stories: Story[];
    initialIndex: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const STORY_DURATION = 5000; // 5 seconds per story

    const currentStory = stories[currentIndex];

    const handleNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + (100 / (STORY_DURATION / 100));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [currentIndex, handleNext]);

    if (!currentStory) return null;

    return (
        <div className={styles.viewerOverlay} onClick={onClose}>
            <button className={styles.closeViewer} onClick={onClose}>✕</button>

            <div className={styles.viewerContainer} onClick={e => e.stopPropagation()}>
                {/* Header with Progress Bars */}
                <div className={styles.viewerHeader}>
                    <div className={styles.progressContainer}>
                        {stories.map((_, index) => (
                            <div key={index} className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: index === currentIndex ? `${progress}%` : (index < currentIndex ? '100%' : '0%'),
                                        transition: index === currentIndex ? 'width 0.1s linear' : 'none'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.viewerUser}>
                        <Image
                            src={currentStory.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStory.userName)}&background=random`}
                            alt={currentStory.userName}
                            width={40}
                            height={40}
                            className={styles.viewerAvatar}
                            unoptimized
                        />
                        <span className={styles.viewerUserName}>{currentStory.userName}</span>
                    </div>
                </div>

                {/* Media */}
                <div className={styles.viewerMediaWrapper}>
                    <div className={`${styles.viewerNav} ${styles.prevNav}`} onClick={handlePrev} />
                    <div className={`${styles.viewerNav} ${styles.nextNav}`} onClick={handleNext} />

                    {currentStory.media.type === 'video' ? (
                        <video
                            src={currentStory.media.url}
                            className={styles.viewerMedia}
                            autoPlay
                            muted
                            playsInline
                            onEnded={handleNext}
                        />
                    ) : (
                        <Image
                            src={currentStory.media.url}
                            alt="Story content"
                            fill
                            className={styles.viewerMedia}
                            unoptimized
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
