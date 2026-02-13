import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
    title: 'MadJock - Find Local Businesses & Services',
    description: 'Discover and connect with local businesses, services, and professionals in your area. Search across millions of businesses for restaurants, hotels, beauty services, and more.',
    keywords: 'business directory, local services, restaurants, hotels, beauty spa, education, healthcare',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Header />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
