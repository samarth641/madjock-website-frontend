import { Business } from '@/types';

/**
 * Transform API response to match Business interface
 * API structure has both top-level fields and nested selectedApprovedBusiness
 */
export function transformBusinessData(apiData: any): Business {
    // Use selectedApprovedBusiness if it exists, otherwise use top-level data
    const data = apiData.selectedApprovedBusiness || apiData;

    return {
        // Use top-level _id if available, otherwise generate from nested id
        _id: apiData._id || data.id || data.generatedid || '',

        // Business info
        businessName: data.businessName || '',
        ownerName: data.ownerName || '',
        whatsapp: data.whatsapp || data.contactNumber || '',
        description: data.description || data.businessDescription || '',

        // Address info - prefer businessLocation, fallback to streetAddresses
        address: data.address || data.businessLocation || data.streetAddresses?.[0] || '',
        streetAddresses: Array.isArray(data.streetAddresses) ? data.streetAddresses : [data.address || data.businessLocation].filter(Boolean),
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || data.pinCode || '',

        // Category and products
        businessCategory: data.businessCategory || '',
        products: data.products || data.productsOffered || '',
        noOfEmployee: parseInt(data.noOfEmployee) || 0,
        establishedIn: data.establishedIn?.toString() || '',

        // Social media links
        websiteLink: Array.isArray(data.websiteLink) ? data.websiteLink[0] : data.websiteLink || '',
        websiteLinks: Array.isArray(data.websiteLink) ? data.websiteLink : [data.websiteLink].filter(Boolean),
        facebookLink: data.facebookLink || '',
        instagramLink: data.instagramLink || data.instagramProfileLink || '',
        twitterLink: data.twitterLink || data.twitterAccountLink || '',

        // Social media flags
        facebook: data.facebookProfile ? 'YES' : 'NO',
        instagram: data.instagramProfile ? 'YES' : 'NO',
        twitter: data.twitterAccount ? 'YES' : 'NO',
        website: (data.website === 'true' || data.website === true) ? 'YES' : 'NO',

        // Media - use top-level fileUrls if businessImages is empty
        images: data.businessImages?.length > 0 ? data.businessImages : (apiData.fileUrls || []),
        logo: data.businessLogo || '',
        banner: data.businessBanner || '',
        selfie: data.selfieImage || '',

        // Status - use top-level status, convert to lowercase
        status: (apiData.status || data.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',

        // New fields
        featured: data.featured === true || data.featured === 'true' || apiData.featured === true || apiData.featured === 'true',
        rating: parseFloat(data.rating || apiData.rating) || 0,

        // Sales person info
        salesPersonId: data.assignedSalesPersonId || data.userId || '',
        salesPersonUserId: data.assignedSalesPersonUserId || data.uid || '',

        // Timestamps
        createdAt: apiData.createdAt || data.createdAt ||
            (data.timestamp?._seconds ? new Date(data.timestamp._seconds * 1000).toISOString() : new Date().toISOString()),
        updatedAt: apiData.updatedAt || data.updatedAt ||
            (data.timestamp?._seconds ? new Date(data.timestamp._seconds * 1000).toISOString() : new Date().toISOString()),
    };
}

/**
 * Transform array of API businesses
 */
export function transformBusinessArray(apiDataArray: any[]): Business[] {
    if (!Array.isArray(apiDataArray)) {
        console.warn('transformBusinessArray: Input is not an array', apiDataArray);
        return [];
    }

    return apiDataArray.map(transformBusinessData);
}
