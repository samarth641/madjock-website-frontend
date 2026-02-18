'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './AddBusiness.module.css';
import { createBusiness } from '@/lib/api';

export default function AddBusiness() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: user?.name || '',
        businessCategory: '',
        city: '',
        description: '',
        whatsapp: user?.phone || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = user?.id || (user as any)?._id;

            const submitData = new FormData();
            submitData.append('businessName', formData.businessName);
            submitData.append('ownerName', formData.ownerName);
            submitData.append('businessCategory', formData.businessCategory);
            submitData.append('city', formData.city);
            submitData.append('description', formData.description);
            submitData.append('whatsapp', formData.whatsapp);
            if (userId) {
                submitData.append('userId', userId);
            }

            const success = await createBusiness(submitData);

            if (success) {
                alert("Business application submitted for review!");
                router.push('/dashboard');
            } else {
                alert("Failed to submit business. Please try again.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit business. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className="container">
                <div className={styles.breadcrumb}>
                    <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <div className={styles.formCard}>
                    <h1 className={styles.formTitle}>Register Your Business</h1>
                    <p className={styles.formSubtitle}>Enter your business details to get started with MadJock.</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Business Name</label>
                            <input
                                type="text"
                                name="businessName"
                                placeholder="e.g. MadJock Fitness Center"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Category</label>
                            <select
                                name="businessCategory"
                                value={formData.businessCategory}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            >
                                <option value="">Select a category</option>
                                <option value="retail">Retail</option>
                                <option value="food">Food & Beverage</option>
                                <option value="service">Services</option>
                                <option value="health">Healthcare</option>
                                <option value="education">Education</option>
                            </select>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="e.g. Mumbai"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>WhatsApp / Contact</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    placeholder="e.g. +91 9876543210"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Business Description</label>
                            <textarea
                                name="description"
                                placeholder="Tell us what your business does..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitBtn}
                        >
                            {loading ? 'Submitting...' : 'Register Business'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
