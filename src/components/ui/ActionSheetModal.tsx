// components/ActionSheetModal.tsx
'use client'; // This component uses client-side hooks like useEffect and createPortal

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './AppIcon'; // Adjust path as needed

type ModalSize = 'small' | 'default' | 'large' | 'full';

interface ActionSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    size?: ModalSize;
}

const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    size = 'default' // 'small', 'default', 'large', 'full'
}) => {
    // Effect to control body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset'; // Clean up on unmount or when isOpen changes to false
        };
    }, [isOpen]);

    // Effect to handle Escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getSizeClasses = (): string => {
        switch (size) {
            case 'small':
                return 'md:max-w-md';
            case 'large':
                return 'md:max-w-4xl';
            case 'full':
                return 'md:max-w-6xl';
            default: // 'default'
                return 'md:max-w-2xl';
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-400 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full ${getSizeClasses()} mx-4 md:mx-auto`}>
                {/* Mobile: Full-screen bottom sheet */}
                <div className="md:hidden bg-surface rounded-t-2xl shadow-elevation-3 animate-slide-up max-h-[90vh] flex flex-col">
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-border-dark rounded-full" />
                    </div>

                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-heading font-semibold text-text-primary">
                                {title}
                            </h2>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                                    aria-label="Close modal"
                                >
                                    <Icon name="X" size={20} className="text-text-primary" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>

                {/* Desktop: Centered modal */}
                <div className="hidden bg-surface rounded-xl shadow-elevation-3 animate-fade-in max-h-[90vh] md:flex flex-col">
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-xl font-heading font-semibold text-text-primary">
                                {title}
                            </h2>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                                    aria-label="Close modal"
                                >
                                    <Icon name="X" size={20} className="text-text-primary" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );

    // Use createPortal to render the modal outside the component's DOM hierarchy
    // but still within the React tree, usually directly under document.body.
    return createPortal(modalContent, document.body);
};

export default ActionSheetModal;