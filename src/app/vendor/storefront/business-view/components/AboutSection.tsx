import React, { useState } from 'react';
import Icon, { type LucideIconName } from '@/components/AppIcon';
import Image from '@/components/ui/alt/AppImageAlt';
import Button from '@/components/ui/new/Button';

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
	target_view: string;
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
				<h2 className="mb-4 text-xl font-semibold text-text-primary">About {business.name}</h2>
				<div className="prose-sm prose max-w-none">
					<p className="mb-4 leading-relaxed text-text-secondary">
						{business.description}
					</p>
					{business.story && (
						<div>
							<h3 className="mb-2 text-lg font-medium text-text-primary">Our Story</h3>
							<p className="leading-relaxed text-text-secondary">
								{business.story}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Business Details */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Key Information */}
				<div>
					<h3 className="mb-4 text-lg font-medium text-text-primary">Business Information</h3>
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
											className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
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
					<h3 className="mb-4 text-lg font-medium text-text-primary">Business Hours</h3>
					<div className="space-y-2">
						{business.hours.map((day, index) => (
							<div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
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
					<h3 className="mb-4 text-lg font-medium text-text-primary">Gallery</h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{business.gallery.map((image, index) => (
							<div
								key={index}
								className="overflow-hidden transition-opacity duration-200 rounded-lg cursor-pointer aspect-square hover:opacity-90"
								onClick={() => handleImageClick(image)}
							>
								<Image
									src={image.url}
									alt={image.caption || `Gallery image ${index + 1}`}
									className="object-cover w-full h-full"
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Team Section */}
			{business.team && business.team.length > 0 && (
				<div>
					<h3 className="mb-4 text-lg font-medium text-text-primary">Meet Our Team</h3>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{business.team.map((member, index) => (
							<div key={index} className="text-center">
								<div className="w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full">
									<Image
										src={member.photo}
										alt={member.name}
										className="object-cover w-full h-full"
									/>
								</div>
								<h4 className="font-medium text-text-primary">{member.name}</h4>
								<p className="text-sm text-text-secondary">{member.target_view}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Lightbox Modal */}
			{selectedImage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
					<div className="relative max-w-4xl max-h-full">
						<Button
							variant="ghost"
							size="icon"
							onClick={closeLightbox}
							className="absolute right-0 text-white -top-12 hover:bg-white hover:bg-opacity-20"
						>
							<Icon name={'X' as LucideIconName} size={24} />
						</Button>
						<Image
							src={selectedImage.url}
							alt={selectedImage.caption || ''}
							className="object-contain max-w-full max-h-full"
						/>
						{selectedImage.caption && (
							<p className="mt-4 text-center text-white">{selectedImage.caption}</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AboutSection;