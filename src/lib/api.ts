import axios from 'axios';
import { Business, Category, Service, SearchParams } from '@/types';
import { mockBusinesses, mockCategories, mockServices } from './mockData';
import { transformBusinessArray } from './transformers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Business APIs
export const getBusinesses = async (params?: SearchParams): Promise<Business[]> => {
    try {
        const response = await apiClient.get('/api/admin/business/all', { params });

        console.log('🔍 All Businesses API Response:', response.data);

        // API returns { success: true, count: X, data: [...] }
        let businesses = [];
        if (response.data.data) {
            businesses = response.data.data;
        } else if (response.data.businesses) {
            businesses = response.data.businesses;
        } else if (Array.isArray(response.data)) {
            businesses = response.data;
        }

        console.log(`🔍 All Businesses Count (RAW): ${businesses.length}`);

        // Transform API data to match Business interface
        const transformedBusinesses = transformBusinessArray(businesses);

        console.log(`🔍 Transformed Count: ${transformedBusinesses.length}`);
        if (transformedBusinesses.length > 0) {
            console.log('🔍 First Transformed Business:', transformedBusinesses[0]);
        }

        // Filter by status if requested (case-insensitive)
        if (params?.status) {
            const filtered = transformedBusinesses.filter(b =>
                b.status.toLowerCase() === params.status!.toLowerCase()
            );
            console.log(`🔍 Filtered by status '${params.status}': ${filtered.length}`);
            return filtered;
        }

        return transformedBusinesses;
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using mock data for businesses');
        return mockBusinesses;
    }
};

export const getFeaturedBusinesses = async (city?: string): Promise<Business[]> => {
    try {
        const response = await apiClient.get('/api/admin/featured/all', { params: { city } });

        console.log('✅ Featured API Response:', response.data);

        // API returns { success: true, count: X, data: [...] }
        let businesses = [];
        if (response.data.data) {
            businesses = response.data.data;
        } else if (response.data.businesses) {
            businesses = response.data.businesses;
        } else if (Array.isArray(response.data)) {
            businesses = response.data;
        }

        console.log(`✅ Featured Businesses Count (RAW): ${businesses.length}`);

        if (businesses.length > 0) {
            console.log('📊 First Business (RAW):', businesses[0]);
        }

        // Transform API data to match Business interface
        const transformedBusinesses = transformBusinessArray(businesses);

        console.log(`✅ Transformed Count: ${transformedBusinesses.length}`);
        if (transformedBusinesses.length > 0) {
            console.log('📊 First Business (TRANSFORMED):', transformedBusinesses[0]);
        }

        return transformedBusinesses.slice(0, 6);
    } catch (error: any) {
        console.error('❌ Featured API Error:', error.message);
        console.warn('⚠️ Backend unavailable, using mock data');
        return mockBusinesses.slice(0, 3);
    }
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
    try {
        const url = `/api/admin/business/get/${id}`;
        console.log(`🔍 Fetching business detail from: ${API_BASE_URL}${url}`);
        const response = await apiClient.get(url);

        console.log('✅ Business Detail API Response:', response.data);

        const businessData = response.data.business || response.data.data || response.data;

        if (!businessData) {
            console.warn('⚠️ No business data found in response');
            return null;
        }

        const transformed = transformBusinessArray([businessData]);
        console.log('✅ Transformed Business Detail:', transformed[0]);
        return transformed[0] || null;
    } catch (error: any) {
        console.error(`❌ Business Detail API Error for ID ${id}:`, error.message);
        console.warn('⚠️ Backend unavailable or error, checking mock data');

        const mockMatch = mockBusinesses.find(b => b._id === id);
        if (mockMatch) {
            console.log('📋 Found matching business in mock data');
            return mockMatch;
        }

        console.warn('📋 No matching mock business found, falling back to first mock business');
        return mockBusinesses[0];
    }
};

// Category & Service APIs
export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await apiClient.get('/api/admin/alter/categories');
        const data = response.data.categories || response.data.data || response.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using mock data for categories');
        return mockCategories;
    }
};

export const getServices = async (): Promise<Service[]> => {
    try {
        const response = await apiClient.get('/api/admin/alter/services');
        const data = response.data.services || response.data.data || response.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using mock data for services');
        return mockServices;
    }
};

// Search function
export const searchBusinesses = async (search: string, city?: string): Promise<Business[]> => {
    // We now use the backend search capabilities by passing search and city
    return await getBusinesses({ search, city, status: 'approved' });
};
