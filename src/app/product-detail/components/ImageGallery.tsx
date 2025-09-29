"use client";

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';// Adjust path as needed

interface ImageGalleryProps {
    images: string[];
    activeIndex: number;
    onImageChange: (index: number) => void;
    isMobile?: boolean;
}

const ImageGallery = ({
    images,
    activeIndex,
    onImageChange,
    isMobile = false
}: ImageGalleryProps) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const handlePrevious = () => {
        const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
        onImageChange(newIndex);
    };

    const handleNext = () => {
        const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
        onImageChange(newIndex);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrevious();
        }
    };

    const handleImageClick = () => {
        if (isMobile) {
            setIsZoomed(!isZoomed);
        }
    };

    return (
        <div className="relative">
            {/* Main Image */}
            <div
                className={`relative overflow-hidden rounded-lg bg-surface-secondary ${isMobile ? 'aspect-square' : 'aspect-[4/3]'
                    }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <Image
                    src={images[activeIndex]}
                    alt={`Product image ${activeIndex + 1}`}
                    fill // Add fill prop
                    className={`object-cover cursor-pointer transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
                        }`} // Keep object-cover and transformation classes, remove w-full h-full
                    onClick={handleImageClick}
                    // Add sizes prop. This depends on how wide this main image usually is on your layout.
                    // Example: Full width on mobile, half width on tablet, fixed max width on desktop.
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
                            aria-label="Previous image"
                        >
                            <Icon name="ChevronLeft" size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
                            aria-label="Next image"
                        >
                            <Icon name="ChevronRight" size={20} />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {activeIndex + 1} / {images.length}
                </div>

                {/* Zoom Indicator */}
                {isMobile && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full">
                        <Icon name={isZoomed ? "ZoomOut" : "ZoomIn"} size={16} />
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && !isMobile && (
                <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => onImageChange(index)}
                            // Add 'relative' to the button
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === activeIndex
                                ? 'border-primary shadow-md'
                                : 'border-border hover:border-border-dark'
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill // Add fill prop
                                className="object-cover" // Keep object-cover, remove w-full h-full
                                sizes="80px" // Add sizes prop, as it's a fixed size
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Mobile Dot Indicators */}
            {images.length > 1 && isMobile && (
                <div className="flex justify-center space-x-2 mt-4">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onImageChange(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === activeIndex
                                ? 'bg-primary w-6'
                                : 'bg-border-dark hover:bg-border'
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;