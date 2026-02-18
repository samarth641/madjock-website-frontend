import React, { useState, useRef } from 'react';
import styles from '@/app/community/Community.module.css';
import { UserProfile } from '@/types';
import { updateUserProfile, uploadCommunityMedia } from '@/lib/api';
import Image from 'next/image';

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
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>(profile.gender || '');
    const [dob, setDob] = useState(profile.dob || '');
    const [aadhaarNumber, setAadhaarNumber] = useState(profile.aadhaarNumber || '');
    const [aadhaarImage, setAadhaarImage] = useState(profile.aadhaarImage || '');
    const [pincode, setPincode] = useState(profile.pincode || '');
    const [email, setEmail] = useState(profile.email || '');
    const [country, setCountry] = useState(profile.country || 'India');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingImage(true);
            setError('');
            try {
                const url = await uploadCommunityMedia(e.target.files[0]);
                if (url) {
                    setAadhaarImage(url);
                } else {
                    setError('Failed to upload image. Please try again.');
                }
            } catch (err) {
                setError('Error uploading image.');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const updateData = {
            name,
            bio,
            location,
            gender,
            dob,
            aadhaarNumber,
            aadhaarImage,
            pincode,
            email,
            country
        };

        try {
            const success = await updateUserProfile(profile._id, updateData);

            if (success) {
                onUpdate({
                    ...profile,
                    ...updateData
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
            <div className={styles.glassModal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem', gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
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

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={e => setGender(e.target.value as any)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%', appearance: 'auto' }}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Aadhaar Number
                            </label>
                            <input
                                type="text"
                                value={aadhaarNumber}
                                onChange={e => setAadhaarNumber(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                placeholder="Enter Aadhaar Number"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Upload Aadhaar Image
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={styles.modalTab}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px', margin: 0 }}
                                    disabled={uploadingImage}
                                >
                                    {uploadingImage ? 'Uploading...' : (aadhaarImage ? 'Change Image' : 'Select Image')}
                                </button>
                                {aadhaarImage && !uploadingImage && (
                                    <div style={{ position: 'relative', width: '40px', height: '30px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <Image src={aadhaarImage} alt="Aadhaar" fill style={{ objectFit: 'cover' }} unoptimized />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Pincode
                            </label>
                            <input
                                type="text"
                                value={pincode}
                                onChange={e => setPincode(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                placeholder="Pin code"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                placeholder="test@madjock.com"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Country
                            </label>
                            <input
                                type="text"
                                value={country}
                                disabled
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%', backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Location (City)
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                placeholder="e.g. New Delhi"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem', gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className={styles.headerSearch}
                                style={{
                                    paddingLeft: '1rem',
                                    maxWidth: '100%',
                                    minHeight: '80px',
                                    paddingTop: '0.75rem',
                                    resize: 'vertical'
                                }}
                                placeholder="Tell the community about yourself..."
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                            disabled={loading || uploadingImage}
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
