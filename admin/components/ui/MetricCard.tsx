'use client';

import React from 'react';
import { MetricCard } from '@/lib/types/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  metric: MetricCard;
  className?: string;
}

const MetricCardComponent: React.FC<MetricCardProps> = ({ metric, className = '' }) => {
  const getTrendIcon = () => {
    if (!metric.trend) return null;
    
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (metric.color) {
      case 'primary':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'secondary':
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${getColorClasses()} shadow-lg`}>
            <span className="text-2xl">{metric.icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {metric.title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metric.value}
            </p>
          </div>
        </div>
        
        {metric.trend && (
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {metric.trendValue && (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.trendValue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCardComponent;
