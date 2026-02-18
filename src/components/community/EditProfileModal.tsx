'use client';

import React, { useState } from 'react';
import styles from '@/app/community/Community.module.css';
import { UserProfile } from '@/types';
import { updateUserProfile } from '@/lib/api';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    onUpdate: (updatedProfile: UserProfile) => void;
}

export default function EditProfileModal({ isOpen, onClose, profile, onUpdate }: EditProfileModalProps) {
    const [name, setName] = useState(profile.name);
    const [bio, setBio] = useState(profile.bio || '');
    const [location, setLocation] = useState(profile.location || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await updateUserProfile(profile._id, {
                name,
                bio,
                location
            });

            if (success) {
                onUpdate({
                    ...profile,
                    name,
                    bio,
                    location
                });
                onClose();
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.glassModalOverlay} onClick={onClose}>
            <div className={styles.glassModal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Edit Profile</h2>
                    <button className={styles.closeModalBtn} onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalBody} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{ color: '#e74c3c', backgroundColor: '#fdf2f2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={styles.headerSearch}
                            style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className={styles.headerSearch}
                            style={{
                                paddingLeft: '1rem',
                                maxWidth: '100%',
                                minHeight: '100px',
                                paddingTop: '0.75rem',
                                resize: 'vertical'
                            }}
                            placeholder="Tell the community about yourself..."
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
                            Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className={styles.headerSearch}
                            style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                            placeholder="e.g. New York, USA"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.modalTab}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '10px' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.publishBtn}
                            style={{ flex: 2 }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
