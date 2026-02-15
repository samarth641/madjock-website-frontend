'use client';

import Header from '@/components/Header';
import AboutUsNavbar from '@/components/AboutUsNavbar';
import { usePathname } from 'next/navigation';

export default function NavbarWrapper() {
    const pathname = usePathname();
    const corporateRoutes = ['/about-us', '/about', '/career', '/testimonials', '/services', '/news-room', '/contact'];
    const isCorporate = corporateRoutes.includes(pathname);

    return isCorporate ? <AboutUsNavbar /> : <Header />;
}
