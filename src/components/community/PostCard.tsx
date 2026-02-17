'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/app/community/Community.module.css';
import { useAuth } from '@/context/AuthContext';
import { likePost, commentOnPost, votePoll } from '@/lib/api';
import { Post, CommunityComment, UserSnippet } from '@/types';

import Link from 'next/link';
import PostModal from './PostModal';

interface PostCardProps {
    post: Post;
    onUpdate?: (updatedPost: Post) => void;
    onLoginReq: () => void;
}

export default function PostCard({ post: initialPost, onUpdate: globalUpdate, onLoginReq }: PostCardProps) {
    const { user } = useAuth();
    const [post, setPost] = useState<Post>(initialPost);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [showTags, setShowTags] = useState(false);

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

    const handleLike = async () => {
        if (!user || !user.id) {
            onLoginReq();
            return;
        }

        if (!post._id) {
            console.error('❌ Cannot like post: missing post ID');
            return;
        }

        const res = await likePost(post._id, user.id);
        if (res.success) {
            setPost({
                ...post,
                likes: res.likes,
                likedByMe: !post.likedByMe
            });
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || commentLoading) return;

        if (!user || !user.id) {
            onLoginReq();
            return;
        }

        if (!post._id) {
            console.error('❌ Cannot comment: missing post ID');
            return;
        }

        setCommentLoading(true);
        try {
            const comment = await commentOnPost(post._id, user.id, user.name || 'User', newComment);
            if (comment) {
                setPost({
                    ...post,
                    comments: [comment, ...(post.comments || [])]
                });
                setNewComment('');
                setIsCommentsOpen(true);
            } else {
                alert('Failed to post comment. Please try again.');
            }
        } catch (error: any) {
            console.error('Comment submission error:', error);
            alert(`Error posting comment: ${error.message}`);
        }
        setCommentLoading(false);
    };

    // Calculate if user already voted in this poll
    const votedOptionId = React.useMemo(() => {
        if (!user || !post.poll) return null;
        if (post.poll.userVotedOptionId) return post.poll.userVotedOptionId;

        const votedOption = post.poll.options.find(opt =>
            opt.votes && Array.isArray(opt.votes) && opt.votes.includes(user.id)
        );
        return votedOption ? votedOption._id : null;
    }, [user, post.poll]);

    const handleVote = async (optionId: string) => {
        if (!user || !user.id) {
            onLoginReq();
            return;
        }
        if (!post._id || !post.poll || votedOptionId) return;

        // Optimistic update
        const updatedOptions = post.poll.options.map(opt => {
            if (opt._id === optionId) {
                return { ...opt, votes: [...(opt.votes || []), user.id] };
            }
            return opt;
        });

        const newTotalVotes = (post.poll.totalVotes || 0) + 1;

        setPost({
            ...post,
            poll: {
                ...post.poll,
                options: updatedOptions,
                totalVotes: newTotalVotes,
                userVotedOptionId: optionId
            }
        });

        // API Call
        try {
            const updatedPoll = await votePoll(post._id, optionId);
            if (updatedPoll) {
                setPost(prev => ({ ...prev, poll: updatedPoll }));
            }
        } catch (error: any) {
            console.error('Vote failed:', error);
            alert(error.response?.data?.message || 'Failed to record vote');
            // Revert on failure (simple reload or state reset would be better but let's keep it simple)
        }
    };

    const handleUpdate = (updatedPost: Post) => {
        setPost(updatedPost);
        if (globalUpdate) globalUpdate(updatedPost);
    };

    const handleCommentToggle = () => {
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
            setShowModal(true);
        } else {
            setIsCommentsOpen(!isCommentsOpen);
        }
    };

    const visibleComments = isCommentsOpen ? (post.comments || []) : (post.comments || []).slice(0, 2);
    const hasMoreComments = (post.comments || []).length > 2;

    return (
        <div className={styles.postCard}>
            <div className={styles.postHeader}>
                <Link href={`/profile/${post.user?._id}`} className={styles.avatarLink}>
                    <Image
                        src={post.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`}
                        alt={post.user?.name || 'User'}
                        width={44}
                        height={44}
                        className={styles.userAvatar}
                        unoptimized
                    />
                </Link>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>
                        <Link href={`/profile/${post.user?._id}`} className={styles.nameLink}>
                            {post.user?.name || 'Unknown User'}
                        </Link>
                        {post.feeling && (
                            <span style={{ fontWeight: 400, color: '#65676b', fontSize: '0.875rem', marginLeft: '4px' }}>
                                is feeling {feelings.find(f => f.label === post.feeling)?.emoji} {post.feeling}
                            </span>
                        )}
                        {post.location?.name && (
                            <span style={{ fontWeight: 400, color: '#65676b', fontSize: '0.875rem', marginLeft: '4px' }}>
                                at <span style={{ fontWeight: 600 }}>{post.location.name}</span>
                            </span>
                        )}
                        {post.taggedUsers && post.taggedUsers.length > 0 && (
                            <span style={{ fontWeight: 400, color: '#65676b', fontSize: '0.875rem', marginLeft: '4px' }}>
                                — with <span style={{ fontWeight: 600 }}>
                                    {post.taggedUsers[0].userName}
                                    {post.taggedUsers.length > 1 && ` and ${post.taggedUsers.length - 1} other${post.taggedUsers.length > 2 ? 's' : ''}`}
                                </span>
                            </span>
                        )}
                    </div>
                    <div className={styles.postTime}>
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {post.content && <p className={styles.postContent}>{post.content}</p>}

            {post.type === 'image' && ((post.images && post.images.length > 0) || post.gif) && (
                <div className={styles.postMedia}>
                    <img
                        src={post.gif || post.images?.[0]}
                        alt=""
                        className={styles.postImage}
                        loading="lazy"
                    />
                    {post.gif && (
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>
                            via GIPHY
                        </div>
                    )}
                    {post.taggedUsers && post.taggedUsers.length > 0 && (
                        <>
                            <div
                                className={styles.tagIconOverlay}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTags(!showTags);
                                }}
                                title="View tagged users"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M20 17H4V5h16v12zm0-14H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM7 15c0-1.66 1.34-3 3-3s3 1.34 3 3H7zm10-3c0-1.1-.9-2-2-2h-3v4h3c1.1 0 2-.9 2-2z" />
                                </svg>
                            </div>
                            {showTags && (
                                <div className={styles.tagsListPopup} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.tagHeader}>Tagged People</div>
                                    {post.taggedUsers.map((tagUser) => (
                                        <Link
                                            key={tagUser.userId}
                                            href={`/profile/${tagUser.userId}`}
                                            className={styles.tagItem}
                                        >
                                            <div className={styles.tagItemAvatar} />
                                            <span>{tagUser.userName}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {post.type === 'video' && post.video && (
                <div className={styles.postMedia}>
                    <video
                        src={post.video}
                        className={styles.postImage}
                        controls
                        style={{ background: '#000' }}
                    />
                    {post.taggedUsers && post.taggedUsers.length > 0 && (
                        <>
                            <div
                                className={styles.tagIconOverlay}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTags(!showTags);
                                }}
                                title="View tagged users"
                                style={{ bottom: '40px' }} // Position above video controls
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M20 17H4V5h16v12zm0-14H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM7 15c0-1.66 1.34-3 3-3s3 1.34 3 3H7zm10-3c0-1.1-.9-2-2-2h-3v4h3c1.1 0 2-.9 2-2z" />
                                </svg>
                            </div>
                            {showTags && (
                                <div className={styles.tagsListPopup} style={{ bottom: '78px' }} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.tagHeader}>Tagged People</div>
                                    {post.taggedUsers.map((tagUser) => (
                                        <Link
                                            key={tagUser.userId}
                                            href={`/profile/${tagUser.userId}`}
                                            className={styles.tagItem}
                                        >
                                            <div className={styles.tagItemAvatar} />
                                            <span>{tagUser.userName}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {post.type === 'poll' && post.poll && (
                <div className={styles.pollContainer} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', marginTop: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '12px', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                        <span>{post.poll.question || 'Poll'}</span>
                        <span>{post.poll.totalVotes || 0} votes • {votedOptionId ? 'Voted' : 'Poll'}</span>
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
                                style={{
                                    position: 'relative',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    border: isVoted ? '1.5px solid #1877f2' : '1px solid #e2e8f0',
                                    cursor: votedOptionId ? 'default' : 'pointer',
                                    background: '#fff',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isVoted ? '0 2px 4px rgba(24, 119, 242, 0.1)' : 'none'
                                }}
                            >
                                {votedOptionId && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        width: `${percentage}%`,
                                        background: isVoted ? 'rgba(24, 119, 242, 0.15)' : 'rgba(0, 0,0, 0.05)',
                                        borderRight: percentage > 0 ? (isVoted ? '2px solid #1877f2' : '1px solid #cbd5e1') : 'none',
                                        zIndex: 0,
                                        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} />
                                )}
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontWeight: isVoted ? 700 : 500,
                                            color: isVoted ? '#1877f2' : '#334155',
                                            fontSize: '0.95rem'
                                        }}>
                                            {option.text}
                                        </span>
                                        {isVoted && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        )}
                                    </div>
                                    {votedOptionId && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ fontWeight: 700, color: isVoted ? '#1877f2' : '#64748b', fontSize: '0.9rem' }}>
                                                {percentage}%
                                            </span>
                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                                {vCount} {vCount === 1 ? 'vote' : 'votes'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className={styles.counts}>
                <div className={styles.countStats}>
                    <div style={{ background: '#1877f2', borderRadius: '50%', padding: '4px', display: 'flex', border: '1.5px solid white' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.75 0 1.41-.41 1.75-1.03l3.58-8.35c.09-.23.14-.48.14-.73v-2z" />
                        </svg>
                    </div>
                    <span>{post.likes?.length || 0}</span>
                </div>
                {post.comments && post.comments.length > 0 && (
                    <div className={styles.countStats}>
                        <span onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
                            {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.actionsBar}>
                <button
                    className={`${styles.actionButton} ${post.likedByMe ? styles.liked : ''}`}
                    onClick={handleLike}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span>Like</span>
                </button>
                <button
                    className={styles.actionButton}
                    onClick={() => {
                        if (!user) onLoginReq();
                        else handleCommentToggle();
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    <span>Comment</span>
                </button>
                <button className={styles.actionButton}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span>Share</span>
                </button>
            </div>

            {(isCommentsOpen || (post.comments?.length || 0) > 0) && (
                <div className={styles.commentSection}>
                    {hasMoreComments && !isCommentsOpen && (
                        <button
                            style={{ background: 'none', border: 'none', color: '#65676b', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0', cursor: 'pointer' }}
                            onClick={() => setIsCommentsOpen(true)}
                        >
                            View previous comments
                        </button>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {visibleComments?.map((comment: CommunityComment) => (
                            <div key={comment._id} style={{ display: 'flex', gap: '0.75rem' }}>
                                <Link href={`/profile/${comment.user?._id}`} className={styles.avatarLink}>
                                    <Image
                                        src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=random`}
                                        alt={comment.user?.name || 'User'}
                                        width={32}
                                        height={32}
                                        className={styles.userAvatar}
                                        style={{ width: '32px', height: '32px', border: 'none' }}
                                        unoptimized
                                    />
                                </Link>
                                <div className={styles.commentBubble}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                        <div className={styles.commentUser}>
                                            <Link href={`/profile/${comment.user?._id}`} className={styles.nameLink}>
                                                {comment.user?.name || 'Unknown User'}
                                            </Link>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#8e8e8e' }}>
                                            {comment.createdAt === 'Just now' ? 'Just now' : (comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now')}
                                        </span>
                                    </div>
                                    <div className={styles.commentContent}>{comment.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {user && (
                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <Image
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                                alt="User"
                                width={32}
                                height={32}
                                className={styles.userAvatar}
                                style={{ width: '32px', height: '32px', border: 'none' }}
                                unoptimized
                            />
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    className={styles.createPostTextarea}
                                    style={{
                                        borderRadius: '20px',
                                        minHeight: '40px',
                                        padding: '0.5rem 2.5rem 0.5rem 1rem',
                                        fontSize: '0.875rem',
                                        background: '#f1f3f6'
                                    }}
                                    placeholder={`Write a comment as ${user.name?.split(' ')[0]}...`}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={commentLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || commentLoading}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: newComment.trim() ? '#1877f2' : '#bcc0c4',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        padding: '4px'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
            {showModal && (
                <PostModal
                    post={post}
                    onClose={() => setShowModal(false)}
                    onUpdate={handleUpdate}
                    onLoginReq={onLoginReq}
                />
            )}
        </div>
    );
}
