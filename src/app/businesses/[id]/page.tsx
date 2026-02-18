'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getBusinessById } from '@/lib/api';
import { Business } from '@/types';
import styles from './page.module.css';
import EditBusinessModal from '@/components/EditBusinessModal';

export default function BusinessDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id as string;
    const editMode = searchParams.get('edit') === 'true';

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        loadBusiness();
    }, [id]);

    useEffect(() => {
        if (editMode && business) {
            setIsEditModalOpen(true);
        }
    }, [editMode, business]);

    const loadBusiness = async () => {
        setLoading(true);
        const data = await getBusinessById(id);
        setBusiness(data);
        setLoading(false);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
        if (searchParams.get('edit')) {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('edit');
            const qs = newParams.toString();
            router.replace(`/businesses/${id}${qs ? `?${qs}` : ''}`, { scroll: false });
        }
    };

    if (loading) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading business details...</p>
                </div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.notFound}>
                    <h1>Business Not Found</h1>
                    <p>The business you're looking for doesn't exist.</p>
                    <a href="/businesses" className={styles.backLink}>← Back to Businesses</a>
                </div>
            </div>
        );
    }

    const images = business.images || [];
    const mainImage = business.banner || business.logo || images[0] || '/placeholder-business.jpg';

    return (
        <div className={styles.detailPage}>
            {/* Banner */}
            <div className={styles.banner} style={{ backgroundImage: `url(${mainImage})` }}>
                <div className={styles.bannerOverlay}>
                    <div className="container">
                        <div className={styles.bannerContent}>
                            {business.logo && (
                                <img src={business.logo} alt={business.businessName} className={styles.logo} />
                            )}
                            <div>
                                <h1 className={styles.businessName}>{business.businessName}</h1>
                                <p className={styles.category}>{business.businessCategory}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container">
                <div className={styles.content}>
                    {/* Main Info */}
                    <div className={styles.mainColumn}>
                        {/* About */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>About</h2>
                            <p className={styles.description}>{business.description || 'No description available.'}</p>
                        </section>

                        {/* Products/Services */}
                        {business.products && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Products & Services</h2>
                                <p className={styles.description}>{business.products}</p>
                            </section>
                        )}

                        {/* Image Gallery */}
                        {images.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Gallery</h2>
                                <div className={styles.gallery}>
                                    {images.map((image, index) => (
                                        <img key={index} src={image} alt={`${business.businessName} ${index + 1}`} className={styles.galleryImage} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className={styles.sidebar}>
                        {/* Contact Card */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Contact Information</h3>

                            <div className={styles.infoItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <div>
                                    <strong>Address</strong>
                                    <p>{business.address}, {business.city}, {business.state} - {business.pincode}</p>
                                </div>
                            </div>

                            {business.whatsapp && (
                                <div className={styles.infoItem}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <div>
                                        <strong>WhatsApp</strong>
                                        <p>{business.whatsapp}</p>
                                    </div>
                                </div>
                            )}

                            <div className={styles.actionButtons}>
                                <a href={`tel:${business.whatsapp}`} className={styles.btnCall}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    Call Now
                                </a>
                                <a href={`https://wa.me/${business.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsApp}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Business Details */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Business Details</h3>

                            {business.ownerName && (
                                <div className={styles.detailItem}>
                                    <strong>Owner:</strong>
                                    <span>{business.ownerName}</span>
                                </div>
                            )}

                            {business.establishedIn && (
                                <div className={styles.detailItem}>
                                    <strong>Established:</strong>
                                    <span>{business.establishedIn}</span>
                                </div>
                            )}

                            {business.noOfEmployee && (
                                <div className={styles.detailItem}>
                                    <strong>Employees:</strong>
                                    <span>{business.noOfEmployee}</span>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        {(business.websiteLink || business.facebookLink || business.instagramLink) && (
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Connect Online</h3>
                                <div className={styles.socialLinks}>
                                    {business.websiteLink && (
                                        <a href={business.websiteLink.startsWith('http') ? business.websiteLink : `https://${business.websiteLink}`} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="2" y1="12" x2="22" y2="12" />
                                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                            </svg>
                                            Website
                                        </a>
                                    )}
                                    {business.facebookLink && (
                                        <a href={business.facebookLink} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            Facebook
                                        </a>
                                    )}
                                    {business.instagramLink && (
                                        <a href={business.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                            Instagram
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {business && (
                <EditBusinessModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditClose}
                    business={business}
                    onUpdate={(updated) => setBusiness(updated)}
                />
            )}
        </div>
    );
}
