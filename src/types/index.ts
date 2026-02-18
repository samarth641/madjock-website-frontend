export interface Business {
    _id: string;
    businessName: string;
    ownerName: string;
    whatsapp: string;
    description: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    businessCategory: string;
    products: string;
    noOfEmployee: number;
    establishedIn: string;
    websiteLink?: string;
    facebookLink?: string;
    instagramLink?: string;
    facebook: 'YES' | 'NO';
    instagram: 'YES' | 'NO';
    twitter: 'YES' | 'NO';
    website: 'YES' | 'NO';
    images: string[];
    logo?: string;
    banner?: string;
    selfie?: string;
    status: 'pending' | 'approved' | 'rejected';
    featured?: boolean;
    rating?: number;
    salesPersonId?: string;
    salesPersonUserId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Slider {
    _id: string;
    title: string;
    imageUrl: string;
    description?: string;
    link?: string;
    status: 'active' | 'inactive';
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    featured?: boolean;
}

export interface Service {
    _id: string;
    name: string;
    description?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface SearchParams {
    query?: string;
    search?: string;
    city?: string;
    category?: string;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface UserSnippet {
    _id: string;
    name: string;
    avatar?: string;
}

export interface UserProfile extends UserSnippet {
    bio?: string;
    location?: string;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
    postsCount: number;
    joinedAt?: string;
}

export interface CommunityComment {
    _id: string;
    user: UserSnippet;
    content: string;
    createdAt: string;
    likes: string[]; // User IDs
}

export interface PollOption {
    _id: string;
    id?: string;
    text: string;
    votes: string[]; // User IDs
}

export interface Poll {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string | null; // For the current user
}

export interface Post {
    _id: string;
    user: UserSnippet;
    content?: string;
    images?: string[];
    video?: string;
    gif?: string;
    type: 'text' | 'image' | 'video' | 'poll';
    feeling?: string;
    location?: {
        name: string;
        lat?: number;
        lng?: number;
    };
    taggedUsers?: { userId: string; userName: string; avatarUrl?: string; }[];
    poll?: Poll;
    likes: string[]; // User IDs
    comments: CommunityComment[];
    createdAt: string;
    updatedAt: string;
    likedByMe?: boolean; // Helper for UI
}

export interface Story {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    media: {
        url: string;
        type: 'image' | 'video';
    };
    expiresAt: string;
    createdAt: string;
}
