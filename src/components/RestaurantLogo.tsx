/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RestaurantLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function RestaurantLogo({ 
  className = '', 
  size = 40,
  color = 'currentColor'
}: RestaurantLogoProps) {
  const uniqueId = React.useId().replace(/:/g, '-');
  const maskId = `logo-fork-mask-${uniqueId}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Mask to cut out the fork shape in negative space */}
        <mask id={maskId}>
          {/* Default white: everything of J path is visible */}
          <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
          
          {/* Black cutout elements to form the fork negative space */}
          {/* Fork Head/Base cutout curve */}
          <path 
            d="M 28,78 C 30,74 34,68 39,63 C 44,58 50,56 53,59 C 56,62 54,68 49,73 L 38,82 Z" 
            fill="#000000" 
          />
          
          {/* Fork Handle cutout pointing down-left along J hook */}
          <path 
            d="M 33,80 C 23,80 18,72 18,65" 
            stroke="#000000" 
            strokeWidth="5" 
            strokeLinecap="round" 
            fill="none"
          />

          {/* Fork Tines (4 Prongs) pointing up-right into J stem */}
          {/* Prong 1 (top-rightmost) */}
          <path 
            d="M 48,59 L 60,47" 
            stroke="#000000" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Prong 2 */}
          <path 
            d="M 45,62 L 57,50" 
            stroke="#000000" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Prong 3 */}
          <path 
            d="M 42,65 L 54,53" 
            stroke="#000000" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Prong 4 (bottom-leftmost) */}
          <path 
            d="M 39,68 L 51,56" 
            stroke="#000000" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </mask>
      </defs>

      {/* The beautifully drawn single continuous letter 'J' path */}
      <path 
        d="M 44,20 H 80 V 32 H 62 V 60 C 62,76 52,84 36,84 C 20,84 14,74 14,62 H 26 C 26,69 32,72 44,72 C 50,72 50,66 50,60 V 32 H 44 Z" 
        fill={color} 
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
