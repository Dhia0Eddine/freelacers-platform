import React from 'react';

interface CircularProgressIndicatorProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color?: string;
}

export function CircularProgressIndicator({
  percentage,
  size,
  strokeWidth,
  color = '#3b82f6' // Default blue color
}: CircularProgressIndicatorProps) {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;
  
  // Center position
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#e5e7eb" // Light gray
          strokeWidth={strokeWidth}
          className="dark:opacity-10"
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Percentage text in the center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(normalizedPercentage)}%</span>
      </div>
    </div>
  );
}
