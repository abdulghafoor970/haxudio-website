import React from 'react';

export default function HaxudioLogo({ className = 'w-8 h-8', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <defs>
        {/* Terracotta Orange Gradient for Left Bracket and Brush Tip */}
        <linearGradient id="hxOrangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E27D3A" />
          <stop offset="45%" stopColor="#D46A2C" />
          <stop offset="100%" stopColor="#BF5820" />
        </linearGradient>

        {/* Slate Blue Gradient for Right Bracket and Elements */}
        <linearGradient id="hxBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B819E" />
          <stop offset="50%" stopColor="#4B728F" />
          <stop offset="100%" stopColor="#3C617C" />
        </linearGradient>

        {/* Brush Handle Gradient */}
        <linearGradient id="hxHandleGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93725A" />
          <stop offset="35%" stopColor="#737279" />
          <stop offset="100%" stopColor="#4B6E87" />
        </linearGradient>

        {/* Circuit Network Color */}
        <linearGradient id="hxNetworkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9A8377" />
          <stop offset="100%" stopColor="#80695E" />
        </linearGradient>
      </defs>

      {/* Background Circuit Network Nodes */}
      <g stroke="url(#hxNetworkGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="250" y1="165" x2="225" y2="202" />
        <line x1="250" y1="165" x2="275" y2="202" />
        <line x1="250" y1="335" x2="228" y2="298" />
        <line x1="250" y1="335" x2="272" y2="298" />
      </g>
      <circle cx="250" cy="165" r="10.5" fill="url(#hxNetworkGrad)" />
      <circle cx="250" cy="335" r="10.5" fill="url(#hxNetworkGrad)" />

      {/* Left Circuit Lines & Nodes */}
      <g stroke="url(#hxOrangeGrad)" strokeWidth="5" strokeLinecap="round">
        <line x1="120" y1="180" x2="155" y2="180" />
        <line x1="110" y1="275" x2="155" y2="275" />
        <line x1="155" y1="275" x2="215" y2="275" />
      </g>
      <circle cx="120" cy="180" r="11" fill="url(#hxOrangeGrad)" />
      <circle cx="110" cy="275" r="11" fill="url(#hxOrangeGrad)" />
      <circle cx="210" cy="275" r="11" fill="url(#hxOrangeGrad)" />

      {/* Left Curly Bracket { */}
      <path
        d="M 125 100 H 112 C 85 100, 62 122, 62 150 V 208 C 62 232, 45 250, 38 250 C 45 250, 62 268, 62 292 V 350 C 62 378, 85 400, 112 400 H 125 V 375 H 112 C 98 375, 87 364, 87 350 V 295 C 87 270, 72 253, 58 250 C 72 247, 87 230, 87 205 V 150 C 87 136, 98 125, 112 125 H 125 Z"
        fill="url(#hxOrangeGrad)"
      />

      {/* Left Vertical Stem of 'h' */}
      <rect x="150" y="100" width="40" height="235" rx="5" fill="url(#hxOrangeGrad)" />

      {/* Shoulder Arch of 'h' */}
      <path
        d="M 190 182 C 190 182, 224 182, 245 215 L 218 244 C 202 224, 190 220, 190 220 Z"
        fill="url(#hxOrangeGrad)"
      />

      {/* Right Circuit Line & Nodes */}
      <g stroke="url(#hxBlueGrad)" strokeWidth="5" strokeLinecap="round">
        <line x1="295" y1="275" x2="390" y2="275" />
      </g>
      <circle cx="390" cy="275" r="11" fill="url(#hxBlueGrad)" />
      <circle cx="305" cy="275" r="11" fill="url(#hxBlueGrad)" />

      {/* Right Curly Bracket } */}
      <path
        d="M 375 100 H 388 C 415 100, 438 122, 438 150 V 208 C 438 232, 455 250, 462 250 C 455 250, 438 268, 438 292 V 350 C 438 378, 415 400, 388 400 H 375 V 375 H 388 C 402 375, 413 364, 413 350 V 295 C 413 270, 428 253, 442 250 C 428 247, 413 230, 413 205 V 150 C 413 136, 402 125, 388 125 H 375 Z"
        fill="url(#hxBlueGrad)"
      />

      {/* Right Vertical & Diagonal Strokes (completing 'x') */}
      <path
        d="M 322 182 H 360 V 350 H 322 Z"
        fill="url(#hxBlueGrad)"
      />
      <path
        d="M 285 240 L 322 285 V 350 L 255 270 Z"
        fill="url(#hxBlueGrad)"
      />

      {/* Paintbrush Handle */}
      <polygon
        points="218,292 360,110 350,105 198,272"
        fill="url(#hxHandleGrad)"
      />
      {/* Handle Highlight Glint */}
      <polygon
        points="225,282 352,118 348,116 215,274"
        fill="#FFFFFF"
        opacity="0.4"
      />

      {/* Paintbrush Ferrule */}
      <polygon
        points="192,280 224,305 212,320 180,295"
        fill="#E8ECEF"
      />
      <polygon
        points="198,285 220,302 214,310 190,292"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* Paintbrush Bristles & Dipped Tip */}
      <path
        d="M 180 295 C 170 305, 155 320, 145 342 C 138 358, 142 375, 152 378 C 165 382, 185 365, 202 342 C 208 333, 212 320, 212 320 Z"
        fill="url(#hxOrangeGrad)"
      />
    </svg>
  );
}
