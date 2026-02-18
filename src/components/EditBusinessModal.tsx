'use client';

import React, { useState, useRef } from 'react';
import styles from '@/app/community/Community.module.css';
import { Business } from '@/types';
// import { updateBusiness } from '@/lib/api'; // I'll check if this exists or use a placeholder
import Image from 'next/image';

interface EditBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business;
    onUpdate: (updatedBusiness: Business) => void;
}

export default function EditBusinessModal({ isOpen, onClose, business, onUpdate }: EditBusinessModalProps) {
    const [businessName, setBusinessName] = useState(business.businessName);
    const [description, setDescription] = useState(business.description || '');
    const [businessCategory, setBusinessCategory] = useState(business.businessCategory || '');
    const [city, setCity] = useState(business.city || '');
    const [whatsapp, setWhatsapp] = useState(business.whatsapp || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const updateData = {
            businessName,
            description,
            businessCategory,
            city,
            whatsapp
        };

        try {
            // Placeholder for actual API call
            console.log("Updating business:", updateData);
            await new Promise(resolve => setTimeout(resolve, 1000));

            onUpdate({
                ...business,
                ...updateData
            } as Business);
            onClose();
        } catch (err) {
            setError('An error occurred while updating the business.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.glassModalOverlay} onClick={onClose}>
            <div className={styles.glassModal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Edit Business</h2>
                    <button className={styles.closeModalBtn} onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalBody} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{ color: '#e74c3c', backgroundColor: '#fdf2f2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Business Name
                            </label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Category
                            </label>
                            <input
                                type="text"
                                value={businessCategory}
                                onChange={e => setBusinessCategory(e.target.value)}
                                className={styles.headerSearch}
                                style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className={styles.headerSearch}
                                    style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                    WhatsApp / Contact
                                </label>
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    className={styles.headerSearch}
                                    style={{ paddingLeft: '1rem', maxWidth: '100%' }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className={styles.headerSearch}
                                style={{
                                    paddingLeft: '1rem',
                                    maxWidth: '100%',
                                    minHeight: '120px',
                                    paddingTop: '0.75rem',
                                    resize: 'vertical'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
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
