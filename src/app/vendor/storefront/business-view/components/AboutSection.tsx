import React, { useState } from 'react';
import Icon, { type LucideIconName } from '@/components/AppIcon';
import Image from '@/components/ui/alt/AppImageAlt';
import Button from '@/components/ui/new/Button';

// --- START OF TYPESCRIPT CONVERSION ---

interface BusinessHours {
	day: string;
	hours: string;
	isToday: boolean;
}

interface GalleryImage {
	url: string;
	caption?: string;
}

interface TeamMember {
	name: string;
	role: string;
	photo: string;
}

interface Business {
	name: string;
	description: string;
	story?: string;
	established: number | string;
	teamSize: number | string;
	specialties: string[];
	hours: BusinessHours[];
	gallery?: GalleryImage[];
	team?: TeamMember[];
}

interface AboutSectionProps {
	business: Business;
}

// --- END OF TYPESCRIPT CONVERSION ---

const AboutSection: React.FC<AboutSectionProps> = ({ business }) => {
	const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

	const handleImageClick = (image: GalleryImage): void => {
		setSelectedImage(image);
	};

	const closeLightbox = (): void => {
		setSelectedImage(null);
	};

	return (
		<div className="space-y-8">
			{/* Business Description */}
			<div>
				<h2 className="text-xl font-semibold text-text-primary mb-4">About {business.name}</h2>
				<div className="prose prose-sm max-w-none">
					<p className="text-text-secondary leading-relaxed mb-4">
						{business.description}
					</p>
					{business.story && (
						<div>
							<h3 className="text-lg font-medium text-text-primary mb-2">Our Story</h3>
							<p className="text-text-secondary leading-relaxed">
								{business.story}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Business Details */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Key Information */}
				<div>
					<h3 className="text-lg font-medium text-text-primary mb-4">Business Information</h3>
					<div className="space-y-4">
						<div className="flex items-start space-x-3">
							<Icon name={'Calendar' as LucideIconName} size={20} className="text-primary mt-0.5" />
							<div>
								<p className="font-medium text-text-primary">Established</p>
								<p className="text-sm text-text-secondary">{business.established}</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<Icon name={'Users' as LucideIconName} size={20} className="text-primary mt-0.5" />
							<div>
								<p className="font-medium text-text-primary">Team Size</p>
								<p className="text-sm text-text-secondary">{business.teamSize} employees</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<Icon name={'Award' as LucideIconName} size={20} className="text-primary mt-0.5" />
							<div>
								<p className="font-medium text-text-primary">Specialties</p>
								<div className="flex flex-wrap gap-2 mt-1">
									{business.specialties.map((specialty, index) => (
										<span
											key={index}
											className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
										>
											{specialty}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Business Hours */}
				<div>
					<h3 className="text-lg font-medium text-text-primary mb-4">Business Hours</h3>
					<div className="space-y-2">
						{business.hours.map((day, index) => (
							<div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
								<span className="font-medium text-text-primary">{day.day}</span>
								<span className={`text-sm ${day.isToday ? 'text-primary font-medium' : 'text-text-secondary'}`}>
									{day.hours}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Image Gallery */}
			{business.gallery && business.gallery.length > 0 && (
				<div>
					<h3 className="text-lg font-medium text-text-primary mb-4">Gallery</h3>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
						{business.gallery.map((image, index) => (
							<div
								key={index}
								className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity duration-200"
								onClick={() => handleImageClick(image)}
							>
								<Image
									src={image.url}
									alt={image.caption || `Gallery image ${index + 1}`}
									className="w-full h-full object-cover"
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Team Section */}
			{business.team && business.team.length > 0 && (
				<div>
					<h3 className="text-lg font-medium text-text-primary mb-4">Meet Our Team</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{business.team.map((member, index) => (
							<div key={index} className="text-center">
								<div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
									<Image
										src={member.photo}
										alt={member.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<h4 className="font-medium text-text-primary">{member.name}</h4>
								<p className="text-sm text-text-secondary">{member.role}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Lightbox Modal */}
			{selectedImage && (
				<div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
					<div className="relative max-w-4xl max-h-full">
						<Button
							variant="ghost"
							size="icon"
							onClick={closeLightbox}
							className="absolute -top-12 right-0 text-white hover:bg-white hover:bg-opacity-20"
						>
							<Icon name={'X' as LucideIconName} size={24} />
						</Button>
						<Image
							src={selectedImage.url}
							alt={selectedImage.caption || ''}
							className="max-w-full max-h-full object-contain"
						/>
						{selectedImage.caption && (
							<p className="text-white text-center mt-4">{selectedImage.caption}</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AboutSection;