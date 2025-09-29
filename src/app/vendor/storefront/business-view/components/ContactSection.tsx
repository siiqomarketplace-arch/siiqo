import React, { useState, FormEvent, ChangeEvent } from 'react';
import Icon, { type LucideIconName } from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import Input from '@/components/ui/new/Input';

// --- START OF TYPESCRIPT CONVERSION ---

interface SocialMediaLinks {
	facebook?: string;
	instagram?: string;
	twitter?: string;
}

interface Coordinates {
	lat: number;
	lng: number;
}

interface Business {
	name: string;
	phone: string;
	email: string;
	address: string;
	website?: string;
	socialMedia?: SocialMediaLinks;
	coordinates: Coordinates;
}

interface ContactFormData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

interface ContactSectionProps {
	business: Business | any;
	onSendMessage: (data: ContactFormData) => Promise<void>;
}

// --- END OF TYPESCRIPT CONVERSION ---

const ContactSection: React.FC<ContactSectionProps> = ({ business, onSendMessage }) => {
	const [message, setMessage] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [phone, setPhone] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onSendMessage({
				name,
				email,
				phone,
				message
			});

			// Reset form
			setName('');
			setEmail('');
			setPhone('');
			setMessage('');
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCallClick = (): void => {
		window.location.href = `tel:${business.phone}`;
	};

	const handleEmailClick = (): void => {
		window.location.href = `mailto:${business.email}`;
	};

	const handleDirectionsClick = (): void => {
		const address = encodeURIComponent(business.address);
		window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
	};

	return (
		<div className="space-y-8">
			{/* Contact Information */}
			<div>
				<h2 className="text-xl font-semibold text-text-primary mb-6">Get in Touch</h2>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Contact Details */}
					<div className="space-y-6">
						<div className="space-y-4">
							{/* Phone */}
							<div className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Icon name={'Phone' as LucideIconName} size={20} className="text-primary" />
								</div>
								<div className="flex-1">
									<p className="font-medium text-text-primary">Phone</p>
									<p className="text-text-secondary">{business.phone}</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleCallClick}
									iconName={'Phone' as LucideIconName}
									iconSize={16}
								>
									Call
								</Button>
							</div>

							{/* Email */}
							<div className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Icon name={'Mail' as LucideIconName} size={20} className="text-primary" />
								</div>
								<div className="flex-1">
									<p className="font-medium text-text-primary">Email</p>
									<p className="text-text-secondary">{business.email}</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleEmailClick}
									iconName={'Mail' as LucideIconName}
									iconSize={16}
								>
									Email
								</Button>
							</div>

							{/* Address */}
							<div className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<Icon name={'MapPin' as LucideIconName} size={20} className="text-primary" />
								</div>
								<div className="flex-1">
									<p className="font-medium text-text-primary">Address</p>
									<p className="text-text-secondary">{business.address}</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleDirectionsClick}
									iconName={'Navigation' as LucideIconName}
									iconSize={16}
								>
									Directions
								</Button>
							</div>

							{/* Website */}
							{business.website && (
								<div className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
										<Icon name={'Globe' as LucideIconName} size={20} className="text-primary" />
									</div>
									<div className="flex-1">
										<p className="font-medium text-text-primary">Website</p>
										<p className="text-text-secondary">{business.website}</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => window.open(business.website, '_blank')}
										iconName={'ExternalLink' as LucideIconName}
										iconSize={16}
									>
										Visit
									</Button>
								</div>
							)}
						</div>

						{/* Social Media */}
						{business.socialMedia && (
							<div>
								<h3 className="font-medium text-text-primary mb-3">Follow Us</h3>
								<div className="flex space-x-3">
									{business.socialMedia.facebook && (
										<Button
											variant="outline"
											size="icon"
											onClick={() => window.open(business.socialMedia!.facebook, '_blank')}
										>
											<Icon name={'Facebook' as LucideIconName} size={20} />
										</Button>
									)}
									{business.socialMedia.instagram && (
										<Button
											variant="outline"
											size="icon"
											onClick={() => window.open(business.socialMedia!.instagram, '_blank')}
										>
											<Icon name={'Instagram' as LucideIconName} size={20} />
										</Button>
									)}
									{business.socialMedia.twitter && (
										<Button
											variant="outline"
											size="icon"
											onClick={() => window.open(business.socialMedia!.twitter, '_blank')}
										>
											<Icon name={'Twitter' as LucideIconName} size={20} />
										</Button>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Contact Form */}
					<div>
						<h3 className="font-medium text-text-primary mb-4">Send a Message</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
							<Input
								label="Your Name"
								type="text"
								value={name}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
								placeholder="Enter your full name"
								required
							/>

							<Input
								label="Email Address"
								type="email"
								value={email}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
								placeholder="Enter your email"
								required
							/>

							<Input
								label="Phone Number"
								type="tel"
								value={phone}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
								placeholder="Enter your phone number"
							/>

							<div>
								<label className="block text-sm font-medium text-text-primary mb-2">
									Message
								</label>
								<textarea
									value={message}
									onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
									placeholder="Tell us how we can help you..."
									rows={4}
									required
									className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
								/>
							</div>

							<Button
								type="submit"
								variant="default"
								fullWidth
								loading={isSubmitting}
								iconName={'Send' as LucideIconName}
								iconPosition="left"
							>
								Send Message
							</Button>
						</form>
					</div>
				</div>
			</div>

			{/* Map */}
			<div>
				<h3 className="font-medium text-text-primary mb-4">Location</h3>
				<div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden border border-border">
					<iframe
						width="100%"
						height="100%"
						loading="lazy"
						title={business.name}
						referrerPolicy="no-referrer-when-downgrade"
						src={`https://www.google.com/maps?q=${business.coordinates.lat},${business.coordinates.lng}&z=15&output=embed`}
					/>
				</div>
			</div>
		</div>
	);
};

export default ContactSection;