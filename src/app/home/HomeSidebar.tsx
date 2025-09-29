import { useRouter } from "next/navigation"
import Icon from "@/components/AppIcon";
import { LucideIconName } from '@/components/ui/AppIcon';

interface QuickFilter {
    label: string;
    icon: LucideIconName;
}

export default function HomeSidebar() {
    const router = useRouter();

    return (
        <div className="hidden lg:block relative left-0 top-32 bottom-0 w-80 bg-white border-r border-border p-6 overflow-y-auto">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Saved Searches</h3>
                    <div className="space-y-2">
                        {[
                            { query: "iPhone 15", count: 12 },
                            { query: "Gaming Chair", count: 8 },
                            { query: "Coffee Table", count: 15 }
                        ].map((search, index) => (
                            <button
                                key={index}
                                onClick={() => router.push(`/search-results?q=${encodeURIComponent(search.query)}`)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                            >
                                <span className="text-sm text-text-primary">{search.query}</span>
                                <span className="text-xs text-text-secondary bg-primary-50 px-2 py-1 rounded-full">
                                    {search.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Quick Filters</h3>
                    <div className="space-y-2">
                        {([
                            { label: "Under $50", icon: "DollarSign" },
                            { label: "Within 5 miles", icon: "MapPin" },
                            { label: "New condition", icon: "Star" },
                            { label: "Free shipping", icon: "Truck" }
                        ] as QuickFilter[]).map((filter, index) => (
                            <button
                                key={index}
                                onClick={() => router.push('/search-results')}
                                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                            >
                                <Icon name={filter.icon} size={16} className="text-text-secondary" />
                                <span className="text-sm text-text-primary">{filter.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}