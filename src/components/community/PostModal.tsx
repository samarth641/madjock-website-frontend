'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import styles from '../../app/community/Community.module.css';
import { Post, CommunityComment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { likePost, commentOnPost, votePoll } from '../../lib/api';

interface PostModalProps {
    post: Post;
    onClose: () => void;
    onUpdate: (updatedPost: Post) => void;
    onLoginReq: () => void;
}

export default function PostModal({ post: initialPost, onClose, onUpdate, onLoginReq }: PostModalProps) {
    const { user } = useAuth();
    const [post, setPost] = useState<Post>(initialPost);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const feelings = [
        { label: 'happy', emoji: '😊' },
        { label: 'excited', emoji: '🤩' },
        { label: 'blessed', emoji: '😇' },
        { label: 'loved', emoji: '🥰' },
        { label: 'sad', emoji: '😔' },
        { label: 'angry', emoji: '😡' },
        { label: 'thankful', emoji: '🙏' },
        { label: 'cool', emoji: '😎' },
    ];

    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    const votedOptionId = useMemo(() => {
        if (!user || !post.poll) return null;
        if (post.poll.userVotedOptionId) return post.poll.userVotedOptionId;

        const votedOption = post.poll.options.find(opt =>
            opt.votes && Array.isArray(opt.votes) && opt.votes.includes(user.id)
        );
        return votedOption ? (votedOption._id || votedOption.id) : null;
    }, [user, post.poll]);

    const handleLike = async () => {
        if (!user || !user.id) {
            onLoginReq();
            return;
        }

        const res = await likePost(post._id, user.id);
        if (res.success) {
            const updatedPost = {
                ...post,
                likes: res.likes,
                likedByMe: !post.likedByMe
            };
            setPost(updatedPost);
            onUpdate(updatedPost);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || commentLoading) return;

        if (!user || !user.id) {
            onLoginReq();
            return;
        }

        setCommentLoading(true);
        try {
            const comment = await commentOnPost(post._id, user.id, user.name || 'User', newComment);
            if (comment) {
                const updatedPost = {
                    ...post,
                    comments: [comment, ...(post.comments || [])]
                };
                setPost(updatedPost);
                onUpdate(updatedPost);
                setNewComment('');
            }
        } catch (error) {
            console.error('Comment error:', error);
        }
        setCommentLoading(false);
    };

    const handleVote = async (optionId: string) => {
        if (!user || !user.id) {
            onLoginReq();
            return;
        }
        if (!post._id || !post.poll || votedOptionId) return;

        try {
            const updatedPoll = await votePoll(post._id, optionId);
            if (updatedPoll) {
                const updatedPost = { ...post, poll: updatedPoll };
                setPost(updatedPost);
                onUpdate(updatedPost);
            }
        } catch (error) {
            console.error('Vote failed:', error);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.postDetailModal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeModalBtn} onClick={onClose}>✕</button>

                <div className={styles.modalContentGrid}>
                    {/* Left Side: Media */}
                    {(post.images?.length || post.video || post.gif) ? (
                        <div className={styles.modalMediaSection}>
                            {post.type === 'video' && post.video ? (
                                <video src={post.video} controls className={styles.modalFullMedia} />
                            ) : (
                                <img src={post.gif || post.images?.[0]} alt="" className={styles.modalFullMedia} />
                            )}
                        </div>
                    ) : null}

                    {/* Right Side: Info & Comments */}
                    <div className={styles.modalInfoSection}>
                        <div className={styles.modalHeaderFixed}>
                            <div className={styles.postHeader} style={{ padding: 0 }}>
                                <Image
                                    src={post.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`}
                                    alt={post.user?.name || 'User'}
                                    width={40}
                                    height={40}
                                    className={styles.userAvatar}
                                    unoptimized
                                />
                                <div className={styles.userInfo}>
                                    <div className={styles.userName} style={{ fontSize: '0.9rem' }}>
                                        {post.user?.name || 'Unknown User'}
                                        {post.feeling && (
                                            <span style={{ fontWeight: 400, color: '#65676b', fontSize: '0.8rem', marginLeft: '4px' }}>
                                                is feeling {feelings.find(f => f.label === post.feeling)?.emoji} {post.feeling}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.postTime} style={{ fontSize: '0.75rem' }}>
                                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalScrollBody}>
                            {post.content && <p className={styles.modalPostContent}>{post.content}</p>}

                            {post.type === 'poll' && post.poll && (
                                <div className={styles.pollContainer} style={{ margin: '12px 0' }}>
                                    <div style={{ marginBottom: '12px', fontWeight: 600, color: '#64748b', fontSize: '0.8rem' }}>
                                        {post.poll.question} • {post.poll.totalVotes || 0} votes
                                    </div>
                                    {post.poll.options.map((option, idx) => {
                                        const optId = option._id || option.id || `opt-${idx}`;
                                        const isVoted = votedOptionId === optId;
                                        const vCount = option.votes?.length || 0;
                                        const tVotes = Math.max((post.poll?.totalVotes || 0), (post.poll?.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0) || 0));
                                        const percentage = tVotes ? Math.round((vCount / tVotes) * 100) : 0;

                                        return (
                                            <div
                                                key={optId}
                                                onClick={() => !votedOptionId && handleVote(optId)}
                                                className={styles.pollOption}
                                                style={{
                                                    border: isVoted ? '1.5px solid #1877f2' : '1px solid #e2e8f0',
                                                    padding: '10px'
                                                }}
                                            >
                                                {votedOptionId && (
                                                    <div
                                                        className={styles.pollProgressBar}
                                                        style={{ width: `${percentage}%`, background: isVoted ? 'rgba(24, 119, 242, 0.1)' : 'rgba(0,0,0,0.05)' }}
                                                    />
                                                )}
                                                <div className={styles.pollOptionContent}>
                                                    <span style={{ fontWeight: isVoted ? 600 : 400, color: isVoted ? '#1877f2' : 'inherit' }}>{option.text}</span>
                                                    {votedOptionId && <span style={{ fontSize: '0.8rem' }}>{percentage}%</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className={styles.modalCommentsList}>
                                {post.comments?.map((comment) => (
                                    <div key={comment._id} className={styles.modalCommentItem}>
                                        <Image
                                            src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=random`}
                                            alt={comment.user?.name || 'User'}
                                            width={32}
                                            height={32}
                                            className={styles.userAvatar}
                                            style={{ width: '32px', height: '32px' }}
                                            unoptimized
                                        />
                                        <div className={styles.commentBubble}>
                                            <div className={styles.commentUser}>{comment.user?.name}</div>
                                            <div className={styles.commentContent}>{comment.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modalFooterFixed}>
                            <div className={styles.actionsBar} style={{ margin: '0 0 12px 0', padding: '8px 0', borderBottom: '1px solid #f1f3f6' }}>
                                <button className={`${styles.actionButton} ${post.likedByMe ? styles.liked : ''}`} onClick={handleLike}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                    </svg>
                                    <span>Like</span>
                                </button>
                                <div className={styles.actionButton}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                    <span>{post.comments?.length || 0}</span>
                                </div>
                            </div>

                            {user && (
                                <form onSubmit={handleCommentSubmit} className={styles.modalCommentForm}>
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className={styles.createPostTextarea}
                                        style={{ borderRadius: '20px', minHeight: '40px', padding: '8px 16px', background: '#f1f3f6', fontSize: '0.9rem' }}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        disabled={commentLoading}
                                    />
                                    <button type="submit" className={styles.iconBtn} disabled={!newComment.trim() || commentLoading}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={newComment.trim() ? "#1877f2" : "#bcc0c4"} strokeWidth="2">
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
