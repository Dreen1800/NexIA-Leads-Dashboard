import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => {
  return (
    <div className="relative">
      {/* Tab button */}
      <button
        onClick={onClick}
        className={cn(
          "px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 relative z-10",
          isActive
            ? "text-white"
            : "text-gray-600 hover:text-purple-700"
        )}
      >
        {label}
        
        {/* Subtle underline effect on hover for inactive tabs */}
        {!isActive && (
          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-purple-400/40 group-hover:w-full transition-all duration-300"></span>
        )}
      </button>
      
      {/* Active tab background with blur effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-lg bg-purple-600 shadow-md">
          {/* Decorative blur effects */}
          <div className="absolute -right-1 -top-1 w-8 h-8 rounded-full bg-purple-400/50 blur-md"></div>
          <div className="absolute -left-1 -bottom-1 w-6 h-6 rounded-full bg-purple-300/40 blur-md"></div>
        </div>
      )}
    </div>
  );
};

interface DashboardTabsProps {
  tabs: {
    id: string;
    label: string;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const DashboardTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: DashboardTabsProps) => {
  return (
    <div className="relative p-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-purple-500/10 blur-xl"></div>
      <div className="absolute -left-5 top-0 w-16 h-16 rounded-full bg-purple-400/5 blur-lg"></div>
      
      {/* Tabs container */}
      <div className="flex space-x-3 relative z-10">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardTabs;