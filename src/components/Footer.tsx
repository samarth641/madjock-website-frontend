import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const quickLinks = [
        { name: 'About us', href: '/about' },
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms & Conditions', href: '/terms-and-conditions' },
        { name: 'Child Safety', href: '/child-safety' },
        { name: 'Free Listing', href: '#' },
        { name: 'Report a Bug', href: '#' }
    ];

    const jdVerticals = [
        'B2B', 'News', 'Automobiles & Two Wheelers', 'Beauty & Personal Care',
        'Business & Legal', 'Chemicals', 'Construction & Real Estate', 'Education',
        'Electronics', 'Energy', 'Engineering', 'Entertainment',
        'Events & Wedding', 'Fitness & Facility', 'Food & Beverage', 'Furniture',
        'Health & Medical', 'Housekeeping & Facility', 'Industrial Plants & Machinery',
        'IT Components', 'Jewellery', 'Lights & Lighting', 'Luggage Bags & Cases',
        'Office & School Supplies', 'Packaging & Printing', 'Pet & Pet Supplies',
        'Public', 'Restaurant', 'Security & Protection', 'Sports & Entertainment',
        'Textile & Leather', 'Tools & Games', 'Transportation & Shipping', 'Travel',
        'Watches & Eyewear'
    ];

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    {/* Quick Links */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Quick Links</h3>
                        <div className={styles.linkGrid}>
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={styles.link}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* JD Verticals */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>JD Verticals</h3>
                        <div className={styles.linkGrid}>
                            {jdVerticals.map((vertical) => (
                                <Link key={vertical} href="#" className={styles.link}>
                                    {vertical}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        Copyright © 2008-{new Date().getFullYear()}. All Rights Reserved. Privacy | Terms | Infringement
                    </p>
                </div>
            </div>
        </footer>
    );
}
