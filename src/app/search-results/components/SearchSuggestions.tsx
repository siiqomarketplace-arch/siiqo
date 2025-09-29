"use client";

import Icon from '@/components/ui/AppIcon';
import React from 'react';

interface SearchSuggestionsProps {
    query: string;
    recentSearches: string[];
    popularSearches: string[];
    onSelectSuggestion: (suggestion: string) => void;
    onClose: () => void;
}

const SearchSuggestions = ({
    query,
    recentSearches,
    popularSearches,
    onSelectSuggestion,
    onClose
}: SearchSuggestionsProps) => {
    const filteredSuggestions = [
        ...recentSearches.filter(search =>
            search.toLowerCase().includes(query.toLowerCase())
        ),
        ...popularSearches.filter(search =>
            search.toLowerCase().includes(query.toLowerCase()) &&
            !recentSearches.includes(search)
        )
    ].slice(0, 8);

    return (
        <div className="absolute top-full left-0 right-0 z-50 bg-surface border border-border rounded-b-lg shadow-elevation-2 max-h-80 overflow-y-auto">
            {/* Search Query Suggestion */}
            {query && (
                <button
                    onClick={() => onSelectSuggestion(query)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-secondary transition-colors duration-200 border-b border-border"
                >
                    <div className="flex items-center space-x-3">
                        <Icon name="Search" size={16} className="text-text-secondary" />
                        <span className="text-text-primary">Search for "{query}"</span>
                    </div>
                </button>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
                <div className="border-b border-border">
                    <div className="px-4 py-2 bg-surface-secondary">
                        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                            Recent Searches
                        </span>
                    </div>
                    {recentSearches
                        .filter(search => !query || search.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 4)
                        .map((search, index) => (
                            <button
                                key={`recent-${index}`}
                                onClick={() => onSelectSuggestion(search)}
                                className="w-full px-4 py-3 text-left hover:bg-surface-secondary transition-colors duration-200 flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon name="Clock" size={16} className="text-text-secondary" />
                                    <span className="text-text-primary">{search}</span>
                                </div>
                                <Icon
                                    name="ArrowUpLeft"
                                    size={14}
                                    className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                />
                            </button>
                        ))}
                </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
                <div>
                    <div className="px-4 py-2 bg-surface-secondary">
                        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                            Popular Searches
                        </span>
                    </div>
                    {popularSearches
                        .filter(search =>
                            !query || search.toLowerCase().includes(query.toLowerCase())
                        )
                        .filter(search => !recentSearches.includes(search))
                        .slice(0, 4)
                        .map((search, index) => (
                            <button
                                key={`popular-${index}`}
                                onClick={() => onSelectSuggestion(search)}
                                className="w-full px-4 py-3 text-left hover:bg-surface-secondary transition-colors duration-200 flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon name="TrendingUp" size={16} className="text-text-secondary" />
                                    <span className="text-text-primary">{search}</span>
                                </div>
                                <Icon
                                    name="ArrowUpLeft"
                                    size={14}
                                    className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                />
                            </button>
                        ))}
                </div>
            )}

            {/* No Suggestions */}
            {filteredSuggestions.length === 0 && query && (
                <div className="px-4 py-8 text-center">
                    <Icon name="Search" size={32} className="text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary text-sm">No suggestions found</p>
                </div>
            )}

            {/* Close overlay */}
            <div
                className="fixed inset-0 -z-10"
                onClick={onClose}
            />
        </div>
    );
};

export default SearchSuggestions;