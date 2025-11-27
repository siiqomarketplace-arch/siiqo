"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon, { LucideIconName } from '@/components/ui/AppIcon';

interface Step {
    id: number;
    title: string;
    icon: LucideIconName;
}
import Image from '@/components/ui/AppImage';
import { listingService } from '@/services/listingService';

interface FormData {
    images: { id: number; file: File; url: string; isMain: boolean }[];
    title: string;
    description: string;
    category: string;
    condition: string;
    price: string;
    brand: string;
    model: string;
    dimensions: string;
    quantity: number;
    location: {
        address: string;
        coordinates: { lat: number; lng: number };
        pickupAvailable: boolean;
        deliveryAvailable: boolean;
    };
    availability: {
        immediate: boolean;
        duration: string;
        customEndDate: string;
    };
}

const CreateListing = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isDraft, setIsDraft] = useState<boolean>(false);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [locationPermission, setLocationPermission] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        images: [],
        title: '',
        description: '',
        category: '',
        condition: '',
        price: '',
        brand: '',
        model: '',
        dimensions: '',
        quantity: 1,
        location: {
            address: '',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            pickupAvailable: true,
            deliveryAvailable: false
        },
        availability: {
            immediate: true,
            duration: '30',
            customEndDate: ''
        }
    });

    const categories: string[] = [
        'Electronics', 'Clothing & Accessories', 'Home & Garden', 'Sports & Outdoors',
        'Books & Media', 'Automotive', 'Health & Beauty', 'Toys & Games',
        'Food & Beverages', 'Art & Collectibles', 'Tools & Equipment', 'Other'
    ];

    const conditions: string[] = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

    const steps: Step[] = [
        { id: 1, title: 'Photos', icon: 'Camera' },
        { id: 2, title: 'Details', icon: 'FileText' },
        { id: 3, title: 'Location', icon: 'MapPin' },
        { id: 4, title: 'Availability', icon: 'Clock' }
    ];

    // Auto-save functionality
    useEffect(() => {
        const saveTimer = setTimeout(() => {
            if (formData.title || formData.description || formData.images.length > 0) {
                localStorage.setItem('createListingDraft', JSON.stringify(formData));
                setIsDraft(true);
            }
        }, 2000);

        return () => clearTimeout(saveTimer);
    }, [formData]);

    // Load draft on component mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('createListingDraft');
        if (savedDraft) {
            setFormData(JSON.parse(savedDraft));
            setIsDraft(true);
        }
    }, []);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    type NestedFormObjectKeys = 'location' | 'availability';

    // Generic handler for updating nested state properties
    const handleNestedInputChange = <
        ParentKey extends NestedFormObjectKeys, // Constrain ParentKey to be 'location' or 'availability'
        FieldKey extends keyof FormData[ParentKey] // FieldKey must be a key of the specific nested object (e.g., 'address' if ParentKey is 'location')
    >(
        parent: ParentKey,
        field: FieldKey,
        value: FormData[ParentKey][FieldKey] // Value type must match the type of the target field
    ) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as FormData[ParentKey]), // Cast prev[parent] to ensure it's treated as the correct nested object type
                [field]: value
            }
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;

        const files = Array.from(event.target.files);
        const newImages = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            url: URL.createObjectURL(file),
            isMain: formData.images.length === 0
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages].slice(0, 10)
        }));
    };


    const removeImage = (imageId: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }));
    };

    const setMainImage = (imageId: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map(img => ({
                ...img,
                isMain: img.id === imageId
            }))
        }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            coordinates: { lat: latitude, lng: longitude },
                            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        }
                    }));
                    setLocationPermission('granted');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationPermission('denied');
                }
            );
        }
    };

    const getSuggestedPrice = () => {
        const categoryPrices: { [key: string]: number[] } = {
            'Electronics': [50, 500],
            'Clothing & Accessories': [10, 100],
            'Home & Garden': [20, 200],
            'Sports & Outdoors': [25, 300],
            'Books & Media': [5, 50],
            'Automotive': [100, 1000],
            'Health & Beauty': [15, 150],
            'Toys & Games': [10, 80],
            'Food & Beverages': [5, 30],
            'Art & Collectibles': [20, 500],
            'Tools & Equipment': [30, 400],
            'Other': [10, 100]
        };

        const range = categoryPrices[formData.category] || [10, 100];
        return `$${range[0]} - $${range[1]}`;
    };

    const validateForm = () => {
        const errors: string[] = [];
        if (formData.images.length === 0) errors.push('At least one photo is required');
        if (!formData.title.trim()) errors.push('Title is required');
        if (!formData.description.trim()) errors.push('Description is required');
        if (!formData.category) errors.push('Category is required');
        if (!formData.condition) errors.push('Condition is required');
        if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
        if (!formData.location.address.trim()) errors.push('Location is required');

        return errors;
    };

    const handlePublish = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return;
        }

        setIsPublishing(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'images') {
                (value as any[]).forEach(image => {
                    data.append('images', image.file);
                });
            } else {
                data.append(key, JSON.stringify(value));
            }
        });

        try {
            await listingService.createListing(data);
            localStorage.removeItem('createListingDraft');
            alert('Listing published successfully!');
            router.push('/');
        } catch (error) {
            console.error('Failed to publish listing:', error);
            alert('Failed to publish listing. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSaveDraft = () => {
        localStorage.setItem('createListingDraft', JSON.stringify(formData));
        setIsDraft(true);
        alert('Draft saved successfully!');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold text-text-primary">Add Photos</h3>
                            <p className="text-sm text-text-secondary">Add up to 10 photos. The first photo will be your main image.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {formData.images.map((image, index) => (
                                <div key={image.id} className="relative overflow-hidden rounded-lg aspect-square bg-surface-secondary">
                                    <Image
                                        src={image.url}
                                        alt={`Product ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                    {image.isMain && (
                                        <div className="absolute px-2 py-1 text-xs text-white rounded top-2 left-2 bg-primary">
                                            Main
                                        </div>
                                    )}
                                    <div className="absolute flex space-x-1 top-2 right-2">
                                        {!image.isMain && (
                                            <button
                                                onClick={() => setMainImage(image.id)}
                                                className="p-1 text-white bg-black bg-opacity-50 rounded"
                                                title="Set as main image"
                                            >
                                                <Icon name="Star" size={12} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeImage(image.id)}
                                            className="p-1 text-white bg-black bg-opacity-50 rounded"
                                        >
                                            <Icon name="X" size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {formData.images.length < 10 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center transition-colors duration-200 border-2 border-dashed rounded-lg aspect-square border-border-dark text-text-secondary hover:border-primary hover:text-primary"
                                >
                                    <Icon name="Plus" size={24} className="mb-2" />
                                    <span className="text-sm">Add Photo</span>
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        <div className="flex space-x-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center flex-1 py-3 space-x-2 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
                            >
                                <Icon name="Upload" size={18} />
                                <span>Upload from Gallery</span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center flex-1 py-3 space-x-2 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
                            >
                                <Icon name="Camera" size={18} />
                                <span>Take Photo</span>
                            </button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold text-text-primary">Product Details</h3>
                            <p className="text-sm text-text-secondary">Provide detailed information about your product.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="What are you selling?"
                                    className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    maxLength={100}
                                />
                                <div className="mt-1 text-xs text-text-secondary">
                                    {formData.title.length}/100 characters
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe your item's condition, features, and any other relevant details..."
                                    rows={4}
                                    className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg resize-none border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    maxLength={500}
                                />
                                <div className="mt-1 text-xs text-text-secondary">
                                    {formData.description.length}/500 characters
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-primary">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-primary">
                                        Condition *
                                    </label>
                                    <select
                                        value={formData.condition}
                                        onChange={(e) => handleInputChange('condition', e.target.value)}
                                        className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select condition</option>
                                        {conditions.map(condition => (
                                            <option key={condition} value={condition}>{condition}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Price * <span className="text-text-secondary">($)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-text-secondary">$</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full py-2 pl-8 pr-3 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                {formData.category && (
                                    <div className="mt-1 text-xs text-text-secondary">
                                        Suggested price range: {getSuggestedPrice()}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-primary">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => handleInputChange('brand', e.target.value)}
                                        placeholder="Brand name"
                                        className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-primary">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => handleInputChange('model', e.target.value)}
                                        placeholder="Model number/name"
                                        className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Dimensions
                                </label>
                                <input
                                    type="text"
                                    value={formData.dimensions}
                                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                                    placeholder="e.g., 12 x 8 x 4 inches"
                                    className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold text-text-primary">Location & Pickup</h3>
                            <p className="text-sm text-text-secondary">Set your location and delivery preferences.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Address *
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={formData.location.address}
                                        onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                                        placeholder="Enter your address"
                                        className="flex-1 px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={getCurrentLocation}
                                        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
                                    >
                                        <Icon name="MapPin" size={16} />
                                        <span className="hidden sm:inline">Current</span>
                                    </button>
                                </div>
                                {locationPermission === 'denied' && (
                                    <p className="mt-1 text-xs text-accent">Location access denied. Please enter address manually.</p>
                                )}
                            </div>

                            <div className="p-4 rounded-lg bg-surface-secondary">
                                <div className="flex items-center justify-center mb-4 rounded-lg aspect-video bg-border-light">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        loading="lazy"
                                        title="Product Location"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps?q=${formData.location.coordinates.lat},${formData.location.coordinates.lng}&z=14&output=embed`}
                                        className="rounded-lg"
                                    />
                                </div>
                                <p className="text-xs text-center text-text-secondary">
                                    Buyers will see the general area, not your exact address
                                </p>
                            </div>

                            <div>
                                <label className="block mb-3 text-sm font-medium text-text-primary">
                                    Delivery Options
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.location.pickupAvailable}
                                            onChange={(e) => handleNestedInputChange('location', 'pickupAvailable', e.target.checked)}
                                            className="w-4 h-4 rounded text-primary border-border focus:ring-primary-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-text-primary">Pickup Available</span>
                                            <p className="text-xs text-text-secondary">Buyers can pick up from your location</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.location.deliveryAvailable}
                                            onChange={(e) => handleNestedInputChange('location', 'deliveryAvailable', e.target.checked)}
                                            className="w-4 h-4 rounded text-primary border-border focus:ring-primary-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-text-primary">Delivery Available</span>
                                            <p className="text-xs text-text-secondary">You can deliver to buyers</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold text-text-primary">Availability</h3>
                            <p className="text-sm text-text-secondary">Set quantity and listing duration.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Quantity
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleInputChange('quantity', Math.max(1, formData.quantity - 1))}
                                        className="flex items-center justify-center w-10 h-10 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
                                    >
                                        <Icon name="Minus" size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => handleInputChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                        className="w-20 px-3 py-2 text-center transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => handleInputChange('quantity', formData.quantity + 1)}
                                        className="flex items-center justify-center w-10 h-10 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
                                    >
                                        <Icon name="Plus" size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-3 text-sm font-medium text-text-primary">
                                    Availability
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="availability"
                                            checked={formData.availability.immediate}
                                            onChange={() => handleNestedInputChange('availability', 'immediate', true)}
                                            className="w-4 h-4 text-primary border-border focus:ring-primary-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-text-primary">Available Now</span>
                                            <p className="text-xs text-text-secondary">Item is ready for immediate sale</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="availability"
                                            checked={!formData.availability.immediate}
                                            onChange={() => handleNestedInputChange('availability', 'immediate', false)}
                                            className="w-4 h-4 text-primary border-border focus:ring-primary-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-text-primary">Schedule for Later</span>
                                            <p className="text-xs text-text-secondary">Set a future date when item becomes available</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-text-primary">
                                    Listing Duration
                                </label>
                                <select
                                    value={formData.availability.duration}
                                    onChange={(e) => handleNestedInputChange('availability', 'duration', e.target.value)}
                                    className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                    <option value="30">30 days</option>
                                    <option value="60">60 days</option>
                                    <option value="90">90 days</option>
                                    <option value="custom">Custom date</option>
                                </select>
                            </div>

                            {formData.availability.duration === 'custom' && (
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-text-primary">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.availability.customEndDate}
                                        onChange={(e) => handleNestedInputChange('availability', 'customEndDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderPreview = () => (
        <div className="p-6 space-y-4 border rounded-lg bg-surface border-border">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Preview</h3>

            {formData.images.length > 0 && (
                <div className="relative overflow-hidden rounded-lg aspect-video bg-surface-secondary">
                    <Image
                        src={formData.images.find(img => img.isMain)?.url || formData.images[0]?.url}
                        alt="Product preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                    />
                </div>
            )}

            <div>
                <h4 className="font-semibold text-text-primary">{formData.title || 'Product Title'}</h4>
                <p className="mt-1 text-2xl font-bold text-primary">
                    {formData.price ? `$${formData.price}` : '$0.00'}
                </p>
            </div>

            {formData.description && (
                <p className="text-sm text-text-secondary">{formData.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
                {formData.category && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary">
                        {formData.category}
                    </span>
                )}
                {formData.condition && (
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary-50 text-secondary">
                        {formData.condition}
                    </span>
                )}
            </div>

            {formData.location.address && (
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="MapPin" size={14} />
                    <span>{formData.location.address}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 border-b bg-surface border-border">
                <div className="flex items-center justify-between h-16 px-4">
                    <button
                        onClick={() => router.back()} // Use router.back() instead of navigate(-1)
                        className="p-2 -ml-2 transition-colors duration-200 rounded-lg hover:bg-surface-secondary"
                    >
                        <Icon name="ArrowLeft" size={20} className="text-text-primary" />
                    </button>

                    <h1 className="text-lg font-semibold text-text-primary">Create Listing</h1>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSaveDraft}
                            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors duration-200"
                        >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${currentStep === step.id
                                        ? 'bg-primary text-white'
                                        : currentStep > step.id
                                            ? 'bg-secondary text-white' : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <Icon
                                        name={currentStep > step.id ? 'Check' : step.icon}
                                        size={16}
                                    />
                                    <span className="hidden text-sm font-medium sm:inline">{step.title}</span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-secondary' : 'bg-border'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="mx-auto max-w-7xl">
                    <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:px-6 lg:py-8">
                        {/* Form Content */}
                        <div className="lg:col-span-3">
                            <div className="p-6">
                                {isDraft && (
                                    <div className="p-3 mb-6 border rounded-lg bg-warning-50 border-warning-100">
                                        <div className="flex items-center space-x-2">
                                            <Icon name="Save" size={16} className="text-warning" />
                                            <span className="text-sm font-medium text-warning">Draft saved automatically</span>
                                        </div>
                                    </div>
                                )}

                                {renderStepContent()}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6 mt-8 border-t border-border">
                                    <button
                                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                        disabled={currentStep === 1}
                                        className="flex items-center px-4 py-2 space-x-2 transition-colors duration-200 border rounded-lg border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-secondary"
                                    >
                                        <Icon name="ChevronLeft" size={16} />
                                        <span>Previous</span>
                                    </button>

                                    <button
                                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                                        disabled={currentStep === 4}
                                        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 rounded-lg bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
                                    >
                                        <span>Next</span>
                                        <Icon name="ChevronRight" size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Sidebar - Desktop Only */}
                        <div className="hidden lg:block lg:col-span-2">
                            <div className="sticky p-6 top-32">
                                {renderPreview()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed z-40 lg:hidden bottom-20 right-4">
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center justify-center w-12 h-12 text-white transition-colors duration-200 rounded-full bg-primary shadow-elevation-2 hover:bg-primary-700"
                >
                    <Icon name="Eye" size={20} />
                </button>
            </div>

            {/* Mobile Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 lg:hidden">
                    <div className="w-full bg-surface rounded-t-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 transition-colors duration-200 rounded-lg hover:bg-surface-secondary"
                            >
                                <Icon name="X" size={20} className="text-text-primary" />
                            </button>
                        </div>
                        <div className="p-4">
                            {renderPreview()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateListing;
