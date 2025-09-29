"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Bell, Shield, Lock, CreditCard, HelpCircle, Mail, Phone, Check, ChevronRight, Key, Trash2, MessageCircle, FileText, Info, Navigation, AlertCircle, Loader2 } from 'lucide-react';

interface UserProfileData {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    location: string;
    joinDate: string;
    isVerified: {
        email: boolean;
        phone: boolean;
        identity: boolean;
    };
    stats: {
        itemsListed: number;
        purchasesMade: number;
        sellerRating: number;
        totalReviews: number;
    };
    bio: string;
}

interface SettingsProps {
    userProfile?: UserProfileData;
}

interface LocationData {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface SettingsState {
    location: {
        homeAddress: string;
        searchRadius: number;
        autoLocation: boolean;
        showExactLocation: boolean;
        currentLocation?: LocationData;
    };
    notifications: {
        newMessages: boolean;
        priceDrops: boolean;
        newListings: boolean;
        orderUpdates: boolean;
        marketingEmails: boolean;
        pushNotifications: boolean;
    };
    privacy: {
        profileVisibility: 'public' | 'buyers' | 'private';
        showOnlineStatus: boolean;
        allowContactFromBuyers: boolean;
        showRatingsPublicly: boolean;
    };
    account: {
        twoFactorAuth: boolean;
        emailVerified: boolean;
        phoneVerified: boolean;
    };
}

// Mock user data - replace with actual API data
const mockUserProfile: UserProfileData = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "San Francisco, CA",
    joinDate: "2023-01-15",
    isVerified: {
        email: true,
        phone: false,
        identity: false
    },
    stats: {
        itemsListed: 24,
        purchasesMade: 12,
        sellerRating: 4.8,
        totalReviews: 156
    },
    bio: "Tech enthusiast and collector. Always looking for unique gadgets and vintage electronics."
};

