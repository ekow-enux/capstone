'use client';

import React from 'react';
import { Search, Download } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  showExport?: boolean;
  onExport?: () => void;
  actions?: React.ReactNode;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = 'Search...',
  showExport = true,
  onExport,
  actions,
}: SearchBarProps) {
  return (
    <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3">
          {showExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}

