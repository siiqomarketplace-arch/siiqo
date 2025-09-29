import React from 'react';
import { useRouter } from 'next/navigation'; // Using 'next/router' for client-side navigation within pages
import Icon from '@/components/ui/AppIcon'; // Adjust path if necessary
import { LucideIconName } from '@/components/ui/AppIcon'; // <--- Import LucideIconName!

// Update the interface to use LucideIconName for the icon property
interface Action {
    title: string;
    subtitle: string;
    icon: LucideIconName; // <--- Changed from 'string' to 'LucideIconName'
    color: string;
    action: () => void;
}

const QuickActions: React.FC = () => {
    const router = useRouter();

    const actions: Action[] = [
        {
            title: "List an Item",
            subtitle: "Sell something nearby",
            icon: "Plus", // This must be a valid Lucide icon name
            color: "bg-[#2563EB] text-white",
            action: () => router.push('/create-listing')
        },
        {
            title: "View All Categories",
            subtitle: "Browse everything",
            icon: "Grid3X3", // This must be a valid Lucide icon name
            color: "bg-surface border border-border text-text-primary",
            action: () => router.push('/search-results')
        }
    ];

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.action}
                        className={`${action.color} p-6 rounded-lg hover:shadow-elevation-1 transition-all duration-200 text-left`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-white bg-opacity-20' : 'bg-primary-50'
                                }`}>
                                <Icon
                                    name={action.icon} // No error here now!
                                    size={24}
                                    className={index === 0 ? 'text-white' : 'text-primary'}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-heading font-semibold mb-1">{action.title}</h3>
                                <p className={`text-sm ${index === 0 ? 'text-white text-opacity-80' : 'text-text-secondary'}`}>
                                    {action.subtitle}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;