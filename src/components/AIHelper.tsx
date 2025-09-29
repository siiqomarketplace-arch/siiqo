"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, TrendingUp, AlertTriangle, Camera, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AIHelperProps {
    type: "invoice" | "credit" | "calculator" | "products";
}

export const AIHelper = ({ type }: AIHelperProps) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Simulate AI processing with realistic delays and responses
    const generateSuggestions = async (input: string, context: string) => {
        setIsAnalyzing(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        let mockSuggestions: string[] = [];

        switch (type) {
            case "invoice":
                mockSuggestions = [
                    "Consider adding a 2.5% early payment discount",
                    "Include delivery charges of ₦2,000 for orders above ₦50,000",
                    "Add your business logo and contact details for professional appearance",
                    "Set payment terms to 14 days for better cash flow"
                ];
                break;
            case "credit":
                mockSuggestions = [
                    `Customer payment probability: 85% (Based on history)`,
                    "Recommend setting up automatic reminder after 7 days",
                    "Consider offering 5% discount for immediate payment",
                    "Risk level: Low - Customer has good payment history"
                ];
                break;
            case "calculator":
                mockSuggestions = [
                    "Market price for similar items: ₦15,000 - ₦18,000",
                    "Recommended profit margin: 35% for this category",
                    "Peak demand expected in December (40% increase)",
                    "Consider bulk discount tiers: 5% at 50+ units, 10% at 100+ units"
                ];
                break;
            case "products":
                mockSuggestions = [
                    "Similar product found at 15% lower price in Ikeja",
                    "Price trend: Decreasing by 8% over last 30 days",
                    "Alternative brands: Samsung, LG with similar features",
                    "Best time to buy: End of month for maximum discounts"
                ];
                break;
        }

        setSuggestions(mockSuggestions);
        setIsAnalyzing(false);

        toast({
            title: "AI Analysis Complete",
            description: "Smart suggestions generated based on market data and patterns.",
        });
    };

    const getAITitle = () => {
        switch (type) {
            case "invoice": return "Smart Invoice Assistant";
            case "credit": return "Credit Risk Analyzer";
            case "calculator": return "Market Intelligence";
            case "products": return "Product Search AI";
            default: return "AI Assistant";
        }
    };

    const getAIDescription = () => {
        switch (type) {
            case "invoice": return "Get smart suggestions for pricing, terms, and professional formatting";
            case "credit": return "Analyze customer payment patterns and assess credit risk";
            case "calculator": return "Get market insights and pricing recommendations";
            case "products": return "Find better deals and price trends with AI-powered search";
            default: return "AI-powered assistance for your business";
        }
    };

    const getPlaceholder = () => {
        switch (type) {
            case "invoice": return "Describe your product/service (e.g., 'Wedding catering for 100 guests')";
            case "credit": return "Enter customer name or payment history details";
            case "calculator": return "Describe your product category (e.g., 'Electronics wholesale')";
            case "products": return "Describe what you're looking for (e.g., 'iPhone 15 Pro Max')";
            default: return "How can I help you today?";
        }
    };

    return (
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-gray-800">{getAITitle()}</CardTitle>
                        <CardDescription className="text-sm">{getAIDescription()}</CardDescription>
                    </div>
                </div>
                <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-700 border-blue-200">
                    <Brain className="h-3 w-3 mr-1" />
                    AI-Powered
                </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <Textarea
                        placeholder={getPlaceholder()}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="min-h-[80px] resize-none border-gray-200 focus:border-blue-400"
                    />

                    <div className="flex gap-2">
                        <Button
                            onClick={() => generateSuggestions(userInput, type)}
                            disabled={!userInput.trim() || isAnalyzing}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Get AI Suggestions
                                </>
                            )}
                        </Button>

                        {type === "products" && (
                            <Button variant="outline" className="border-gray-300">
                                <Camera className="h-4 w-4 mr-2" />
                                Visual Search
                            </Button>
                        )}
                    </div>
                </div>

                {suggestions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            AI Recommendations
                        </div>

                        <div className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex items-start gap-2">
                                        {suggestion.includes("Risk") || suggestion.includes("probability") ? (
                                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span>{suggestion}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    💡 Tip: The more details you provide, the better AI recommendations you'll receive
                </div>
            </CardContent>
        </Card>
    );
};
