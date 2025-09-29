'use client';

import React, { useState, useEffect } from 'react';
import Icon, { type LucideIconName } from '../AppIcon';
import Button from '@/components/ui/new/Button';

// --- START OF TYPESCRIPT CONVERSION ---

type ContextType = 'customer' | 'business';
type PermissionStatus = 'prompt' | 'granted' | 'denied';

interface LocationHeaderProps {
	context?: ContextType;
}

// --- END OF TYPESCRIPT CONVERSION ---

const LocationHeader: React.FC<LocationHeaderProps> = ({ context = 'customer' }) => {
	const [currentLocation, setCurrentLocation] = useState < string > ('Detecting location...');
	const [isLocationModalOpen, setIsLocationModalOpen] = useState < boolean > (false);
	const [locationPermission, setLocationPermission] = useState < PermissionStatus > ('prompt');
	const [isLoading, setIsLoading] = useState < boolean > (false);

	useEffect(() => {
		// Check for saved location in localStorage
		const savedLocation = localStorage.getItem('userLocation');
		if (savedLocation) {
			setCurrentLocation(savedLocation);
		} else {
			getCurrentLocation();
		}
	}, []);

	const getCurrentLocation = async (): Promise<void> => {
		setIsLoading(true);

		if (!navigator.geolocation) {
			setCurrentLocation('Location not supported');
			setIsLoading(false);
			return;
		}

		try {
			const position: GeolocationPosition = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 10000,
					enableHighAccuracy: true
				});
			});

			// Simulate reverse geocoding (in real app, use Google Maps API or similar)
			console.log('Lat:', position.coords.latitude, 'Lon:', position.coords.longitude);
			const mockLocation = 'Downtown, City Center';
			setCurrentLocation(mockLocation);
			localStorage.setItem('userLocation', mockLocation);
			setLocationPermission('granted');
		} catch (error) {
			setCurrentLocation('Location unavailable');
			setLocationPermission('denied');
		} finally {
			setIsLoading(false);
		}
	};

	const handleLocationChange = (): void => {
		setIsLocationModalOpen(true);
	};

	const handleLocationSelect = (location: string): void => {
		setCurrentLocation(location);
		localStorage.setItem('userLocation', location);
		setIsLocationModalOpen(false);
	};

	const predefinedLocations: string[] = [
		'Downtown, City Center',
		'Uptown District',
		'Riverside Area',
		'Tech Quarter',
		'Historic District',
		'Shopping District'
	];

	if (context === 'business') {
		return (
			<div className="flex items-center space-x-2 text-sm">
				<Icon name="MapPin" size={16} className="text-text-secondary" />
				<span className="text-text-secondary">Service Area:</span>
				<span className="font-medium text-text-primary">{currentLocation}</span>
				<Button
					variant="ghost"
					size="xs"
					onClick={handleLocationChange}
					iconName="Edit2"
					iconSize={14}
				>
					Change
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Customer Location Header */}
			<div className="bg-surface border-b border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-3">
						<div className="flex items-center space-x-2">
							<Icon
								name="MapPin"
								size={18}
								className={`${isLoading ? 'animate-pulse' : ''} text-primary`}
							/>
							<div className="flex flex-col">
								<span className="text-xs text-text-secondary">Delivering to</span>
								<span className="font-medium text-text-primary text-sm">
									{isLoading ? 'Detecting...' : currentLocation}
								</span>
							</div>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleLocationChange}
							iconName="ChevronDown"
							iconPosition="right"
							iconSize={16}
							disabled={isLoading}
						>
							Change
						</Button>
					</div>
				</div>
			</div>

			{/* Location Selection Modal */}
			{isLocationModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-modal max-w-md w-full max-h-96 overflow-hidden">
						<div className="flex items-center justify-between p-4 border-b border-border">
							<h3 className="text-lg font-semibold text-text-primary">
								Choose Location
							</h3>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsLocationModalOpen(false)}
								iconName="X"
								iconSize={20}
							/>
						</div>

						<div className="p-4">
							<Button
								variant="outline"
								fullWidth
								onClick={getCurrentLocation}
								loading={isLoading}
								iconName="Navigation"
								iconPosition="left"
								className="mb-4"
							>
								Use Current Location
							</Button>

							<div className="space-y-2">
								<h4 className="text-sm font-medium text-text-secondary mb-2">
									Popular Areas
								</h4>
								{predefinedLocations.map((location) => (
									<button
										key={location}
										onClick={() => handleLocationSelect(location)}
										className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors duration-150 text-text-primary"
									>
										<div className="flex items-center space-x-2">
											<Icon name="MapPin" size={16} className="text-text-secondary" />
											<span>{location}</span>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default LocationHeader;