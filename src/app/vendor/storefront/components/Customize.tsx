"use client";

import React, { useState } from "react";
import ProductManagement from "@/app/vendor/products/page";
import AboutSection from "./AboutSection";
import ReviewsSection from "./ReviewsSection";
import Icon from "@/components/AppIcon";

type TabId = "products" | "about" | "reviews";

const Customize: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("products");

  const tabs: {
    id: TabId;
    label: string;
    icon: string;
  }[] = [
    {
      id: "products",
      label: "Products",
      icon: "Package",
    },
    {
      id: "about",
      label: "About",
      icon: "Info",
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: "Star",
    },
  ];

  return (
    <div>
      <div className="flex items-center mb-8 space-x-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-secondary hover:border-border"
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "about" && <AboutSection />}
        {activeTab === "reviews" && <ReviewsSection />}
      </div>
    </div>
  );
};

export default Customize;
