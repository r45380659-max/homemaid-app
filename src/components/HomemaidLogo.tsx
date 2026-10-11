import React from 'react';

interface HomemaidLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  showTagline?: boolean;
  showText?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const HomemaidLogo: React.FC<HomemaidLogoProps> = ({
  size = 'md',
  showTagline = true,
  showText = true,
  className = '',
  theme = 'light',
}) => {
  // Dimensions
  const getIconDimensions = () => {
    switch (size) {
      case 'sm':
        return { w: 34, h: 34 };
      case 'md':
        return { w: 44, h: 44 };
      case 'lg':
        return { w: 68, h: 68 };
      case 'xl':
        return { w: 120, h: 120 };
      case 'icon':
        return { w: 38, h: 38 };
      default:
        return { w: 44, h: 44 };
    }
  };

  const { w, h } = getIconDimensions();

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Homemaid House & Heart Icon */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: w, height: h }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="hmBrandGrad" x1="50%" y1="10%" x2="50%" y2="92%">
              <stop offset="0%" stopColor="#00C8D7" />
              <stop offset="35%" stopColor="#009CE8" />
              <stop offset="70%" stopColor="#0072CE" />
              <stop offset="100%" stopColor="#004DA5" />
            </linearGradient>

            <linearGradient id="hmSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3CE8FF" />
              <stop offset="100%" stopColor="#008BE3" />
            </linearGradient>

            <filter id="hmSoftShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0057B7" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Left Fresh Air / Breeze Wisps */}
          <g opacity="0.8">
            <path
              d="M 18 150 C 10 134, 12 120, 20 106"
              stroke="url(#hmBrandGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 28 162 C 20 148, 22 134, 30 120"
              stroke="url(#hmBrandGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Right Fresh Air / Breeze Wisps */}
          <g opacity="0.8">
            <path
              d="M 182 150 C 190 134, 188 120, 180 106"
              stroke="url(#hmBrandGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 172 162 C 180 148, 178 134, 170 120"
              stroke="url(#hmBrandGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Top Right Steam Wisp near Chimney */}
          <path
            d="M 162 76 C 160 58, 166 46, 163 32"
            stroke="url(#hmBrandGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
            fill="none"
          />

          {/* Sparkle Stars on Upper Right */}
          <g filter="url(#hmSoftShadow)">
            {/* Primary Diamond Star */}
            <path
              d="M 148 14 Q 148 22 156 22 Q 148 22 148 30 Q 148 22 140 22 Q 148 22 148 14 Z"
              fill="url(#hmSparkleGrad)"
            />
            {/* Secondary Star */}
            <path
              d="M 176 28 Q 176 34 182 34 Q 176 34 176 40 Q 176 34 170 34 Q 176 34 176 28 Z"
              fill="url(#hmSparkleGrad)"
            />
            {/* Tertiary Star */}
            <path
              d="M 132 30 Q 132 34 136 34 Q 132 34 132 38 Q 132 34 128 34 Q 132 34 132 30 Z"
              fill="url(#hmSparkleGrad)"
            />
            {/* Ambient Sparkle Dots */}
            <circle cx="34" cy="62" r="2" fill="#00C8D7" opacity="0.8" />
            <circle cx="186" cy="80" r="2" fill="#009CE8" opacity="0.8" />
            <circle cx="138" cy="14" r="1.6" fill="#3CE8FF" opacity="0.8" />
          </g>

          {/* Main House Outline & Interwoven Heart */}
          <g filter="url(#hmSoftShadow)">
            {/* Chimney on Right Roof Slope */}
            <path
              d="M 137 72 L 137 51 C 137 48.5, 139 47, 142 47 L 149 47 C 152 47, 154 48.5, 154 51 L 154 87"
              stroke="url(#hmBrandGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* House Triangular Roof Outline */}
            <path
              d="M 32 108 L 96 46 C 98.5 43.5, 101.5 43.5, 104 46 L 168 108"
              stroke="url(#hmBrandGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* House Left Vertical Wall into Lower Corner */}
            <path
              d="M 45 106 L 45 158 C 45 168, 54 176, 64 176 L 90 176"
              stroke="url(#hmBrandGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* House Right Vertical Wall into Lower Corner */}
            <path
              d="M 155 106 L 155 158 C 155 168, 146 176, 136 176 L 110 176"
              stroke="url(#hmBrandGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Central Heart Shape - Elegant, balanced, rounded lobes */}
            <path
              d="M 100 120 
                 C 88 102, 64 102, 64 126 
                 C 64 148, 88 168, 100 178
                 C 112 168, 136 148, 136 126
                 C 136 102, 112 102, 100 120 Z"
              stroke="url(#hmBrandGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Interwoven Base Loop Accent */}
            <path
              d="M 86 176 C 94 179, 106 179, 114 176"
              stroke="url(#hmBrandGrad)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${
                size === 'sm'
                  ? 'text-lg'
                  : size === 'lg'
                  ? 'text-3xl'
                  : size === 'xl'
                  ? 'text-4xl'
                  : 'text-xl sm:text-2xl'
              } ${theme === 'dark' ? 'text-white' : 'text-[#0D3B66]'}`}
            >
              HOMEMAID
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-medium tracking-tight mt-0.5 ${
                size === 'sm'
                  ? 'text-[9px]'
                  : size === 'lg'
                  ? 'text-sm'
                  : size === 'xl'
                  ? 'text-base'
                  : 'text-[11px] sm:text-xs'
              } ${theme === 'dark' ? 'text-cyan-200' : 'text-[#0F568C]'}`}
            >
              Home Services Made Easy
            </span>
          )}
        </div>
      )}
    </div>
  );
};