const Settings: React.FC<SettingsProps> = ({ userProfile: propUserProfile }) => {
    const [userProfile] = useState<UserProfileData>(propUserProfile || mockUserProfile);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    
    const [settings, setSettings] = useState<SettingsState>({
        location: {
            homeAddress: userProfile.location || "Not set",
            searchRadius: 10,
            autoLocation: true,
            showExactLocation: false,
            currentLocation: undefined
        },
        notifications: {
            newMessages: true,
            priceDrops: true,
            newListings: false,
            orderUpdates: true,
            marketingEmails: false,
            pushNotifications: true
        },
        privacy: {
            profileVisibility: 'public',
            showOnlineStatus: true,
            allowContactFromBuyers: true,
            showRatingsPublicly: true
        },
        account: {
            twoFactorAuth: false,
            emailVerified: userProfile.isVerified.email,
            phoneVerified: userProfile.isVerified.phone
        }
    });

    const [activeSection, setActiveSection] = useState('location');

    // Auto-detect location function
    const detectCurrentLocation = async () => {
        setIsLoadingLocation(true);
        setLocationError(null);

        try {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            // Get current position
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
                );
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocoding to get address (using a mock implementation)
            // In real app, you'd use Google Maps API, Mapbox, or similar service
            const locationData = await reverseGeocode(latitude, longitude);
            
            setSettings(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    currentLocation: locationData,
                    homeAddress: locationData.address
                }
            }));

        } catch (error: any) {
            console.error('Location detection failed:', error);
            setLocationError(error.message || 'Failed to detect location');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Mock reverse geocoding function
    const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock location data based on coordinates
        // In real app, this would be an actual API call
        return {
            address: "1234 Market Street, San Francisco, CA 94102",
            city: "San Francisco",
            state: "California", 
            country: "United States",
            coordinates: { lat, lng }
        };
    };

    const handleSettingChange = (section: keyof SettingsState, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleProfileUpdate = async (field: string, value: string) => {
        // Mock API call to update user profile
        console.log(`Updating ${field} to:`, value);
        // In real app, make API call here:
        // await updateUserProfile({ [field]: value });
        alert(`${field} updated successfully!`);
    };

    const sections = [
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'account', label: 'Account Security', icon: Lock },
        { id: 'payment', label: 'Payment Methods', icon: CreditCard },
        { id: 'help', label: 'Help & Support', icon: HelpCircle }
    ];

    const renderLocationSettings = () => (
        <div className="space-y-6">
            {/* Current Location Detection */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <Navigation className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Current Location</h4>
                    </div>
                    <button
                        onClick={detectCurrentLocation}
                        disabled={isLoadingLocation}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                    >
                        {isLoadingLocation ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Detecting...</span>
                            </>
                        ) : (
                            <>
                                <Navigation className="w-3 h-3" />
                                <span>Detect Location</span>
                            </>
                        )}
                    </button>
                </div>
                
                {settings.location.currentLocation && (
                    <div className="text-sm text-blue-800">
                        <p><strong>Detected:</strong> {settings.location.currentLocation.address}</p>
                        <p className="text-xs mt-1">
                            Coordinates: {settings.location.currentLocation.coordinates.lat.toFixed(4)}, 
                            {settings.location.currentLocation.coordinates.lng.toFixed(4)}
                        </p>
                    </div>
                )}
                
                {locationError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{locationError}</span>
                    </div>
                )}
            </div>

            {/* Home Address */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Home Address
                </label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={settings.location.homeAddress}
                        onChange={(e) => handleSettingChange('location', 'homeAddress', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your home address"
                    />
                    <button 
                        onClick={() => handleProfileUpdate('location', settings.location.homeAddress)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Update
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    This helps us show you the most relevant nearby products
                </p>
            </div>

            {/* Search Radius */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Default Search Radius: {settings.location.searchRadius} miles
                </label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.location.searchRadius}
                    onChange={(e) => handleSettingChange('location', 'searchRadius', parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 mile</span>
                    <span>50 miles</span>
                </div>
            </div>

            {/* Location Toggles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Auto-detect Location</h4>
                        <p className="text-xs text-gray-500">
                            Automatically use your current location for searches
                        </p>
                    </div>
                    <button
                        onClick={() => handleSettingChange('location', 'autoLocation', !settings.location.autoLocation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.location.autoLocation ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.location.autoLocation ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Show Exact Location</h4>
                        <p className="text-xs text-gray-500">
                            Display your precise location to other users
                        </p>
                    </div>
                    <button
                        onClick={() => handleSettingChange('location', 'showExactLocation', !settings.location.showExactLocation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.location.showExactLocation ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.location.showExactLocation ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => {
                const labels: { [key: string]: { title: string; desc: string } } = {
                    newMessages: { title: 'New Messages', desc: 'When someone sends you a message' },
                    priceDrops: { title: 'Price Drops', desc: 'When items in your wishlist drop in price' },
                    newListings: { title: 'New Listings', desc: 'When new items match your saved searches' },
                    orderUpdates: { title: 'Order Updates', desc: 'Shipping and delivery notifications' },
                    marketingEmails: { title: 'Marketing Emails', desc: 'Promotional offers and updates' },
                    pushNotifications: { title: 'Push Notifications', desc: 'Browser notifications for important updates' }
                };

                return (
                    <div key={key} className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">
                                {labels[key].title}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {labels[key].desc}
                            </p>
                        </div>
                        <button
                            onClick={() => handleSettingChange('notifications', key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderAccountSettings = () => (
        <div className="space-y-6">
            {/* User Profile Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                    <img
                        src={userProfile.avatar}
                        alt={userProfile.name}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                        <h4 className="font-semibold text-gray-900">{userProfile.name}</h4>
                        <p className="text-sm text-gray-600">{userProfile.email}</p>
                        <p className="text-sm text-gray-600">{userProfile.phone}</p>
                        <p className="text-xs text-gray-500">Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userProfile.stats.itemsListed}</div>
                    <div className="text-sm text-blue-800">Items Listed</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{userProfile.stats.purchasesMade}</div>
                    <div className="text-sm text-green-800">Purchases Made</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{userProfile.stats.sellerRating}</div>
                    <div className="text-sm text-yellow-800">Seller Rating</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{userProfile.stats.totalReviews}</div>
                    <div className="text-sm text-purple-800">Total Reviews</div>
                </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
                            <p className="text-xs text-gray-500">{userProfile.email}</p>
                        </div>
                    </div>
                    {settings.account.emailVerified ? (
                        <div className="flex items-center space-x-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Verified</span>
                        </div>
                    ) : (
                        <button 
                            onClick={() => alert('Verification email sent!')}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Verify Now
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Phone Verification</h4>
                            <p className="text-xs text-gray-500">{userProfile.phone}</p>
                        </div>
                    </div>
                    {settings.account.phoneVerified ? (
                        <div className="flex items-center space-x-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Verified</span>
                        </div>
                    ) : (
                        <button 
                            onClick={() => alert('SMS verification sent!')}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Verify Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'location':
                return renderLocationSettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'account':
                return renderAccountSettings();
            default:
                return renderLocationSettings();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and privacy settings</p>
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden">
                <select
                    value={activeSection}
                    onChange={(e) => setActiveSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === section.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <Icon size={16} />
                                <span>{section.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {sections.find(s => s.id === activeSection)?.label}
                </h3>
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;