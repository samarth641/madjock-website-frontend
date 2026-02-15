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
