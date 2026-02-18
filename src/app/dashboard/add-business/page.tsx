'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './AddBusiness.module.css';
import { createBusiness, getUserBusinesses, getCategories, getServices } from '@/lib/api';
import Image from 'next/image';
import LocationPicker from '@/components/LocationPicker';

interface FileWithPreview {
    file: File;
    preview: string;
}

const SearchableDropdown = ({
    items,
    value,
    onChange,
    placeholder,
    label,
    className,
    isMulti = false,
    selectedItems = []
}: {
    items: { _id: string, name: string }[],
    value?: string,
    onChange: (val: string) => void,
    placeholder: string,
    label: string,
    className?: string,
    isMulti?: boolean,
    selectedItems?: string[]
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredItems = items.filter(item =>
        item && item.name && item.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (name: string) => {
        onChange(name);
        if (!isMulti) {
            setIsOpen(false);
            setSearch('');
        }
    };

    return (
        <div className={`${styles.searchableDropdown} ${className || ''}`} ref={containerRef}>
            <label className={styles.label}>{label}</label>
            <div className={styles.dropdownToggle} onClick={() => setIsOpen(!isOpen)}>
                {isMulti ? (
                    <div className={styles.selectedTags}>
                        {selectedItems.length > 0 ? (
                            selectedItems.map(item => (
                                <span key={item} className={styles.tag}>
                                    {item}
                                    <button onClick={(e) => { e.stopPropagation(); onChange(item); }}>×</button>
                                </span>
                            ))
                        ) : (
                            <span className={styles.placeholder}>{placeholder}</span>
                        )}
                    </div>
                ) : (
                    <span className={value ? '' : styles.placeholder}>{value || placeholder}</span>
                )}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownSearch}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className={styles.dropdownList}>
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <div
                                    key={item._id}
                                    className={`${styles.dropdownItem} ${isMulti ? (selectedItems.includes(item.name) ? styles.selectedItem : '') : (value === item.name ? styles.selectedItem : '')}`}
                                    onClick={() => handleSelect(item.name)}
                                >
                                    {item.name}
                                    {isMulti && selectedItems.includes(item.name) && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AddBusiness() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
    const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasPendingBusiness, setHasPendingBusiness] = useState(false);

    // Years for dropdown (1950 to current)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };

        const fetchServices = async () => {
            try {
                const svcs = await getServices();
                setServices(svcs);
            } catch (err) {
                console.error("Failed to fetch services:", err);
            }
        };

        const checkExistingBusiness = async () => {
            const userId = user?.id || (user as any)?._id;
            if (userId) {
                try {
                    console.log(`🔍 [DEBUG] Checking existing businesses for userId: ${userId}`);
                    const businesses = await getUserBusinesses(userId);
                    console.log(`🔍 [DEBUG] API returned ${businesses.length} businesses:`, businesses.map(b => ({ id: b._id, status: b.status })));

                    const pending = businesses.some(b => {
                        const s = (b.status || '').toLowerCase().trim();
                        return s === 'pending';
                    });

                    console.log(`🔍 [DEBUG] Found pending application: ${pending}`);
                    setHasPendingBusiness(pending);
                } catch (err) {
                    console.error("Failed to check existing businesses:", err);
                }
            }
            setInitialLoading(false);
        };

        fetchCategories();
        fetchServices();
        checkExistingBusiness();
    }, [user]);

    const [formData, setFormData] = useState({
        // Step 1
        ownerName: user?.name || '',
        businessName: '',
        address: '',
        streetAddresses: [] as string[],
        businessCategory: '',
        noOfEmployee: '',
        establishedIn: '',
        pincode: '',
        city: '',
        state: '',

        // Step 2
        whatsappCountryCode: '+91',
        whatsapp: user?.phone || '',
        hasInstagram: false,
        instagramLink: '',
        hasTwitter: false,
        twitterLink: '',
        hasFacebook: false,
        facebookLink: '',
        hasWebsite: false,
        websiteLink: [] as string[],
        hasGst: false,
        hasDoc: false,
        latitude: null as number | null,
        longitude: null as number | null,
        displayAddress: '',
    });

    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Pincode Lookup Effect
    useEffect(() => {
        if (formData.pincode.length === 6) {
            const lookupPincode = async () => {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = await response.json();
                    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
                        const { District, State } = data[0].PostOffice[0];
                        setFormData(prev => ({
                            ...prev,
                            city: District,
                            state: State
                        }));
                    }
                } catch (err) {
                    console.error("Pincode lookup failed:", err);
                }
            };
            lookupPincode();
        }
    }, [formData.pincode]);

    // Step 3 & Files
    const [files, setFiles] = useState<{
        banner: FileWithPreview | null;
        logo: FileWithPreview | null;
        images: FileWithPreview[];
        selfie: FileWithPreview | null;
        gstDoc: FileWithPreview | null;
        businessDoc: FileWithPreview | null;
    }>({
        banner: null,
        logo: null,
        images: [],
        selfie: null,
        gstDoc: null,
        businessDoc: null,
    });

    const [products, setProducts] = useState<string[]>([]);
    const [description, setDescription] = useState('');

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraKey, setCameraKey] = useState<keyof typeof files | null>(null);
    const [cameraFacing, setCameraFacing] = useState<string>('environment');

    const openCamera = (key: keyof typeof files, facing: string = 'environment') => {
        setCameraKey(key);
        setCameraFacing(facing);
        setIsCameraOpen(true);
    };

    const handleCameraCapture = (file: File) => {
        if (cameraKey) {
            const preview = URL.createObjectURL(file);
            if (cameraKey === 'images') {
                setFiles(prev => ({ ...prev, images: [...prev.images, { file, preview }] }));
            } else {
                setFiles(prev => ({ ...prev, [cameraKey]: { file, preview } }));
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: string, value: boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Dynamic Fields: Addresses
    const addAddressField = () => {
        setFormData(prev => ({ ...prev, streetAddresses: [...prev.streetAddresses, ''] }));
    };

    const handleAddressChange = (index: number, value: string) => {
        const newAddresses = [...formData.streetAddresses];
        newAddresses[index] = value;
        setFormData(prev => ({ ...prev, streetAddresses: newAddresses }));
    };

    // Dynamic Fields: Website Links
    const addWebsiteField = () => {
        setFormData(prev => ({ ...prev, websiteLink: [...prev.websiteLink, ''] }));
    };

    const handleWebsiteChange = (index: number, value: string) => {
        const newLinks = [...formData.websiteLink];
        newLinks[index] = value;
        setFormData(prev => ({ ...prev, websiteLink: newLinks }));
    };

    const calculateProgress = () => {
        const fields = [
            formData.businessName,
            formData.businessCategory,
            formData.address,
            formData.pincode,
            formData.city,
            formData.state,
            formData.whatsapp,
            files.banner,
            files.logo,
            description,
            formData.latitude
        ];
        const completed = fields.filter(f => f !== null && f !== '' && (Array.isArray(f) ? f.length > 0 : true)).length;
        return Math.round((completed / fields.length) * 100);
    };

    const validateStep = (currentStep: number) => {
        setValidationError(null);
        if (currentStep === 1) {
            if (!formData.businessName || !formData.businessCategory || !formData.address || !formData.pincode || !formData.city || !formData.state) {
                setValidationError('Please fill all required fields in Step 1');
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.whatsapp) {
                setValidationError('WhatsApp number is required');
                return false;
            }
            if (formData.hasGst && !files.gstDoc) {
                setValidationError('Please upload GST Certificate');
                return false;
            }
            if (formData.hasDoc && !files.businessDoc) {
                setValidationError('Please upload Business Document');
                return false;
            }
        } else if (currentStep === 3) {
            if (!files.banner || !files.logo || !description) {
                setValidationError('Banner, Logo and Description are required');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        }
    };

    const removeProduct = (tag: string) => {
        setProducts(products.filter(p => p !== tag));
    };

    // File Handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);
            setFiles(prev => ({ ...prev, [key]: { file, preview } }));
        }
    };

    const handleMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setFiles(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
        }
    };

    const removeFile = (key: keyof typeof files, index?: number) => {
        setFiles(prev => {
            if (key === 'images' && typeof index === 'number') {
                const newImages = [...prev.images];
                URL.revokeObjectURL(newImages[index].preview);
                newImages.splice(index, 1);
                return { ...prev, images: newImages };
            } else {
                const fileObj = prev[key] as FileWithPreview | null;
                if (fileObj) URL.revokeObjectURL(fileObj.preview);
                return { ...prev, [key]: null };
            }
        });
    };

    const handleSubmit = async () => {
        if (!formData.latitude || !formData.longitude) {
            setValidationError('Please pick your business location on the map');
            return;
        }
        setLoading(true);
        try {
            const userId = user?.id || (user as any)?._id;
            const submitData = new FormData();

            // Step 1 & 2 basic fields
            submitData.append('ownerName', formData.ownerName);
            submitData.append('businessName', formData.businessName);
            submitData.append('address', formData.address);
            submitData.append('businessCategory', formData.businessCategory);
            submitData.append('noOfEmployee', String(formData.noOfEmployee));
            submitData.append('establishedIn', String(formData.establishedIn));
            submitData.append('pincode', formData.pincode);
            submitData.append('city', formData.city);
            submitData.append('state', formData.state);
            submitData.append('whatsapp', `${formData.whatsappCountryCode}${formData.whatsapp}`);

            // Street addresses - include primary address first
            if (formData.address.trim()) {
                submitData.append('streetAddresses', formData.address.trim());
            }
            formData.streetAddresses.forEach(addr => {
                if (addr.trim()) submitData.append('streetAddresses', addr.trim());
            });

            // Social
            submitData.append('instagram', formData.hasInstagram ? 'YES' : 'NO');
            if (formData.hasInstagram) submitData.append('instagramLink', formData.instagramLink);

            submitData.append('twitter', formData.hasTwitter ? 'YES' : 'NO');
            if (formData.hasTwitter) submitData.append('twitterLink', formData.twitterLink);

            submitData.append('facebook', formData.hasFacebook ? 'YES' : 'NO');
            if (formData.hasFacebook) submitData.append('facebookLink', formData.facebookLink);

            submitData.append('website', formData.hasWebsite ? 'YES' : 'NO');
            formData.websiteLink.forEach(link => {
                if (link.trim()) submitData.append('websiteLink', link);
            });

            // Documents Toggles
            submitData.append('gstDocToggle', formData.hasGst ? 'YES' : 'NO');
            submitData.append('businessDocToggle', formData.hasDoc ? 'YES' : 'NO');

            // Files
            if (files.banner) submitData.append('banner', files.banner.file);
            if (files.logo) submitData.append('logo', files.logo.file);
            if (files.selfie) submitData.append('selfie', files.selfie.file);
            if (files.gstDoc && formData.hasGst) submitData.append('gstDoc', files.gstDoc.file);
            if (files.businessDoc && formData.hasDoc) submitData.append('businessDoc', files.businessDoc.file);

            files.images.forEach(img => {
                submitData.append('images', img.file);
            });

            // Step 3 content
            submitData.append('products', JSON.stringify(products));
            submitData.append('description', description);

            // Step 4 Coordinates
            if (formData.latitude) submitData.append('latitude', formData.latitude.toString());
            if (formData.longitude) submitData.append('longitude', formData.longitude.toString());

            if (userId) submitData.append('userId', userId);
            const success = await createBusiness(submitData);

            if (success) {
                setIsSuccess(true);
                // No automatic redirect, let user see success message
            } else {
                alert("Failed to submit business. Data was incomplete or server error.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("An error occurred during submission. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const progressValue = step === 1 ? 33 : step === 2 ? 67 : 100;

    return (
        <div className={styles.pageContainer}>
            <div className="container">
                <div className={styles.breadcrumb}>
                    <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className={styles.formCard}>
                    {/* Progress Bar */}
                    <div className={styles.progressContainer}>
                        <div className={styles.progressHeader}>
                            <div className={styles.progressText}>Form Completion: {calculateProgress()}%</div>
                        </div>
                        <div className={styles.progressWrapper}>
                            <div className={styles.progressBar} style={{ width: `${calculateProgress()}%` }}></div>
                        </div>
                        <div className={styles.stepLabels}>
                            <span className={`${styles.stepLabel} ${step >= 1 ? styles.activeLabel : ''}`}>Basic</span>
                            <span className={`${styles.stepLabel} ${step >= 2 ? styles.activeLabel : ''}`}>Contact</span>
                            <span className={`${styles.stepLabel} ${step >= 3 ? styles.activeLabel : ''}`}>Media</span>
                            <span className={`${styles.stepLabel} ${step >= 4 ? styles.activeLabel : ''}`}>Location</span>
                        </div>
                    </div>

                    {validationError && (
                        <div className={styles.errorBanner}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {validationError}
                        </div>
                    )}

                    <h1 className={styles.formTitle}>Add Business</h1>
                    {/* SUCCESS VIEW */}
                    {isSuccess && (
                        <div className={styles.statusContainer}>
                            <div className={styles.statusIcon}>🎉</div>
                            <h2 className={styles.statusTitle}>Submission Successful!</h2>
                            <p className={styles.statusText}>
                                Your business application has been submitted successfully and is now under review.
                                We will notify you once it's approved.
                            </p>
                            <button onClick={() => router.push('/dashboard')} className={styles.statusActionBtn}>
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                    {/* PENDING VIEW (ALREADY UNDER REVIEW) */}
                    {!isSuccess && hasPendingBusiness && (
                        <div className={styles.statusContainer}>
                            <div className={styles.statusIcon}>⏳</div>
                            <h2 className={styles.statusTitle}>Application Under Review</h2>
                            <p className={styles.statusText}>
                                You already have a business application in our queue.
                                Our team is currently reviewing it. Thank you for your patience!
                            </p>
                            <button onClick={() => router.push('/dashboard')} className={styles.statusActionBtn}>
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                    {/* FORM VIEW */}
                    {!isSuccess && !hasPendingBusiness && initialLoading && (
                        <div className={styles.statusContainer}>
                            <p className={styles.statusText}>Checking application status...</p>
                        </div>
                    )}

                    {!isSuccess && !hasPendingBusiness && !initialLoading && (
                        <>
                            <p className={styles.formSubtitle}>Step {step} of 4</p>

                            {/* STEP 1: BASIC DETAILS */}
                            {step === 1 && (
                                <div className={styles.form}>
                                    <div className={styles.sectionHeader}>Business Basic Details</div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Owner Full Name</label>
                                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Enter your full name" className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Business Name</label>
                                            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Enter business name" className={styles.input} />
                                        </div>
                                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                            <label className={styles.label}>Business Address</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter street address" className={styles.input} />
                                            {formData.streetAddresses.map((addr, idx) => (
                                                <input key={idx} type="text" value={addr} onChange={(e) => handleAddressChange(idx, e.target.value)} placeholder="Add another address" className={styles.input} style={{ marginTop: '8px' }} />
                                            ))}
                                            <button onClick={addAddressField} className={styles.addMoreBtn}>+ Add another street address</button>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <SearchableDropdown
                                                label="Business Category"
                                                items={categories.length > 0 ? categories : [
                                                    { _id: '1', name: 'Retail' },
                                                    { _id: '2', name: 'Food & Beverage' },
                                                    { _id: '3', name: 'Health & Fitness' },
                                                    { _id: '4', name: 'Services' },
                                                    { _id: '5', name: 'Education' },
                                                    { _id: '6', name: 'Technology' }
                                                ]}
                                                value={formData.businessCategory}
                                                onChange={(val) => setFormData(prev => ({ ...prev, businessCategory: val }))}
                                                placeholder="Select Category"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>No. Of Employee</label>
                                            <input type="number" name="noOfEmployee" value={formData.noOfEmployee} onChange={handleChange} placeholder="e.g. 10" className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Business established in</label>
                                            <select name="establishedIn" value={formData.establishedIn} onChange={handleChange} className={styles.select}>
                                                <option value="">Select Year</option>
                                                {years.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>PinCode</label>
                                            <input type="number" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6 digits" className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>City</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Auto-filled from pincode" className={styles.input} readOnly style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>State</label>
                                            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="Auto-filled from pincode" className={styles.input} readOnly style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                                        </div>
                                    </div>

                                    <div className={styles.buttonGroup}>
                                        <button onClick={() => setStep(1)} className={styles.prevBtn}>Back</button>
                                        <button onClick={handleNext} className={styles.nextBtn}>Next</button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CONTACT, SOCIAL & DOCUMENTS */}
                            {step === 2 && (
                                <div className={styles.form}>
                                    <div className={styles.sectionHeader}>Contact, Social & Documents</div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Business WhatsApp Number</label>
                                        <div className={styles.whatsappRow}>
                                            <select name="whatsappCountryCode" value={formData.whatsappCountryCode} onChange={handleChange} className={`${styles.select} ${styles.countryCode}`}>
                                                <option value="+91">+91</option>
                                                <option value="+1">+1</option>
                                                <option value="+44">+44</option>
                                                <option value="+971">+971</option>
                                            </select>
                                            <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Enter number" className={styles.input} style={{ flex: 1 }} />
                                        </div>
                                    </div>

                                    {/* Instagram */}
                                    <div className={styles.toggleContainer}>
                                        <div className={styles.toggleLabel}>Is there a Business Instagram Profile?</div>
                                        <div className={styles.toggleGroup}>
                                            <button onClick={() => handleToggle('hasInstagram', true)} className={`${styles.toggleBtn} ${formData.hasInstagram ? styles.activeToggle : ''}`}>YES</button>
                                            <button onClick={() => handleToggle('hasInstagram', false)} className={`${styles.toggleBtn} ${!formData.hasInstagram ? styles.activeToggle : ''}`}>NO</button>
                                        </div>
                                    </div>
                                    {formData.hasInstagram && (
                                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                                            <input type="text" name="instagramLink" value={formData.instagramLink} onChange={handleChange} placeholder="Enter Instagram Profile Link" className={styles.input} />
                                        </div>
                                    )}

                                    {/* Twitter */}
                                    <div className={styles.toggleContainer}>
                                        <div className={styles.toggleLabel}>Is there a Business Twitter Account?</div>
                                        <div className={styles.toggleGroup}>
                                            <button onClick={() => handleToggle('hasTwitter', true)} className={`${styles.toggleBtn} ${formData.hasTwitter ? styles.activeToggle : ''}`}>YES</button>
                                            <button onClick={() => handleToggle('hasTwitter', false)} className={`${styles.toggleBtn} ${!formData.hasTwitter ? styles.activeToggle : ''}`}>NO</button>
                                        </div>
                                    </div>
                                    {formData.hasTwitter && (
                                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                                            <input type="text" name="twitterLink" value={formData.twitterLink} onChange={handleChange} placeholder="Enter Twitter Account Link" className={styles.input} />
                                        </div>
                                    )}

                                    {/* Facebook */}
                                    <div className={styles.toggleContainer}>
                                        <div className={styles.toggleLabel}>Is there a Business Facebook Profile?</div>
                                        <div className={styles.toggleGroup}>
                                            <button onClick={() => handleToggle('hasFacebook', true)} className={`${styles.toggleBtn} ${formData.hasFacebook ? styles.activeToggle : ''}`}>YES</button>
                                            <button onClick={() => handleToggle('hasFacebook', false)} className={`${styles.toggleBtn} ${!formData.hasFacebook ? styles.activeToggle : ''}`}>NO</button>
                                        </div>
                                    </div>
                                    {formData.hasFacebook && (
                                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                                            <input type="text" name="facebookLink" value={formData.facebookLink} onChange={handleChange} placeholder="Enter Facebook Profile Link" className={styles.input} />
                                        </div>
                                    )}

                                    {/* Website */}
                                    <div className={styles.toggleContainer}>
                                        <div className={styles.toggleLabel}>Is there a Website for the Business?</div>
                                        <div className={styles.toggleGroup}>
                                            <button onClick={() => handleToggle('hasWebsite', true)} className={`${styles.toggleBtn} ${formData.hasWebsite ? styles.activeToggle : ''}`}>YES</button>
                                            <button onClick={() => handleToggle('hasWebsite', false)} className={`${styles.toggleBtn} ${!formData.hasWebsite ? styles.activeToggle : ''}`}>NO</button>
                                        </div>
                                    </div>
                                    {formData.hasWebsite && (
                                        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                                            <input type="text" value={formData.websiteLink[0] || ''} onChange={(e) => handleWebsiteChange(0, e.target.value)} placeholder="Enter Website Link" className={styles.input} />
                                            {formData.websiteLink.slice(1).map((link, idx) => (
                                                <input key={idx + 1} type="text" value={link} onChange={(e) => handleWebsiteChange(idx + 1, e.target.value)} placeholder="Add another website link" className={styles.input} style={{ marginTop: '8px' }} />
                                            ))}
                                            <button onClick={addWebsiteField} className={styles.addMoreBtn}>+ Add another website</button>
                                        </div>
                                    )}

                                    {/* GST Certificate */}
                                    <div className={styles.toggleContainer}>
                                        <div className={styles.toggleLabel}>Upload GST Certificate</div>
                                        <div className={styles.toggleGroup}>
                                            <button onClick={() => handleToggle('hasGst', true)} className={`${styles.toggleBtn} ${formData.hasGst ? styles.activeToggle : ''}`}>YES</button>
                                            <button onClick={() => handleToggle('hasGst', false)} className={`${styles.toggleBtn} ${!formData.hasGst ? styles.activeToggle : ''}`}>NO</button>
                                        </div>
                                    </div>
                                    {formData.hasGst && (
                                        <div className={styles.uploadBox}>
                                            {files.gstDoc ? (
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <p className={styles.uploadText}>{files.gstDoc.file.name}</p>
                                                    <button onClick={(e) => { e.stopPropagation(); removeFile('gstDoc'); }} style={{ color: 'red', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                                </div>
                                            ) : (
                                                <div className={styles.uploadOptions}>
                                                    <div className={styles.uploadIcon}>📄</div>
                                                    <button onClick={() => document.getElementById('gst-upload')?.click()} className={styles.optionBtn}>📁 Upload GST</button>
                                                    <button onClick={() => openCamera('gstDoc')} className={styles.optionBtn}>📸 Take Photo</button>
                                                </div>
                                            )}
                                            <input id="gst-upload" type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'gstDoc')} accept="image/*,application/pdf" capture="environment" />
                                        </div>
                                    )}

                                    {/* Business Document */}
                                    <div className={styles.toggleContainer}>
                                        <div className={styles.toggleLabel}>Upload Business Document</div>
                                        <div className={styles.toggleGroup}>
                                            <button onClick={() => handleToggle('hasDoc', true)} className={`${styles.toggleBtn} ${formData.hasDoc ? styles.activeToggle : ''}`}>YES</button>
                                            <button onClick={() => handleToggle('hasDoc', false)} className={`${styles.toggleBtn} ${!formData.hasDoc ? styles.activeToggle : ''}`}>NO</button>
                                        </div>
                                    </div>
                                    {formData.hasDoc && (
                                        <div className={styles.uploadBox}>
                                            {files.businessDoc ? (
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <p className={styles.uploadText}>{files.businessDoc.file.name}</p>
                                                    <button onClick={(e) => { e.stopPropagation(); removeFile('businessDoc'); }} style={{ color: 'red', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                                </div>
                                            ) : (
                                                <div className={styles.uploadOptions}>
                                                    <div className={styles.uploadIcon}>📄</div>
                                                    <button onClick={() => document.getElementById('doc-upload')?.click()} className={styles.optionBtn}>📁 Upload Doc</button>
                                                    <button onClick={() => openCamera('businessDoc')} className={styles.optionBtn}>📸 Take Photo</button>
                                                </div>
                                            )}
                                            <input id="doc-upload" type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'businessDoc')} accept="image/*,application/pdf" capture="environment" />
                                        </div>
                                    )}

                                    <div className={styles.buttonGroup}>
                                        <button onClick={() => setStep(1)} className={styles.prevBtn}>Back</button>
                                        <button onClick={handleNext} className={styles.nextBtn}>Next</button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: MEDIA, PRODUCTS & DESCRIPTION */}
                            {step === 3 && (
                                <div className={styles.form}>
                                    <div className={styles.sectionHeader}>Media, Products & Description</div>

                                    <div className={styles.uploadGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Upload Business Banner</label>
                                            <div className={styles.uploadBox}>
                                                {files.banner ? (
                                                    <div style={{ position: 'relative', width: '100%' }}>
                                                        <img src={files.banner.preview} className={styles.uploadPreview} alt="Banner" />
                                                        <button onClick={(e) => { e.stopPropagation(); removeFile('banner'); }} style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20 }}>×</button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.uploadOptions}>
                                                        <span className={styles.uploadIcon}>🖼️</span>
                                                        <button onClick={() => document.getElementById('banner-upload')?.click()} className={styles.optionBtn}>📁 Upload</button>
                                                        <button onClick={() => openCamera('banner')} className={styles.optionBtn}>📸 Camera</button>
                                                    </div>
                                                )}
                                                <input id="banner-upload" type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'banner')} accept="image/*" capture="environment" />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Upload Business Logo</label>
                                            <div className={styles.uploadBox}>
                                                {files.logo ? (
                                                    <div style={{ position: 'relative', width: '100%' }}>
                                                        <img src={files.logo.preview} className={styles.uploadPreview} alt="Logo" />
                                                        <button onClick={(e) => { e.stopPropagation(); removeFile('logo'); }} style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20 }}>×</button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.uploadOptions}>
                                                        <span className={styles.uploadIcon}>🎯</span>
                                                        <button onClick={() => document.getElementById('logo-upload')?.click()} className={styles.optionBtn}>📁 Upload</button>
                                                        <button onClick={() => openCamera('logo')} className={styles.optionBtn}>📸 Camera</button>
                                                    </div>
                                                )}
                                                <input id="logo-upload" type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" capture="environment" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                                        <label className={styles.label}>Upload Business Images (Multiple)</label>
                                        <div className={styles.uploadBox}>
                                            <span className={styles.uploadIcon}>📸</span>
                                            <div className={styles.uploadOptions} style={{ flexDirection: 'row', gap: '12px' }}>
                                                <button onClick={() => document.getElementById('images-upload')?.click()} className={styles.optionBtn}>📁 Multi-Upload</button>
                                                <button onClick={() => openCamera('images')} className={styles.optionBtn}>📸 Take Photo</button>
                                            </div>
                                            <input id="images-upload" type="file" multiple style={{ display: 'none' }} onChange={handleMultipleUpload} accept="image/*" capture="environment" />
                                        </div>
                                        <div className={styles.uploadGrid} style={{ marginTop: '12px' }}>
                                            {files.images.map((img, idx) => (
                                                <div key={idx} style={{ position: 'relative' }}>
                                                    <img src={img.preview} className={styles.uploadPreview} alt={`Preview ${idx}`} />
                                                    <button onClick={() => removeFile('images', idx)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none' }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                                        <label className={styles.label}>Upload Selfie</label>
                                        <div className={styles.uploadBox}>
                                            {files.selfie ? (
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <img src={files.selfie.preview} className={styles.uploadPreview} alt="Selfie" />
                                                    <button onClick={(e) => { e.stopPropagation(); removeFile('selfie'); }} style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20 }}>×</button>
                                                </div>
                                            ) : (
                                                <div className={styles.uploadOptions}>
                                                    <span className={styles.uploadIcon}>🤳</span>
                                                    <button onClick={() => document.getElementById('selfie-upload')?.click()} className={styles.optionBtn}>📁 Upload Selfie</button>
                                                    <button onClick={() => openCamera('selfie', 'user')} className={styles.optionBtn}>📸 Take Selfie</button>
                                                </div>
                                            )}
                                            <input id="selfie-upload" type="file" capture="user" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'selfie')} accept="image/*" />
                                        </div>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <SearchableDropdown
                                            label="Products Offered"
                                            items={services}
                                            isMulti={true}
                                            selectedItems={products}
                                            onChange={(val) => {
                                                if (products.includes(val)) {
                                                    setProducts(products.filter(p => p !== val));
                                                } else {
                                                    setProducts([...products, val]);
                                                }
                                            }}
                                            placeholder="Select products or services"
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Business Description</label>
                                        <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us more about your business..." className={styles.textarea}></textarea>
                                    </div>

                                    <div className={styles.buttonGroup}>
                                        <button onClick={() => setStep(2)} className={styles.prevBtn}>Back</button>
                                        <button onClick={handleNext} disabled={loading} className={styles.nextBtn}>Next</button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: LOCATION PICKER */}
                            {step === 4 && (
                                <div className={styles.form}>
                                    <div className={styles.sectionHeader}>Business Location on Map</div>
                                    <p className={styles.stepInstruction}>
                                        Please pin your exact business location on the map. This helps customers find you easily.
                                    </p>

                                    <div className={styles.locationSummary}>
                                        {formData.latitude ? (
                                            <div className={styles.locationSelected}>
                                                <div className={styles.locationInfo}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#059669" stroke="#059669" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                    <div className={styles.locationDetails}>
                                                        <span className={styles.coords}>Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude?.toFixed(4)}</span>
                                                        {formData.displayAddress && <span className={styles.addressText}>{formData.displayAddress}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.locationPending}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                                <span>Location not set yet</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setIsLocationPickerOpen(true)}
                                            className={styles.openMapBtn}
                                        >
                                            {formData.latitude ? 'Change Location' : 'Open Map to Pick Location'}
                                        </button>
                                    </div>

                                    <div className={styles.buttonGroup}>
                                        <button onClick={() => setStep(3)} className={styles.prevBtn}>Back</button>
                                        <button onClick={handleSubmit} disabled={loading} className={styles.submitBtn}>
                                            {loading ? 'Submitting...' : 'Submit Business'}
                                        </button>
                                    </div>

                                    <LocationPicker
                                        isOpen={isLocationPickerOpen}
                                        onClose={() => setIsLocationPickerOpen(false)}
                                        onConfirm={(lat, lng, addr) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: lat,
                                                longitude: lng,
                                                displayAddress: addr
                                            }));
                                            setIsLocationPickerOpen(false);
                                            setValidationError(null);
                                        }}
                                        initialLocation={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCameraCapture}
                preferredFacingMode={cameraFacing}
            />
        </div>
    );
}

// Camera Modal Component
const CameraModal = ({ isOpen, onClose, onCapture, preferredFacingMode = 'environment' }: {
    isOpen: boolean,
    onClose: () => void,
    onCapture: (file: File) => void,
    preferredFacingMode?: string
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: preferredFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const capture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        onCapture(file);
                        onClose();
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.cameraModal} onClick={e => e.stopPropagation()}>
                <video ref={videoRef} autoPlay playsInline className={styles.cameraVideo} />
                <div className={styles.cameraControls}>
                    <button onClick={capture} className={styles.captureBtn}>Capture Photo</button>
                    <button onClick={onClose} className={styles.closeBtn}>Cancel</button>
                </div>
            </div>
        </div>
    );
};
