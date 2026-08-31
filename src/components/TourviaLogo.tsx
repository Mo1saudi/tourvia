import React from 'react';

interface TourviaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textClassName?: string;
  variant?: 'full' | 'mark';
  iconOnly?: boolean;
}

export const TourviaLogo: React.FC<TourviaLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textClassName = '',
  variant = 'full',
  iconOnly = false,
}) => {
  let pixelSize = 40;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'sm':
        pixelSize = 28;
        break;
      case 'md':
        pixelSize = 40;
        break;
      case 'lg':
        pixelSize = 56;
        break;
      case 'xl':
        pixelSize = 84;
        break;
    }
  }

  const svgMark = (
    <svg
      viewBox="0 0 500 500"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
    >
      <defs>
        {/* Navy Gradient for Road & V */}
        <linearGradient id="tv-navy-grad" x1="80" y1="150" x2="420" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1736" />
          <stop offset="100%" stopColor="#102046" />
        </linearGradient>

        {/* Gold Sun Gradient */}
        <linearGradient id="tv-gold-grad" x1="180" y1="150" x2="330" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Pyramid Facet Shading */}
        <linearGradient id="tv-pyr-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="tv-pyr-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Road highlight strip */}
        <linearGradient id="tv-road-divider" x1="100" y1="150" x2="300" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* 1. Pyramids in the center */}
      {/* Tall Main Pyramid */}
      {/* Left facet (light) */}
      <polygon points="268,242 228,340 268,340" fill="url(#tv-pyr-light)" />
      {/* Right facet (shadow) */}
      <polygon points="268,242 268,340 308,340" fill="url(#tv-pyr-dark)" />

      {/* Small Left Pyramid */}
      {/* Left facet (light) */}
      <polygon points="226,276 186,340 226,340" fill="url(#tv-pyr-light)" />
      {/* Right facet (shadow) */}
      <polygon points="226,276 226,340 258,340" fill="url(#tv-pyr-dark)" />

      {/* 2. Main Curved Navy Road (The stylized T swooping into base) */}
      <path
        d="M 85 150 
           L 270 150 
           C 295 150 315 160 324 182
           C 328 192 320 205 305 210
           C 275 220 230 238 185 272
           C 125 318 90 355 90 382
           C 90 392 120 392 180 392
           C 240 392 292 388 292 388
           C 270 380 230 365 195 348
           C 150 326 125 298 140 268
           C 160 230 225 200 280 182
           C 310 172 325 158 310 150
           L 85 150 Z"
        fill="url(#tv-navy-grad)"
      />

      {/* Smoothed Highway Body */}
      <path
        d="M 84 150 
           H 265 
           C 292 150 310 162 324 182
           C 315 205 285 218 248 234
           C 178 265 92 312 92 368
           C 92 386 115 392 165 392
           C 230 392 285 385 292 385
           C 260 376 215 358 178 338
           C 138 316 118 288 135 258
           C 155 224 212 195 268 178
           C 295 170 312 162 300 150
           Z"
        fill="url(#tv-navy-grad)"
      />

      {/* Alternative precise Highway curve rendering for highest fidelity */}
      <path
        d="M 85 150 
           L 270 150 
           C 295 150 318 160 324 178
           C 318 198 292 210 255 226
           C 188 256 94 300 94 362
           C 94 384 125 392 178 392
           C 240 392 290 386 292 386
           C 262 376 218 358 178 336
           C 136 312 120 284 138 254
           C 160 218 220 188 276 172
           C 296 166 312 160 295 150
           Z"
        fill="#0D1B3E"
      />

      {/* Top Edge Road Highway Contour */}
      <path
        d="M 85 150
           H 275
           C 298 150 318 162 324 180
           C 310 198 275 215 230 235
           C 160 268 92 315 92 365
           C 92 388 120 392 175 392
           C 230 392 288 386 292 386
           C 245 372 195 348 160 325
           C 125 300 115 272 135 245
           C 162 210 230 180 282 168
           C 296 164 305 158 290 150
           Z"
        fill="#0B1736"
      />

      {/* Highway Center Yellow Track Divider Line */}
      <path
        d="M 135 388
           C 120 376 112 355 125 330
           C 142 296 195 258 250 228
           C 285 208 312 190 310 175"
        stroke="url(#tv-gold-grad)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner Thin White Guide Line on Highway */}
      <path
        d="M 172 166
           C 235 178 285 198 300 216"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.8"
        fill="none"
      />

      {/* 3. The "V" Right Arm */}
      <path
        d="M 274 384
           L 384 190
           H 424
           L 298 388
           C 292 388 282 387 274 384
           Z"
        fill="#0B1736"
      />
      <polygon points="275,384 384,190 424,190 298,388" fill="#0D1B3E" />

      {/* 4. Top Golden Location Pin Marker */}
      <g transform="translate(280, 90)">
        {/* Pin Body */}
        <path
          d="M 22 56
             C 22 56 3 34 3 20
             C 3 9 11.5 0 22 0
             C 32.5 0 41 9 41 20
             C 41 34 22 56 22 56
             Z"
          fill="url(#tv-gold-grad)"
        />
        {/* Pin Center Dot (White) */}
        <circle cx="22" cy="20" r="7.5" fill="#FFFFFF" />
      </g>
    </svg>
  );

  if (iconOnly || variant === 'mark') {
    return svgMark;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {svgMark}
      {showText && (
        <div className={`flex flex-col text-left ${textClassName}`}>
          <span className="font-heading text-xl font-black tracking-tight text-[#0B1736] dark:text-white">
            TOUR<span className="text-[#F59E0B]">VIA</span>
          </span>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400">
            AI TOUR GUIDE SaaS
          </span>
        </div>
      )}
    </div>
  );
};
