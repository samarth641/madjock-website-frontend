'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from '@/app/community/Community.module.css';
import { useAuth } from '@/context/AuthContext';
import { createPost, uploadCommunityMedia, CreatePostData, getUsers } from '@/lib/api';
import { UserSnippet } from '@/types';

interface CreatePostWidgetProps {
    onPostCreated: () => void;
    onLoginReq: () => void;
}

export default function CreatePostWidget({ onPostCreated, onLoginReq }: CreatePostWidgetProps) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' | 'gif' } | null>(null);
    const [feeling, setFeeling] = useState('');
    const [locationName, setLocationName] = useState('');
    const [taggedUsers, setTaggedUsers] = useState<UserSnippet[]>([]);
    const [gifUrl, setGifUrl] = useState('');

    const [showFeelingSelector, setShowFeelingSelector] = useState(false);
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [showUserTagger, setShowUserTagger] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showPollCreator, setShowPollCreator] = useState(false);

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState<UserSnippet[]>([]);
    const [gifSearchQuery, setGifSearchQuery] = useState('');
    const [gifResults, setGifResults] = useState<string[]>([]);

    // Poll State
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [gifLoading, setGifLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const fetchUsers = async () => {
        const users = await getUsers();
        setAllUsers(users);
    };

    const fetchTrendingGifs = async () => {
        setGifLoading(true);
        try {
            // Use local proxy to avoid CORS
            const res = await fetch(`/api/giphy?endpoint=trending&limit=12`);

            if (!res.ok) throw new Error(`Giphy Proxy Error: ${res.status}`);

            const data = await res.json();
            // Giphy API returns data.data array
            const urls = data.data.map((g: any) => g.images.fixed_height.url);
            setGifResults(urls);
        } catch (err) {
            console.error('Trending GIF fetch error', err);
            setGifResults([]);
        } finally {
            setGifLoading(false);
        }
    };

    React.useEffect(() => {
        if (showGifPicker && !gifSearchQuery) {
            fetchTrendingGifs();
        }
    }, [showGifPicker, gifSearchQuery]);

    const searchGifs = async () => {
        if (!gifSearchQuery.trim()) {
            fetchTrendingGifs();
            return;
        }
        setGifLoading(true);
        try {
            // Use local proxy to avoid CORS
            const res = await fetch(`/api/giphy?endpoint=search&q=${encodeURIComponent(gifSearchQuery)}&limit=12`);

            if (!res.ok) throw new Error(`Giphy Proxy Error: ${res.status}`);

            const data = await res.json();
            const urls = data.data.map((g: any) => g.images.fixed_height.url);
            setGifResults(urls);
        } catch (err) {
            console.error('GIF search error', err);
            setGifResults([]);
        } finally {
            setGifLoading(false);
        }
    };

    const handleGifSelect = (url: string) => {
        setGifUrl(url);
        setMediaPreview({ url, type: 'gif' });
        setShowGifPicker(false);
        setSelectedFile(null); // Clear file if GIF is selected
    };

    const toggleUserTag = (u: UserSnippet) => {
        if (taggedUsers.find(tu => tu._id === u._id)) {
            setTaggedUsers(taggedUsers.filter(tu => tu._id !== u._id));
        } else {
            setTaggedUsers([...taggedUsers, u]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setGifUrl(''); // Clear GIF if file is selected
            const isVideo = file.type.startsWith('video/');
            setMediaPreview({
                url: URL.createObjectURL(file),
                type: isVideo ? 'video' : 'image'
            });
        }
    };

    const handleOpenModal = () => {
        if (!user) {
            onLoginReq();
            return;
        }
        setIsModalOpen(true);
        fetchUsers();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFeeling('');
        setLocationName('');
        setTaggedUsers([]);
        setGifUrl('');
        setMediaPreview(null);
        setSelectedFile(null);
        setShowFeelingSelector(false);
        setShowLocationInput(false);
        setShowUserTagger(false);
        setShowUserTagger(false);
        setShowGifPicker(false);
        setShowPollCreator(false);
        setPollOptions(['', '']);
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        if (!user || !user.id) {
            onLoginReq();
            return;
        }

        if (!content.trim() && !selectedFile && !showPollCreator) return;

        setLoading(true);
        try {
            let mediaData = {};
            let postType: 'text' | 'image' | 'video' | 'poll' = 'text';

            if (selectedFile) {
                const uploadedUrl = await uploadCommunityMedia(selectedFile);
                if (uploadedUrl) {
                    const isVideo = selectedFile.type.startsWith('video/');
                    mediaData = isVideo ? { video: uploadedUrl } : { image: uploadedUrl };
                    postType = isVideo ? 'video' : 'image';
                } else {
                    alert('Failed to upload media. Please try again.');
                    setLoading(false);
                    return;
                }
            } else if (gifUrl) {
                mediaData = { gif: gifUrl };
                postType = 'image';
                mediaData = { gif: gifUrl };
                postType = 'image';
            } else if (showPollCreator && pollOptions.filter(o => o.trim()).length >= 2) {
                postType = 'poll';
            } else if (content.trim()) {
                postType = 'text';
            }

            const validPollOptions = pollOptions.filter(o => o.trim());

            // Get automatic geolocation coordinates
            let autoLocationData = undefined;
            if (navigator.geolocation) {
                try {
                    const position: any = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            maximumAge: 60000
                        });
                    });
                    autoLocationData = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                } catch (err) {
                    console.warn('Geolocation capture failed or was denied:', err);
                }
            }

            const postData: CreatePostData = {
                userId: user.id,
                userName: user.name || 'User',
                avatar: user.avatar || '',
                text: content.trim(),
                type: postType,
                media: mediaData,
                feeling: feeling || undefined,
                location: locationName ? { name: locationName } : undefined,
                autoLocation: autoLocationData,
                taggedUsers: taggedUsers.length > 0 ? taggedUsers.map(u => ({ userId: u._id, userName: u.name, avatarUrl: u.avatar })) : undefined,
                poll: postType === 'poll' ? {
                    question: content.trim() || 'Poll',
                    options: validPollOptions
                } : undefined
            };

            const result = await createPost(postData);

            if (result) {
                setContent('');
                setSelectedFile(null);
                setMediaPreview(null);
                setFeeling('');
                setLocationName('');
                setGifUrl('');
                setTaggedUsers([]);
                setIsModalOpen(false);
                setShowPollCreator(false);
                setPollOptions(['', '']);
                onPostCreated();
            }
        } catch (error: any) {
            console.error('Failed to create post', error);
            alert(`Failed to publish post: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.createPostWidget}>
            <div className={styles.createPostHeader}>
                <Image
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                    alt="User"
                    width={40}
                    height={40}
                    className={styles.userAvatar}
                    style={{ width: '40px', height: '40px' }}
                    unoptimized
                />
                <button
                    className={styles.createPostTextarea}
                    style={{ textAlign: 'left', color: '#65676b', cursor: 'pointer' }}
                    onClick={handleOpenModal}
                >
                    {user ? `What's on your mind, ${user.name?.split(' ')[0]}?` : "Join the conversation..."}
                </button>
            </div>

            <div className={styles.createPostActions}>
                <div className={styles.actionItem} onClick={handleOpenModal}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#45bd62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Photo/video</span>
                </div>
                <div className={styles.actionItem} onClick={handleOpenModal}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f7b928" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Feeling/activity</span>
                </div>
                <div className={styles.actionItem} onClick={() => { handleOpenModal(); setShowPollCreator(true); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab026" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20v-6M6 20V10M18 20V4" />
                    </svg>
                    <span>Poll</span>
                </div>
                <div className={styles.actionItem} onClick={() => { handleOpenModal(); setShowGifPicker(true); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"
                            fill="none"
                            stroke="#cd48ff"
                            stroke-width="2" />

                        <text x="5" y="16"
                            fill="#cd48ff"
                            font-size="9"
                            font-weight="bold"
                            stroke="none">
                            GIF
                        </text>

                    </svg>

                    <span>GIF</span>
                </div>
            </div>

            {isModalOpen && user && (
                <div className={styles.createPostModalOverlay} onClick={handleCloseModal}>
                    <div className={styles.createPostModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Create post</h2>
                            <button className={styles.closeModalBtn} onClick={handleCloseModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.modalUser}>
                                <Image
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className={styles.userAvatar}
                                    style={{ width: '40px', height: '40px' }}
                                    unoptimized
                                />
                                <div>
                                    <div className={styles.modalUserName}>
                                        {user.name}
                                        {feeling && (
                                            <span style={{ fontWeight: 400, color: '#65676b', marginLeft: '4px' }}>
                                                is feeling {feelings.find(f => f.label === feeling)?.emoji} {feeling}
                                            </span>
                                        )}
                                        {locationName && (
                                            <span style={{ fontWeight: 400, color: '#65676b', marginLeft: '4px' }}>
                                                at <span style={{ fontWeight: 600 }}>{locationName}</span>
                                            </span>
                                        )}
                                        {taggedUsers.length > 0 && (
                                            <span style={{ fontWeight: 400, color: '#65676b', marginLeft: '4px' }}>
                                                — with <span style={{ fontWeight: 600 }}>
                                                    {taggedUsers[0].name}
                                                    {taggedUsers.length > 1 && ` and ${taggedUsers.length - 1} other${taggedUsers.length > 2 ? 's' : ''}`}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ background: '#e4e6eb', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM9.5 14.5l-3-3 1.5-1.5 1.5 1.5 4.5-4.5 1.5 1.5-6 6z" />
                                        </svg>
                                        Public
                                    </div>
                                </div>
                            </div>

                            <textarea
                                className={styles.modalTextarea}
                                placeholder={`What's on your mind, ${user.name?.split(' ')[0]}?`}
                                value={content}
                                autoFocus
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {showFeelingSelector && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>How are you feeling?</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                        {feelings.map((f) => (
                                            <button
                                                key={f.label}
                                                onClick={() => { setFeeling(f.label); setShowFeelingSelector(false); }}
                                                style={{
                                                    padding: '8px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    background: feeling === f.label ? '#e7f3ff' : '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <span style={{ fontSize: '20px' }}>{f.emoji}</span>
                                                {f.label}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => { setFeeling(''); setShowFeelingSelector(false); }}
                                            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showLocationInput && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Where are you?</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter location..."
                                            value={locationName}
                                            onChange={(e) => setLocationName(e.target.value)}
                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            onClick={() => setShowLocationInput(false)}
                                            style={{ padding: '8px 12px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showUserTagger && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Tag friends</div>
                                    <input
                                        type="text"
                                        placeholder="Search for friends..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '8px' }}
                                    />
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {allUsers.filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase())).slice(0, 10).map(u => (
                                            <div
                                                key={u._id}
                                                onClick={() => toggleUserTag(u)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    background: taggedUsers.find(tu => tu._id === u._id) ? '#e7f3ff' : '#fff',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Image src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} width={32} height={32} style={{ borderRadius: '50%' }} unoptimized />
                                                <div style={{ flex: 1, fontWeight: 500 }}>{u.name}</div>
                                                {taggedUsers.find(tu => tu._id === u._id) && (
                                                    <div style={{ color: '#1877f2' }}>✓</div>
                                                )}
                                            </div>
                                        ))}
                                        {allUsers.length === 0 && <div style={{ textAlign: 'center', padding: '12px', color: '#65676b' }}>No users found</div>}
                                    </div>
                                    <button
                                        onClick={() => setShowUserTagger(false)}
                                        style={{ width: '100%', marginTop: '8px', padding: '8px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}

                            {showGifPicker && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{gifSearchQuery ? 'Search Results' : 'Trending on GIPHY'}</div>
                                        <div style={{ fontSize: '10px', color: '#65676b' }}>Powered by GIPHY</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search GIFs..."
                                            value={gifSearchQuery}
                                            onChange={(e) => setGifSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && searchGifs()}
                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            onClick={searchGifs}
                                            disabled={gifLoading}
                                            style={{ padding: '8px 12px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            {gifLoading ? '...' : 'Search'}
                                        </button>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                        {gifResults.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt="GIF"
                                                onClick={() => handleGifSelect(url)}
                                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                            />
                                        ))}
                                        {gifResults.length === 0 && !gifLoading && <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '20px', color: '#65676b' }}>No GIFs found</div>}
                                    </div>
                                    <button
                                        onClick={() => setShowGifPicker(false)}
                                        style={{ width: '100%', marginTop: '8px', padding: '8px', background: '#ddd', color: '#333', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            )}

                            {showPollCreator && (
                                <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>Poll Options</div>
                                    {pollOptions.map((option, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder={`Option ${idx + 1}`}
                                                value={option}
                                                onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                            {pollOptions.length > 2 && (
                                                <button onClick={() => removePollOption(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#65676b' }}>✕</button>
                                            )}
                                        </div>
                                    ))}
                                    {pollOptions.length < 4 && (
                                        <button
                                            onClick={addPollOption}
                                            style={{ margin: '8px 0', padding: '6px 12px', background: 'none', border: '1px dashed #1877f2', color: '#1877f2', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                                        >
                                            + Add Option
                                        </button>
                                    )}
                                </div>
                            )}

                            {mediaPreview && (
                                <div className={styles.previewContainer}>
                                    {mediaPreview.type === 'video' ? (
                                        <video src={mediaPreview.url} className={styles.previewImage} controls />
                                    ) : (
                                        <img src={mediaPreview.url} alt="Preview" className={styles.previewImage} />
                                    )}
                                    <button
                                        className={styles.closePreviewBtn}
                                        onClick={() => { setSelectedFile(null); setMediaPreview(null); setGifUrl(''); }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.addToPost}>
                                <span className={styles.addToPostLabel}>Add to your post</span>
                                <div className={styles.addToPostIcons}>
                                    <label className={`${styles.iconBtn} ${selectedFile ? styles.activeMedia : ''}`}>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                            ref={fileInputRef}
                                        />
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#45bd62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </label>
                                    <div
                                        className={`${styles.iconBtn} ${taggedUsers.length > 0 ? styles.activeMedia : ''}`}
                                        onClick={() => { setShowUserTagger(!showUserTagger); setShowFeelingSelector(false); setShowLocationInput(false); setShowGifPicker(false); }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                    <div
                                        className={`${styles.iconBtn} ${feeling ? styles.activeMedia : ''}`}
                                        onClick={() => { setShowFeelingSelector(!showFeelingSelector); setShowLocationInput(false); setShowUserTagger(false); setShowGifPicker(false); }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f7b928" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                    </div>
                                    <div
                                        className={`${styles.iconBtn} ${locationName ? styles.activeMedia : ''}`}
                                        onClick={() => { setShowLocationInput(!showLocationInput); setShowFeelingSelector(false); setShowUserTagger(false); setShowGifPicker(false); }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f02849" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div
                                        className={`${styles.iconBtn} ${gifUrl ? styles.activeMedia : ''}`}
                                        onClick={() => { setShowGifPicker(!showGifPicker); setShowFeelingSelector(false); setShowLocationInput(false); setShowUserTagger(false); setShowPollCreator(false); }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cd48ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <text x="6" y="16" fill="#cd48ff" fontSize="10" fontWeight="bold">GIF</text>
                                        </svg>
                                    </div>
                                    <div
                                        className={`${styles.iconBtn} ${showPollCreator ? styles.activeMedia : ''}`}
                                        onClick={() => { setShowPollCreator(!showPollCreator); setShowGifPicker(false); setShowFeelingSelector(false); setShowLocationInput(false); setShowUserTagger(false); }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab026" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20v-6M6 20V10M18 20V4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={styles.publishBtn}
                                disabled={loading || (!content.trim() && !selectedFile)}
                                onClick={handleSubmit}
                            >
                                {loading ? 'Publishing...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
