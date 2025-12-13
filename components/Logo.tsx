
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sharp White Star with currentColor stroke for visibility on light/dark backgrounds */}
    <path
      d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z"
      fill="white"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Blue Rectangle Square Inside */}
    <rect x="10" y="11" width="4" height="4" fill="#2563eb" />
  </svg>
);
