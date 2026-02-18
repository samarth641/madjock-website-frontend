import axios from 'axios';
import { Business, Slider, Category, ApiResponse, SearchParams, Post, UserSnippet, CommunityComment, Poll, Service, UserProfile, Story } from '../types';

import { mockBusinesses, mockCategories, mockServices } from './mockData';
import { transformBusinessArray } from './transformers';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Slider APIs
export const getActiveSliders = async (): Promise<Slider[]> => {
    try {
        const response = await apiClient.get('/api/sliders/active');
        return response.data.data || [];
    } catch (error) {
        console.error('❌ Error fetching sliders:', error);
        return [];
    }
};

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

// Community APIs
// Mock Data for Community if backend is not ready
const mockPosts: Post[] = [
    {
        _id: '1',
        user: { _id: 'u1', name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random' },
        content: 'Check out this amazing view from my hike yesterday! 🏔️',
        type: 'image',
        images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format&fit=crop&q=60'],
        likes: ['u2', 'u3'],
        comments: [
            { _id: 'c1', user: { _id: 'u2', name: 'Jane Smith' }, content: 'Wow, stunning!', createdAt: new Date().toISOString(), likes: [] },
            { _id: 'c2', user: { _id: 'u3', name: 'Bob Johnson' }, content: 'Where is this?', createdAt: new Date().toISOString(), likes: [] },
            { _id: 'c3', user: { _id: 'u4', name: 'Alice Williams' }, content: 'I want to go there!', createdAt: new Date().toISOString(), likes: [] }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likedByMe: false
    },
    {
        _id: '2',
        user: { _id: 'u2', name: 'Tech Insider', avatar: 'https://ui-avatars.com/api/?name=Tech+Insider&background=random' },
        content: 'Which programming language do you prefer for backend development?',
        type: 'poll',
        poll: {
            question: 'Best Backend Language?',
            options: [
                { _id: 'p1', text: 'Node.js', votes: ['u1', 'u3'] },
                { _id: 'p2', text: 'Python', votes: ['u4'] },
                { _id: 'p3', text: 'Go', votes: [] },
                { _id: 'p4', text: 'Java', votes: [] }
            ],
            totalVotes: 3
        },
        likes: ['u1'],
        comments: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        likedByMe: true
    },
    {
        _id: '3',
        user: { _id: 'u5', name: 'Alice Cooper', avatar: 'https://ui-avatars.com/api/?name=Alice+Cooper&background=random' },
        content: 'Just launched my new website! Check it out.',
        type: 'text',
        likes: [],
        comments: [],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date().toISOString(),
        likedByMe: false
    }
];

// Transformers
const transformComment = (data: any): CommunityComment => ({
    _id: data._id || data.id,
    user: {
        _id: data.userId || (data.user?._id || data.user?.id),
        name: data.userName || data.user?.name,
        avatar: data.profileImageUrl || data.user?.avatar
    },
    content: data.text || data.content,
    createdAt: data.createdAt || data.timestamp,
    likes: data.likes || []
});

const transformPost = (data: any): Post => {
    // Robustly find an ID for the post
    const postId = data._id || data.id;
    console.log('DEBUG: transformPost raw data:', {
        id: postId,
        type: data.type,
        media: data.media,
        hasImage: !!data.media?.image,
        hasVideo: !!data.media?.video
    });

    return {
        _id: postId ? String(postId) : '',
        user: {
            _id: data.userId || (data.user?._id || data.user?.id) || 'unknown',
            name: data.userName || data.user?.name || 'Unknown User',
            avatar: data.profileImageUrl || data.user?.avatar || ''
        },
        content: data.text || data.content || '',
        images: data.media?.image ? [data.media.image] : (Array.isArray(data.images) ? data.images : (data.image ? [data.image] : [])),
        video: data.media?.video || data.video || '',
        gif: data.media?.gif || data.gif || '',
        type: (data.media?.video || data.video) ? 'video' :
            (data.media?.gif || data.media?.image || (data.images && data.images.length > 0) || data.image) ? 'image' :
                (data.poll ? 'poll' : (data.type || 'text')),
        poll: data.poll ? {
            question: data.poll.question,
            options: (data.poll.options || []).map((opt: any) => ({
                _id: opt._id || opt.id,
                text: opt.text,
                votes: opt.votes || []
            })),
            totalVotes: data.poll.totalVotes || 0,
            userVotedOptionId: data.poll.userVotedOptionId
        } : undefined,
        feeling: data.feeling || '',
        location: data.location ? {
            name: data.location.name || '',
            lat: data.location.lat,
            lng: data.location.lng
        } : undefined,
        taggedUsers: (data.taggedUsers || []).map((tu: any) => ({
            userId: tu.userId,
            userName: tu.userName,
            avatarUrl: tu.avatarUrl || tu.profileImageUrl || ''
        })),
        likes: data.likes || [],
        comments: (data.comments || []).map(transformComment),
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        updatedAt: data.updatedAt || data.timestamp || new Date().toISOString(),
        likedByMe: false // Calculated in component or passed from backend
    };
};

export const getPosts = async (): Promise<Post[]> => {
    try {
        const response = await apiClient.get('/api/community/all');
        const rawPosts = response.data.data || [];
        return rawPosts.map(transformPost);
    } catch (error: any) {
        console.warn('⚠️ Backend error or unavailable, using mock data:', error.message);
        return mockPosts;
    }
};

export interface CreatePostData {
    userId: string;
    userName: string;
    profileImageUrl?: string;
    text: string;
    type: 'text' | 'image' | 'video' | 'poll';
    feeling?: string;
    location?: {
        name: string;
        lat?: number;
        lng?: number;
    };
    media?: {
        image?: string;
        video?: string;
        gif?: string;
    };
    taggedUsers?: { userId: string; userName: string; avatarUrl?: string; }[];
    poll?: {
        question: string;
        options: string[];
        duration?: number;
    };
}

export const createPost = async (postData: CreatePostData): Promise<Post | null> => {
    try {
        const response = await apiClient.post('/api/community/create', postData);
        return response.data.data ? transformPost(response.data.data) : null;
    } catch (error) {
        console.error('❌ Error creating post:', error);
        throw error;
    }
};

export const uploadCommunityMedia = async (file: File): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('communityMedia', file);

        const response = await apiClient.post('/api/community/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data.url || null;
    } catch (error) {
        console.error('❌ Error uploading community media:', error);
        return null;
    }
};

export const likePost = async (postId: string, userId: string): Promise<{ success: boolean; likes: string[] }> => {
    try {
        // Backend expects userId in body for toggling
        const response = await apiClient.put(`/api/community/like/${postId}`, { userId });
        return response.data;
    } catch (error) {
        console.error('❌ Error liking post:', error);
        return { success: false, likes: [] };
    }
};

export const commentOnPost = async (postId: string, userId: string, userName: string, text: string): Promise<CommunityComment | null> => {
    try {
        const response = await apiClient.post(`/api/community/comment/${postId}`, { userId, userName, text });
        return response.data.data ? transformComment(response.data.data) : null;
    } catch (error) {
        console.error('❌ Error creating comment:', error);
        return null;
    }
};

export const votePoll = async (postId: string, optionId: string): Promise<Poll | null> => {
    try {
        const response = await apiClient.post(`/api/community/vote/${postId}`, { optionId });
        const updatedPollData = response.data.data;
        return updatedPollData ? {
            question: updatedPollData.question,
            options: updatedPollData.options.map((opt: any) => ({
                _id: opt._id || opt.id,
                text: opt.text,
                votes: opt.votes || []
            })),
            totalVotes: updatedPollData.totalVotes || 0,
            userVotedOptionId: updatedPollData.userVotedOptionId
        } : null;
    } catch (error) {
        console.error('❌ Error voting on poll:', error);
        return null;
    }
};

export const searchCommunity = async (query: string): Promise<{ posts: Post[]; users: any[] }> => {
    try {
        const response = await apiClient.get(`/api/community/search?q=${encodeURIComponent(query)}`);
        const { posts = [], users = [] } = response.data.data || {};
        return {
            posts: posts.map(transformPost),
            users: users.map((u: any) => ({
                _id: u._id || u.id,
                name: u.name || u.userName,
                avatar: u.avatar || u.profileImageUrl
            }))
        };
    } catch (error) {
        console.error('❌ Error searching community:', error);
        return { posts: [], users: [] };
    }
};

export const getUsers = async (): Promise<UserSnippet[]> => {
    try {
        const response = await apiClient.get('/api/admin/users/all');
        if (response.data?.success) {
            const rawUsers = response.data.data;
            if (!Array.isArray(rawUsers)) return [];

            // Map and filter for valid IDs
            const mappedUsers = rawUsers.map((u: any) => ({
                _id: String(u._id || u.id || ''),
                name: u.userName || u.name || 'User',
                avatar: u.profileImageUrl || u.avatar || ''
            })).filter(u => u._id && u._id !== 'undefined' && u._id !== 'null');

            // Deduplicate
            const uniqueUsers = Array.from(new Map(mappedUsers.map(u => [u._id, u])).values());

            return uniqueUsers as UserSnippet[];
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch users', error);
        return [];
    }
};

// User Profile & Follow APIs
export const getUserProfile = async (userId: string, currentUserId?: string): Promise<UserProfile | null> => {
    try {
        const response = await apiClient.get(`/api/users/profile/${userId}${currentUserId ? `?currentUserId=${currentUserId}` : ''}`);
        const u = response.data.data || response.data.user || response.data;
        if (!u) return null;

        return {
            _id: u._id || u.id,
            name: u.userName || u.name || 'User',
            avatar: u.profileImageUrl || u.avatar || '',
            bio: u.bio || '',
            location: u.location || '',
            gender: u.gender || '',
            dob: u.dob || '',
            aadhaarNumber: u.aadhaarNumber || '',
            aadhaarImage: u.aadhaarImage || '',
            pincode: u.pincode || '',
            email: u.email || '',
            country: u.country || 'India',
            followersCount: u.followersCount || 0,
            followingCount: u.followingCount || 0,
            isFollowing: u.isFollowing || false,
            postsCount: u.postsCount || 0,
            joinedAt: u.createdAt
        };
    } catch (error) {
        console.error(`❌ Error fetching profile for ${userId}:`, error);
        return null;
    }
};

export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
    try {
        const response = await apiClient.get(`/api/users/posts/${userId}`);
        const rawPosts = response.data.data || [];
        return rawPosts.map(transformPost);
    } catch (error) {
        console.error(`❌ Error fetching posts for user ${userId}:`, error);
        return [];
    }
};

export const followUser = async (targetUserId: string, userId: string): Promise<boolean> => {
    try {
        const response = await apiClient.post(`/api/users/follow/${targetUserId}`, { userId });
        return response.data.success || false;
    } catch (error) {
        console.error(`❌ Error following user ${targetUserId}:`, error);
        return false;
    }
};

export const unfollowUser = async (targetUserId: string, userId: string): Promise<boolean> => {
    try {
        const response = await apiClient.post(`/api/users/unfollow/${targetUserId}`, { userId });
        return response.data.success || false;
    } catch (error) {
        console.error(`❌ Error unfollowing user ${targetUserId}:`, error);
        return false;
    }
};

export const getFollowers = async (userId: string, currentUserId?: string) => {
    const response = await apiClient.get(`/api/users/followers/${userId}`, {
        params: { currentUserId }
    });
    return response.data.data;
};

export const getFollowing = async (userId: string, currentUserId?: string) => {
    const response = await apiClient.get(`/api/users/following/${userId}`, {
        params: { currentUserId }
    });
    return response.data.data;
};

export const getUserBusinesses = async (userId: string): Promise<Business[]> => {
    try {
        const response = await apiClient.get(`/api/users/businesses/${userId}`);
        const businesses = response.data.data || [];
        return transformBusinessArray(businesses);
    } catch (error) {
        console.error(`❌ Error fetching businesses for user ${userId}:`, error);
        return [];
    }
};

export const updateUserProfile = async (userId: string, data: any): Promise<boolean> => {
    try {
        const response = await apiClient.put(`/api/users/profile/${userId}`, data);
        return response.data.success || false;
    } catch (error) {
        console.error(`❌ Error updating profile for ${userId}:`, error);
        return false;
    }
};

// Story APIs
export const getStories = async (): Promise<Story[]> => {
    try {
        const response = await apiClient.get('/api/stories');
        return response.data.data || [];
    } catch (error) {
        console.error('❌ Error fetching stories:', error);
        return [];
    }
};

export const createStory = async (storyData: Partial<Story>): Promise<Story | null> => {
    try {
        const response = await apiClient.post('/api/stories', storyData);
        return response.data.data || null;
    } catch (error) {
        console.error('❌ Error creating story:', error);
        throw error;
    }
};
