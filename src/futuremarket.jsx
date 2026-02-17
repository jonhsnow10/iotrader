import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "./components/Header";
import SEO from "./components/SEO";

// --- CRYPTO LOGOS ---
const BitcoinLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
    <path
      fill="#f7931a"
      d="M499.4,341.4l-27.3,109.2c30.9,7.6,126.1,39.6,141.7-22.8h0s-.5,0-.5,0c16.1-64.6-83.5-78.9-113.9-86.4Z"
    />
    <path
      fill="#f7931a"
      d="M622.1,16.1c-.5,0-1-.2-1.4-.3C353-50.6,82.2,112.6,15.8,380.3c-66.3,267.7,96.8,538.5,364.5,604.9,267.7,66.4,538.5-96.8,604.9-364.5h0c66.3-267.2-96.1-537.6-363.1-604.6ZM721.6,428.8h-.2c-7.7,49.4-34.2,72.3-70.1,80.6,49.2,25.6,74.3,64.8,50.4,132.8-29.6,84.6-99.7,91.7-193.3,74l-22.6,90.8-54.8-13.6,22.2-90.4c-14.2-3.4-28.7-7.1-43.5-11.2l-22.5,90-54.8-13.7,22.6-91-39-10.1-71.3-17.6,27.2-62.4s40,10.6,40,9.8c10.5,3.3,21.8-2.5,25.1-13l35.7-143.7,5.8,1.6c-1.8-.8-3.7-1.5-5.6-1.9l25.6-102.5c1.2-15.6-10.1-29.3-25.6-31.2.8-.6-39.8-10-39.8-10l14.5-58.5,75.7,18.9,35,7.8,22.5-90,54.8,13.7-21.8,88.6c14.7,3.3,29.5,6.7,43.9,10.3l21.8-87.7,55.4,13.7-22.5,90c68.5,23.7,119,59.4,109.2,125.9Z"
    />
    <path
      fill="#f7931a"
      d="M458.4,505.7l-30.1,120.6c37.1,9.2,151.6,46,168.5-22,17.7-71-101.3-89.2-138.4-98.6Z"
    />
  </svg>
);

const EthereumLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 1000 1000"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      {/* Background Circle */}
      <circle cx="500" cy="500" r="499.5" fill="#627eea" />
      {/* Top Right */}
      <polygon
        points="515.5 125.4 515.5 402.3 749.6 506.9 515.5 125.4"
        fill="#fff"
        fillOpacity=".6"
      />
      {/* Top Left */}
      <polygon
        points="515.5 125.4 281.5 506.9 515.5 402.3 515.5 125.4"
        fill="#fff"
      />
      {/* Bottom Right */}
      <polygon
        points="515.5 686.3 515.5 874.5 749.8 550.4 515.5 686.3"
        fill="#fff"
        fillOpacity=".6"
      />
      {/* Bottom Left */}
      <polygon
        points="515.5 874.5 515.5 686.3 281.5 550.4 515.5 874.5"
        fill="#fff"
      />
      {/* Middle Right */}
      <polygon
        points="515.5 642.8 749.6 506.9 515.5 402.3 515.5 642.8"
        fill="#fff"
        fillOpacity=".2"
      />
      {/* Middle Left */}
      <polygon
        points="281.5 506.9 515.5 642.8 515.5 402.3 281.5 506.9"
        fill="#fff"
        fillOpacity=".6"
      />
    </g>
  </svg>
);

const SolanaLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
    <defs>
      <linearGradient
        id="solana-gradient"
        x1="711.5"
        y1="433.7"
        x2="424.8"
        y2="982.9"
        gradientTransform="translate(0 -186)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#00ffa3" />
        <stop offset="1" stopColor="#dc1fff" />
      </linearGradient>
      <linearGradient
        id="solana-gradient-2"
        x1="586.1"
        y1="368.2"
        x2="299.4"
        y2="917.4"
        xlinkHref="#solana-gradient"
      />
      <linearGradient
        id="solana-gradient-3"
        x1="648.4"
        y1="400.7"
        x2="361.7"
        y2="950"
        xlinkHref="#solana-gradient"
      />
    </defs>
    <path
      fill="#262626"
      d="M622.1,16.1c-.5,0-1-.2-1.4-.3C353-50.6,82.2,112.6,15.8,380.3c-66.3,267.7,96.8,538.5,364.5,604.9,267.7,66.4,538.5-96.8,604.9-364.5h0c66.3-267.2-96.1-537.6-363.1-604.6h0Z"
    />
    <g>
      <path
        fill="url(#solana-gradient)"
        d="M324.8,607.1c3.1-3.1,7.4-5,12-5h414.3c7.6,0,11.4,9.1,6,14.5l-81.8,81.8c-3.1,3.1-7.4,5-12,5H248.9c-7.6,0-11.4-9.1-6-14.5l81.8-81.8Z"
      />
      <path
        fill="url(#solana-gradient-2)"
        d="M324.8,301.5c3.3-3.1,7.6-5,12-5h414.3c7.6,0,11.4,9.1,6,14.5l-81.8,81.8c-3.1,3.1-7.4,5-12,5H248.9c-7.6,0-11.4-9.1-6-14.5l81.8-81.8Z"
      />
      <path
        fill="url(#solana-gradient-3)"
        d="M675.2,453.3c-3.1-3.1-7.4-5-12-5H248.9c-7.6,0-11.4-9.1-6,14.5l81.8,81.8c3.1,3.1,7.4,5,12,5h414.3c7.6,0,11.4-9.1,6-14.5l-81.8-81.8Z"
      />
    </g>
  </svg>
);

const BinanceLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
    <path
      fill="#f3ba2f"
      d="M622.1,16.1c-.5,0-1-.2-1.4-.3C353-50.6,82.2,112.6,15.8,380.3c-66.3,267.7,96.8,538.5,364.5,604.9,267.7,66.4,538.5-96.8,604.9-364.5h0c66.3-267.2-96.1-537.6-363.1-604.6h0Z"
    />
    <path
      fill="#fff"
      d="M557.7,698v67.2l-58.6,34.4-56.8-34.4v-67.2l56.8,34.4,58.6-34.4ZM244.3,465.6l56.8,34.4v115.4l98.2,58.6v67.2l-155-91.3v-184.3ZM754,465.6v184.3l-156.7,91.3v-67.2l98.2-58.6v-115.4l58.6-34.4ZM597.3,374.3l58.6,34.4h0v67.2l-98.2,58.6v117.1l-56.8,34.4-56.8-34.4v-117.1l-101.6-58.6v-67.2l58.6-34.4,98.2,58.6,98.2-58.6ZM342.4,524.1l56.8,34.4v67.2l-56.8-34.4v-67.2ZM655.8,524.1v67.2l-56.8,34.4v-67.2l56.8-34.4ZM301.1,315.7l58.6,34.4-58.6,34.4v67.2l-56.8-34.4v-67.2l56.8-34.4ZM697.2,315.7l58.6,34.4v67.2l-58.6,34.4v-67.2l-56.8-34.4,56.8-34.4ZM499.1,315.7l58.6,34.4-58.6,34.4-56.8-34.4,56.8-34.4ZM499.1,200.4l156.7,91.3-56.8,34.4-98.2-58.6-99.9,58.6-56.8-34.4,155-91.3Z"
    />
  </svg>
);

// --- IO TRADER LOGO COMPONENT ---
const IOLogo = ({ size = 40, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    viewBox="0 0 500 500"
    width={size}
    height={size}
    className={className}
    style={{ overflow: "visible" }}
  >
    <defs>
      <linearGradient
        id="io-gradient"
        x1="103.4"
        y1="87.9"
        x2="443.2"
        y2="381.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#d39c3a" />
        <stop offset=".2" stopColor="#e2b15e" />
        <stop offset=".4" stopColor="#fff9c5" />
        <stop offset=".7" stopColor="#bd842e" />
        <stop offset="1" stopColor="#e9ab32" />
      </linearGradient>
      <linearGradient
        id="io-gradient1"
        x1="52.5"
        y1="50.7"
        x2="462.2"
        y2="404.6"
        xlinkHref="#io-gradient"
      />
      <linearGradient
        id="io-gradient2"
        x1="4"
        y1="107"
        x2="413.7"
        y2="460.8"
        xlinkHref="#io-gradient"
      />
    </defs>
    <path
      fill="url(#io-gradient)"
      d="M376.5,287.5c-.9-55.1-82.9-55.1-83.9,0,.9,55.1,82.9,55.1,83.9,0Z"
    />
    <g>
      <path
        fill="url(#io-gradient1)"
        d="M102.9,55.4c-21.4,0-38.9,17.4-38.9,38.9s17.4,38.9,38.9,38.9,38.9-17.4,38.9-38.9-17.4-38.9-38.9-38.9Z"
      />
      <path
        fill="url(#io-gradient2)"
        d="M492.5,279.9c-1.8-39.1-18.1-75.9-46-103.8-27.9-27.9-64.7-44.2-103.8-46-43.5-2-84.7,13.4-116.1,43.4-31.4,30-48.7,70.4-48.7,113.8v61.6c0,9.9-8,17.9-17.9,17.9s-17.9-8-17.9-17.9v-156.7c0-21.5-17.5-38.9-38.9-38.9s-38.9,17.5-38.9,38.9v156.7c0,9.9-8,17.9-17.9,17.9-21.5,0-38.9,17.5-38.9,38.9s17.5,38.9,38.9,38.9,40.4-6.6,56.8-18.8c16.4,12.1,36.4,18.8,56.8,18.8,52.8,0,95.8-43,95.8-95.8v-61.6c0-21.9,8.7-42.3,24.6-57.5,15.8-15.1,36.7-22.9,58.7-21.9,40.5,1.9,73.7,35.1,75.6,75.6,1,22-6.8,42.8-21.9,58.7-15.2,15.9-35.6,24.6-57.5,24.6h-39.5c-21.5,0-38.9,17.5-38.9,38.9s17.5,38.9,38.9,38.9h39.5c43.4,0,83.8-17.3,113.8-48.7,30-31.4,45.4-72.6,43.4-116.1Z"
      />
    </g>
  </svg>
);

// --- INTERNAL ICON SYSTEM ---
const Icon = ({ name, size = 24, className = "", ...props }) => {
  const icons = {
    ArrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
    ArrowDown: <path d="M12 5v14m-7-7 7 7 7-7" />,
    ArrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
    Wallet: (
      <g>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </g>
    ),
    Zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    Clock: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </g>
    ),
    TrendingUp: (
      <g>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </g>
    ),
    TrendingDown: (
      <g>
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </g>
    ),
    Activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    ChevronDown: <path d="M6 9l6 6 6-6" />,
    ChevronLeft: <path d="M15 18l-6-6 6-6" />,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    CheckCircle2: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </g>
    ),
    Youtube: (
      <g>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2.85 2.85 0 0 1 2.5-2.5h14a2.85 2.85 0 0 1 2.5 2.5 24.12 24.12 0 0 1 0 10 2.85 2.85 0 0 1-2.5 2.5h-14a2.85 2.85 0 0 1-2.5-2.5z" />
        <polygon points="10 15 15 12 10 9" />
      </g>
    ),
    Twitter: (
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 14.6-5.6-4.6-7.8-11 2-12.7-3.7-4-1.8-12.9 6-11.5 3-2 10-1.8 6.7 6.2 0 0 0 0 0Z" />
    ),
    Send: (
      <g>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </g>
    ),
    Globe: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
      </g>
    ),
    Shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    Cpu: (
      <g>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </g>
    ),
    Trophy: (
      <g>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </g>
    ),
    Play: <polygon points="5 3 19 12 5 21 5 3" />,
    FileText: (
      <g>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </g>
    ),
    Settings: (
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    ),
    Sliders: (
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    ),
    X: <path d="M18 6 6 18M6 6l12 12" />,
    ScrollText: (
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
    ),
    History: (
      <g>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </g>
    ),
    Maximize: (
      <g>
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </g>
    ),
    // New Icons
    Lock: (
      <g>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </g>
    ),
    Coins: (
      <g>
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="m16.71 13.88.7 .71-2.82 2.82" />
      </g>
    ),
    BarChart: (
      <g>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </g>
    ),
    Users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />,
    Headphones: (
      <g>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </g>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {icons[name] || null}
    </svg>
  );
};

// --- CRYPTO ICON COMPONENT (Fix for ReferenceError) ---
const CryptoIcon = ({ symbol, className }) => {
  switch (symbol) {
    case "BTC":
      return <BitcoinLogo className={className} />;
    case "ETH":
      return <EthereumLogo className={className} />;
    case "SOL":
      return <SolanaLogo className={className} />;
    case "BNB":
      return <BinanceLogo className={className} />;
    default:
      return <div className={`rounded-full bg-gray-500 ${className}`} />;
  }
};

// --- ANIMATED BUTTON COMPONENT ---
const AnimatedBorderButton = ({ children, className = "", onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-auto overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-50 group ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#EAB308_50%,#000000_100%)]" />
      <span className="relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-[#050505] px-8 py-4 text-sm font-bold text-white backdrop-blur-3xl transition-all group-hover:bg-[#0a0a0a] group-hover:text-yellow-500">
        {children}
      </span>
    </button>
  );
};

// --- ANIMATED BACKGROUNDS ---
const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 bg-[#050505] z-0"></div>
    {/* Subtle Aurora-like gradient blobs - Increased Opacity */}
    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-white/20 rounded-full blur-[120px] animate-pulse"></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-900/20 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
    {/* Mask to fade edges seamlessly */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
  </div>
);

const PerspectiveGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#050505]">
    {/* Moving Perspective Grid - Increased Opacity */}
    <div
      className="absolute inset-0 opacity-20 animate-[grid-slide_10s_linear_infinite]"
      style={{
        backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        transform: "perspective(500px) rotateX(60deg)",
        transformOrigin: "top center",
      }}
    ></div>
    {/* Fade masks */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
  </div>
);

const CircuitNetworkBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#050505]">
    {/* Circuit Lines - Increased Opacity */}
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id="circuit-net"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="10" cy="10" r="1" fill="#EAB308" />
          <line
            x1="10"
            y1="10"
            x2="40"
            y2="40"
            stroke="#EAB308"
            strokeWidth="0.5"
          />
          <circle cx="40" cy="40" r="1" fill="#EAB308" />
          <line
            x1="40"
            y1="40"
            x2="80"
            y2="10"
            stroke="#EAB308"
            strokeWidth="0.5"
          />
          <circle cx="80" cy="10" r="1" fill="#EAB308" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-net)" />
    </svg>
    {/* Fade masks */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
  </div>
);

const SquaredGridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div
      className="absolute inset-0"
      style={{
        // Increased opacity from 0.05 to 0.1 (10%)
        backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.1) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    ></div>
    {/* Adjusted radial gradient to be less aggressive so grid shows through more */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0a0a0a_100%)]"></div>
  </div>
);

const WarpSpeedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars = [];
    const numStars = 800;
    const speed = 2;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        color: Math.random() > 0.8 ? "#EAB308" : "#ffffff",
      });
    }

    const animate = () => {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        const x = (star.x / star.z) * width + width / 2;
        const y = (star.y / star.z) * height + height / 2;
        const radius = Math.max(0, (1 - star.z / width) * 3);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    animate();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  );
};

// --- DUST PARTICLES COMPONENT ---
const DustParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set initial size
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const numParticles = 40; // "A bit" of particles

    // Create particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, // Slow velocity x
        vy: (Math.random() - 0.5) * 0.3, // Slow velocity y
        size: Math.random() * 1.5,
        alpha: Math.random() * 0.6 + 0.2, // Random opacity
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around logic
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Slightly gold/white tint
        ctx.fillStyle = `rgba(255, 245, 200, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// --- ANIMATED GRID BACKGROUND (Re-added for reference) ---
const AnimatedGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/50 to-[#050505] z-10"></div>
    <div
      className="absolute inset-0 opacity-20 animate-[grid-slide_20s_linear_infinite]"
      style={{
        backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.2) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
        perspective: "500px",
        transformOrigin: "top center",
      }}
    ></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)] z-10"></div>
  </div>
);

// --- GOLD GRID BACKGROUND (Re-added) ---
const GoldGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#050505]">
    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
    {/* Gold Grid */}
    <div
      className="absolute inset-0 opacity-20 animate-[grid-slide_20s_linear_infinite]"
      style={{
        backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.2) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
        perspective: "500px",
        transformOrigin: "top center",
      }}
    ></div>
    {/* Gold Gradient Pulses */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>
  </div>
);

// --- ANIMATED PROCESS STEPS COMPONENT ---
const AnimatedProcessSteps = () => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    // Cycle: 1 -> 2 -> 3 -> 0 (reset) -> 1
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 3 ? prev + 1 : 1));
    }, 2000); // Change step every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: "Connect your wallet", icon: "Wallet", step: "01" },
    { title: "Deposit crypto funds", icon: "Coins", step: "02" },
    { title: "Start predicting & trading", icon: "BarChart", step: "03" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      {/* Connection Lines (Desktop) */}
      <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-white/10 border-t border-dashed border-gray-700 z-0">
        {/* Energy Ball / Pulse */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent blur-sm transition-all duration-[2000ms] ease-linear"
          style={{
            left: activeStep === 1 ? "0%" : activeStep === 2 ? "50%" : "100%",
            opacity: activeStep === 3 ? 0 : 1, // Hide when finished/resetting
            transform: "translateX(-50%)",
          }}
        ></div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] transition-all duration-[2000ms] ease-linear z-10"
          style={{
            left: activeStep === 1 ? "0%" : activeStep === 2 ? "50%" : "100%",
            opacity: activeStep === 3 ? 0 : 1,
            transform: "translateX(-50%) translateY(-50%)",
          }}
        ></div>
      </div>

      {/* Connection Lines (Mobile) */}
      {/* Adjusted top and bottom to align with icon centers and prevent overshoot */}
      <div className="md:hidden absolute left-1/2 top-10 bottom-24 w-0.5 bg-white/10 -translate-x-1/2 border-l border-dashed border-gray-700 z-0">
        {/* Energy Ball / Pulse (Vertical) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-transparent via-yellow-500 to-transparent blur-sm transition-all duration-[2000ms] ease-linear"
          style={{
            top: activeStep === 1 ? "0%" : activeStep === 2 ? "50%" : "100%",
            opacity: activeStep === 3 ? 0 : 1, // Hide when finished
            transform: "translateY(-50%) translateX(-50%)",
          }}
        ></div>
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] transition-all duration-[2000ms] ease-linear z-10"
          style={{
            top: activeStep === 1 ? "0%" : activeStep === 2 ? "50%" : "100%",
            opacity: activeStep === 3 ? 0 : 1,
            transform: "translateY(-50%) translateX(-50%)",
          }}
        ></div>
      </div>

      {steps.map((item, idx) => {
        const isActive = idx + 1 <= activeStep;
        const isCurrent = idx + 1 === activeStep;

        return (
          <ScrollReveal key={idx} delay={idx * 150} className="w-full">
            {/* Changed: Removed opacity-60 from wrapper.
                            Now opacity logic is handled by changing text/icon color to gray-700 (darker) 
                            and keeping background solid.
                        */}
            <div
              className={`relative z-10 flex flex-col items-center text-center group transition-all duration-500 ${
                isActive ? "scale-105" : "scale-100"
              }`}
            >
              {/* Changed: 
                               - inactive bg is #111 (solid) to cover the line
                               - inactive text is gray-700 to simulate "dimmed" state
                            */}
              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-500 mb-6 relative shadow-2xl ${
                  isActive
                    ? "bg-[#1a1a1a] border border-yellow-500 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                    : "bg-[#111] border border-white/10 text-gray-700"
                }`}
              >
                <Icon
                  name={item.icon}
                  size={24}
                  className={`md:w-8 md:h-8 transition-transform duration-500 ${
                    isCurrent ? "scale-110" : "scale-100"
                  }`}
                />
                <div
                  className={`absolute -top-3 -right-3 w-8 h-8 rounded-full font-black flex items-center justify-center text-xs shadow-lg transition-colors duration-500 ${
                    isActive
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-600"
                  }`}
                >
                  {item.step}
                </div>
              </div>
              <h3
                className={`text-lg md:text-xl font-bold mb-2 transition-colors duration-500 ${
                  isActive ? "text-white" : "text-gray-700"
                }`}
              >
                {item.title}
              </h3>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
};

const TiltCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
};

const ScrollReveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const TradingChartVisual = ({
  height = "100%",
  isPumping,
  showGrid = true,
}) => {
  const [chartData, setChartData] = useState(() => {
    const startPrice = 94231;
    return Array.from({ length: 60 }, (_, i) => ({
      value: startPrice + Math.random() * 50,
      id: i,
    }));
  });

  const { chartMin, chartMax } = useMemo(() => {
    if (chartData.length === 0) return { chartMin: 0, chartMax: 100 };
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 10;
    return { chartMin: min - padding, chartMax: max + padding };
  }, [chartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        if (prev.length === 0) return prev;
        const lastVal = prev[prev.length - 1].value;
        let change;
        if (isPumping) {
          change = Math.random() * 100 + 20;
        } else {
          const target = 94231;
          const diff = target - lastVal;
          change = diff * 0.05 + (Math.random() - 0.5) * 50;
        }
        const newValue = lastVal + change;
        return [...prev.slice(1), { value: newValue, id: Date.now() }];
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPumping]);

  const getChartPath = () => {
    if (chartData.length === 0) return "";
    const range = chartMax - chartMin || 1;
    const points = chartData.map((d, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = 100 - ((d.value - chartMin) / range) * 100;
      return `${x},${y}`;
    });
    return `M${points.join(" L")}`;
  };

  return (
    <div className={`w-full relative overflow-hidden`} style={{ height }}>
      {showGrid && (
        <>
          <div className="absolute inset-0 flex justify-between opacity-10 pointer-events-none">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-full w-px bg-white"></div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-px bg-white"></div>
            ))}
          </div>
        </>
      )}
      <svg
        className="absolute inset-0 w-full h-full px-0 py-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`chartGradient-${isPumping}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={isPumping ? "#10B981" : "#EAB308"}
              stopOpacity="0.4"
            />
            <stop
              offset="100%"
              stopColor={isPumping ? "#10B981" : "#EAB308"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path
          d={`${getChartPath()} L 100,100 L 0,100 Z`}
          fill={`url(#chartGradient-${isPumping})`}
          className="transition-all duration-500"
        />
        <path
          d={getChartPath()}
          fill="none"
          stroke={isPumping ? "#10B981" : "#EAB308"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
};

const HeroShowcaseInterface = () => {
  const [leverage, setLeverage] = useState(50);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(94231.45);
  const [isBuyActive, setIsBuyActive] = useState(false);
  const [isPumping, setIsPumping] = useState(false);
  const [isTradeActive, setIsTradeActive] = useState(false);
  const entryPrice = 94231.45;

  useEffect(() => {
    const runSimulation = async () => {
      while (true) {
        setLeverage(10);
        setAmount("");
        setIsBuyActive(false);
        setIsPumping(false);
        setIsTradeActive(false);
        setPrice(94231.45);

        await new Promise((r) => setTimeout(r, 1000));
        for (let i = 10; i <= 50; i += 2) {
          setLeverage(i);
          await new Promise((r) => setTimeout(r, 20));
        }
        await new Promise((r) => setTimeout(r, 500));
        const targetAmount = "1.500,00";
        for (let i = 1; i <= targetAmount.length; i++) {
          setAmount(targetAmount.substring(0, i));
          await new Promise((r) => setTimeout(r, 100));
        }
        await new Promise((r) => setTimeout(r, 500));
        setIsBuyActive(true);
        await new Promise((r) => setTimeout(r, 300));
        setIsBuyActive(false);
        await new Promise((r) => setTimeout(r, 100));
        setIsBuyActive(true);
        setIsTradeActive(true);
        setIsPumping(true);
        const startP = 94231.45;
        const endP = 98450.0;
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
          const p = startP + (endP - startP) * (i / steps);
          setPrice(p + (Math.random() - 0.5) * 200);
          await new Promise((r) => setTimeout(r, 30));
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    };
    runSimulation();
  }, []);

  const margin = parseFloat(amount.replace(/\./g, "").replace(",", ".")) || 0;
  const positionSize = margin * leverage;
  const pnlValue = ((price - entryPrice) / entryPrice) * positionSize;
  const pnlPercent = ((price - entryPrice) / entryPrice) * leverage * 100;
  const formatEU = (num) =>
    num.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="relative w-full h-full group">
      <div className="absolute inset-0 bg-[#111] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans pointer-events-none select-none z-20">
        <div className="h-8 border-b border-white/5 flex items-center px-4 justify-between bg-black/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <Icon name="Activity" size={10} className="text-yellow-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white">
              BTC/USDT Futures Trading
            </span>
          </div>
          <Icon name="Maximize" size={12} className="text-gray-500" />
        </div>

        <div className="flex flex-1 relative overflow-hidden">
          <div className="flex-1 relative border-r border-white/5 p-4 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div
                  className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${
                    isPumping ? "text-emerald-400" : "text-white"
                  }`}
                >
                  ${formatEU(price)}
                </div>
                <div
                  className={`text-[10px] font-bold flex items-center gap-1 ${
                    isPumping ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  <Icon name="TrendingUp" size={10} />
                  {isPumping ? "+4,48%" : "+0,00%"}
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute top-3 right-3 flex gap-1 z-10">
                {["15m", "1H", "4H"].map((t) => (
                  <div
                    key={t}
                    className={`px-2 py-1 rounded text-[9px] font-bold ${
                      t === "15m" ? "bg-white/10 text-white" : "text-gray-500"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <TradingChartVisual height="100%" isPumping={isPumping} />
            </div>
          </div>

          <div className="w-60 bg-[#0b0b0b] p-4 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-white">
              <Icon
                name="ArrowUp"
                className="text-yellow-500"
                size={16}
                strokeWidth={3}
              />
              <span className="font-bold text-sm">Open Position</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#1a1a1a] border border-yellow-500/20 rounded text-[9px] font-bold text-yellow-500 flex items-center justify-center py-2">
                CROSS
              </div>
              <div className="flex-[1.5] bg-[#1a1a1a] border border-white/5 rounded px-2 py-2 flex justify-between items-center">
                <span className="text-[9px] text-gray-400 font-bold">
                  LEVERAGE
                </span>
                <span className="text-[10px] text-yellow-500 font-bold">
                  {leverage}x
                </span>
              </div>
            </div>
            <div className="px-1">
              <input
                type="range"
                min="1"
                max="100"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[8px] text-gray-600 mt-2 font-mono">
                <span>1x</span>
                <span>20x</span>
                <span>50x</span>
                <span>100x</span>
              </div>
            </div>
            <div className="flex bg-[#1a1a1a] rounded p-0.5 border border-white/5">
              <div className="flex-1 py-1.5 text-[9px] font-bold text-gray-500 text-center">
                Limit
              </div>
              <div className="flex-1 py-1.5 text-[9px] font-bold text-white bg-white/10 rounded shadow-sm text-center">
                Market
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[8px] text-gray-500 mb-1.5 font-bold">
                <span>AMOUNT</span>
                <span>Avail: 10.000,00</span>
              </div>
              <div
                className={`bg-[#1a1a1a] border rounded px-2 py-2 flex justify-between items-center transition-colors ${
                  amount ? "border-yellow-500/50" : "border-white/10"
                }`}
              >
                <span className="text-sm font-mono text-white h-5 flex items-center">
                  {amount || <span className="text-gray-600">0,00</span>}
                </span>
                <span className="text-[9px] font-bold text-gray-500">USDT</span>
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="w-3.5 h-3.5 border border-gray-600 rounded bg-transparent"></div>
              <span className="text-[9px] text-gray-500 font-bold">TP/SL</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div
                className={`border rounded-lg py-3 flex flex-col items-center justify-center transition-all duration-200 ${
                  isBuyActive
                    ? "bg-emerald-500 border-emerald-400 scale-95 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    : "bg-[#0f2e1b] border-emerald-500/20"
                }`}
              >
                <span
                  className={`text-[10px] font-black ${
                    isBuyActive ? "text-black" : "text-emerald-500"
                  }`}
                >
                  BUY /
                </span>
                <span
                  className={`text-[12px] font-black ${
                    isBuyActive ? "text-black" : "text-emerald-500"
                  }`}
                >
                  LONG
                </span>
              </div>
              <div className="bg-[#2e1215] border border-rose-500/20 rounded-lg py-3 flex flex-col items-center justify-center opacity-50">
                <span className="text-[10px] font-black text-rose-500">
                  SELL /
                </span>
                <span className="text-[12px] font-black text-rose-500">
                  SHORT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`absolute -left-4 bottom-60 bg-[#1a1a1a] p-3 rounded-xl border border-white/10 shadow-2xl z-30 flex items-center gap-3 transition-all duration-500 ${
          isTradeActive
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
          <Icon name="Zap" size={16} />
        </div>
        <div>
          <div className="text-[9px] text-gray-400 uppercase font-bold">
            New Trade
          </div>
          <div className="text-xs font-bold text-white">Long BTC 50x</div>
        </div>
      </div>
      <div
        className={`absolute -left-8 bottom-32 bg-[#1a1a1a] p-3 rounded-xl border border-white/10 shadow-2xl z-30 flex items-center gap-3 transition-all duration-500 delay-100 ${
          isTradeActive
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
          <Icon name="TrendingUp" size={16} />
        </div>
        <div>
          <div className="text-[9px] text-gray-400 uppercase font-bold">
            PNL ({formatEU(pnlPercent)}%)
          </div>
          <div className="text-xs font-bold text-emerald-400">
            +${formatEU(pnlValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

const WinBigDashboard = () => {
  const [messages, setMessages] = useState([]);

  // Simulate incoming messages
  useEffect(() => {
    const potentialMessages = [
      {
        type: "long",
        pair: "BTC/USDT",
        leverage: "50x",
        text: "Opened Long",
        color: "emerald",
      },
      {
        type: "short",
        pair: "ETH/USDT",
        leverage: "25x",
        text: "Opened Short",
        color: "rose",
      },
      {
        type: "profit",
        amount: "+$450.20",
        percent: "12%",
        text: "Take Profit",
        color: "yellow",
      },
      {
        type: "long",
        pair: "SOL/USDT",
        leverage: "20x",
        text: "Opened Long",
        color: "emerald",
      },
      {
        type: "profit",
        amount: "+$1,240.00",
        percent: "45%",
        text: "Take Profit",
        color: "yellow",
      },
    ];

    const interval = setInterval(() => {
      const randomMsg =
        potentialMessages[Math.floor(Math.random() * potentialMessages.length)];
      const id = Date.now();
      setMessages((prev) => {
        const updated = [...prev, { ...randomMsg, id }];
        if (updated.length > 4) updated.shift(); // Keep only last 4
        return updated;
      });
    }, 1500); // New message every 1.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#0b0b0b] rounded-xl border border-white/10 overflow-hidden flex flex-col relative shadow-2xl">
      {/* Header Bar */}
      <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between z-20 relative">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
        </div>
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          Live Positions
        </div>
        <Icon name="Activity" size={12} className="text-gray-500" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-end p-6">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Background Chart (Always Winning/Up) */}
        <div className="absolute inset-0 z-0 opacity-40">
          <TradingChartVisual isPumping={true} showGrid={false} />
        </div>

        {/* Foreground: Floating Messages */}
        <div className="relative z-10 flex flex-col gap-3">
          {/* --- NEW: IO LOGO ADDED HERE --- */}
          <div className="flex justify-center pb-2 opacity-80">
            <IOLogo size={40} />
          </div>

          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className="animate-slide-up flex items-center justify-between bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-lg transform transition-all hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.color === "emerald"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : msg.color === "rose"
                      ? "bg-rose-500/20 text-rose-500"
                      : "bg-yellow-500/20 text-yellow-500"
                  }`}
                >
                  <Icon
                    name={
                      msg.color === "yellow"
                        ? "Trophy"
                        : msg.color === "emerald"
                        ? "TrendingUp"
                        : "TrendingDown"
                    }
                    size={16}
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {msg.text}
                    {msg.pair && (
                      <span className="opacity-50 font-normal">{msg.pair}</span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold ${
                      msg.color === "emerald"
                        ? "text-emerald-400"
                        : msg.color === "rose"
                        ? "text-rose-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {msg.amount
                      ? `${msg.amount} (${msg.percent})`
                      : `${msg.leverage} Leverage`}
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono">Just now</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FutureMarket = () => {
  const [activeNetwork, setActiveNetwork] = useState("BSC");
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);

  // --- UPDATED TICKER DATA ---
  const tickerItems = [
    { symbol: "BTC", price: 94231.45, change: 0.57 },
    { symbol: "ETH", price: 3452.12, change: -0.55 },
    { symbol: "SOL", price: 148.6, change: 0.86 },
    { symbol: "BNB", price: 592.3, change: -0.86 },
    { symbol: "XRP", price: 0.62, change: 1.2 },
    { symbol: "ADA", price: 0.45, change: -0.3 },
    { symbol: "DOGE", price: 0.16, change: 4.5 },
    { symbol: "AVAX", price: 35.4, change: 2.1 },
  ];
  const scrollingTickerData = [...tickerItems, ...tickerItems];

  // --- LIVE MARKET DATA FOR SECTION 4 ---
  const [liveMarketData, setLiveMarketData] = useState([
    { symbol: "BTC", name: "Bitcoin", price: 90491.0, change: 1.43 },
    { symbol: "ETH", name: "Ethereum", price: 3119.54, change: 0.5 },
    { symbol: "BNB", name: "BNB", price: 887.91, change: 2.04 },
    { symbol: "SOL", name: "Solana", price: 132.88, change: 2.39 },
  ]);

  // Simulate subtle price movement for "Live" section
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMarketData((prev) =>
        prev.map((coin) => ({
          ...coin,
          price: coin.price * (1 + (Math.random() - 0.5) * 0.0005),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const networkIcons = {
    Polygon: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M283.3,136.7l-60.6-36c-5.7-2.8-12.3-2.8-18,0l-40.7,24.6-27.5,16.1v-23.7l26.5-16.1v-24.6c0-6.6-2.8-12.3-8.5-15.2l-58.7-35.1c-5.7-2.8-12.3-2.8-18,0L18,61.9c-5.7,2.8-8.5,9.5-8.5,15.2v71.1c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l40.7-23.7v26.5h0v22.7c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l59.7-35.1c5.7-2.8,8.5-9.5,8.5-15.2v-71.1c0-6.6-2.8-12.3-8.5-15.2l.9-.9ZM95.7,166.1c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-37.9c0-6.6,2.8-12.3,8.5-15.2l32.2-19c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5-15.2v24.6h0v23.7l-40.7,24.6v-.9ZM263.4,205.9c0,6.6-2.8,12.3-8.5,15.2l-32.2,19c-5.7-2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-24.6l-27.5,16.1v-23.7l27.5-16.1,40.7-23.7c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5-15.2,0,0,0,37.9,0,37.9Z" />
      </svg>
    ),
    BSC: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M176.5,241.3v30.7l-26.9,16.1-26.1-16.1v-30.7l26.1,16.1,26.9-16.1ZM32.2,133.9l26.1,16.1v53l45.3,26.9v30.7l-71.4-42.2v-85.2.8ZM267,133.9v85.2l-72.1,42.2v-30.7l45.3-26.9v-53l26.9-16.1v-.8ZM194.9,92.4l26.9,16.1h0v30.7l-45.3,26.9v53.7l-26.1,16.1-26.1-16.1v-53.7l-46.8-26.9v-30.7l26.9-16.1,45.3,26.9,45.3-26.9ZM77.5,160.7l26.1,16.1v30.7l-26.1-16.1v-30.7ZM221.8,160.7v30.7l-26.1,16.1v-30.7l26.1-16.1ZM58.3,64.8l26.9,16.1-26.9,16.1v30.7l-26.1-16.1v-30.7s26.1-16.1,26.1-16.1ZM240.9,64.8l26.9,16.1v30.7l-26.9,16.1v-30.7l-26.1-16.1s26.1-16.1,26.1-16.1ZM149.6,64.8l26.9,16.1-26.9,16.1-26.1-16.1,26.1-16.1ZM149.6,11.9l72.1,42.2-26.1,16.1-45.3-26.9-46,26.9-26.1-16.1S149.6,11.9,149.6,11.9Z" />
      </svg>
    ),
    Avalanche: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M150,5.8C70.4,5.8,5.8,70.4,5.8,150s64.6,144.2,144.2,144.2,144.2-64.6,144.2-144.2S229.6,5.8,150,5.8ZM137.7,190.8v.2c-3.3,5.6-4.9,8.4-7.2,10.6-2.4,2.3-5.4,4-8.6,5-2.9.8-6.2.8-12.8.8h-21.4l-5.3,8.2h-.2c0-.1,5.2-8.2,5.2-8.2h-6.3c-5.9,0-8.8,0-10.6-1.1-1.9-1.2-3.1-3.3-3.2-5.6-.1-2.1,1.3-4.6,4.3-9.7l69.1-121.8c2.9-5.2,4.4-7.8,6.3-8.7,2-1,4.4-1,6.4,0,1.9,1,3.4,3.5,6.3,8.7l8,13.9,6.6-10.3h.2c0,.1-6.7,10.5-6.7,10.5l6.1,10.7h0c3.2,5.7,4.8,8.5,5.5,11.4.8,3.2.8,6.6,0,9.8-.7,3-2.3,5.8-5.5,11.4l-36.3,64.2ZM229.4,190.8c0,.2.2.3.3.5,2.8,4.8,4.2,7.3,4.1,9.3-.1,2.3-1.3,4.4-3.2,5.6-1.8,1.2-4.7,1.2-10.7,1.2h-27.2l-32.8,50.8h-.2c0-.1,32.7-50.8,32.7-50.8h-12.6c-5.9,0-8.9,0-10.6-1.1-1.9-1.2-3.1-3.3-3.2-5.6-.1-2.1,1.4-4.6,4.3-9.7h0c0-.1,20-34.5,20-34.5,2.9-5.1,4.4-7.6,6.3-8.5,2-1,4.4-1,6.4,0,1.8.9,3.3,3.3,6.1,8.1l.2.4,7.6,13,34.9-54h.2c0,.1-35,54.3-35,54.3l12.4,21.2Z" />
        <polygon points="167.7 83 87.5 207.4 87.8 207.4 167.9 83.3 167.7 83" />
        <polygon points="174.6 72.9 174.3 72.8 167.7 83 167.9 83.3 174.6 72.9" />
        <polygon points="82.2 215.5 82.5 215.6 87.8 207.4 87.5 207.4 82.2 215.5" />
        <polygon points="192.4 207.4 192.7 207.4 217 169.7 216.9 169.4 192.4 207.4" />
        <polygon points="159.7 258.1 159.9 258.2 192.7 207.4 192.4 207.4 159.7 258.1" />
        <polygon points="251.8 115.4 216.9 169.4 217 169.7 252 115.5 251.8 115.4" />
      </svg>
    ),
  };

  const footerLinks = {
    company: [
      { name: "About", url: "https://iotrader.io/about" },
      { name: "Careers", url: "https://iotrader.io/careers" },
      { name: "Privacy Policy", url: "https://iotrader.io/privacy-policy" },
      {
        name: "Terms and Conditions",
        url: "https://iotrader.io/terms-and-conditions",
      },
    ],
    trading: [
      {
        name: "Price Predictions",
        url: "https://iotrader.io/price-prediction",
      },
      { name: "Futures Trading", url: "https://iotrader.io/future-trading" },
      { name: "Market Predictions", url: "https://iotrader.io/markets" },
      { name: "User Dashboard", url: "https://iotrader.io/user-dashboard" },
    ],
    support: [
      { name: "Help Center", url: "https://iotrader.io/help-center" },
      { name: "Contact Us", url: "https://iotrader.io/contact" },
      { name: "Public API", url: "https://iotrader.io/public-api" },
      {
        name: "Documentation",
        url: "https://iotrader.gitbook.io/iotrader-docs/",
      },
    ],
    community: [
      {
        name: "Telegram Channel",
        url: "https://t.me/iotradersio",
        icon: <Icon name="Send" size={16} />,
      },
      {
        name: "Telegram Chat",
        url: "https://t.me/iotradersiochat",
        icon: <Icon name="Send" size={16} />,
      },
      {
        name: "Youtube",
        url: "https://www.youtube.com/@iotraderio",
        icon: <Icon name="Youtube" size={16} />,
      },
      {
        name: "Twitter (X)",
        url: "https://x.com/iotradersio?s=21",
        icon: <Icon name="Twitter" size={16} />,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      <SEO
        title="Future Markets - Cryptocurrency Futures Trading"
        description="Trade cryptocurrency futures with high leverage on IO Trader. Access perpetual contracts for BTC, ETH, SOL, BNB and more. Real-time prices, orderbooks, and advanced trading tools."
        keywords="futures trading, cryptocurrency futures, perpetual contracts, BTC futures, ETH futures, leverage trading, derivatives, crypto trading"
        url="/future-trading"
      />
      {/* 0. GLOBAL ANIMATION STYLES */}
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); } 
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float-delay {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-delay {
          animation: float-delay 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(234, 179, 8, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .animate-scanline {
            animation: scanline 4s linear infinite;
        }
        @keyframes grid-slide {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
        }
        @keyframes scan {
            0% { top: -10%; }
            100% { top: 110%; }
        }
        @keyframes slide-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
        }
        
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* BACKGROUND (CANVAS STARFIELD) */}
      <WarpSpeedBackground />

      {/* HEADER OVERLAY */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-[#050505] via-[#050505] to-transparent z-[1] pointer-events-none"></div>

      {/* 1. TOP TICKER BAR */}
      <div className="w-full bg-[#080808] border-b border-white/5 h-10 flex items-center overflow-hidden relative z-[101]">
        <div className="flex select-none w-full">
          <div className="flex shrink-0 animate-scroll min-w-full">
            {scrollingTickerData.map((item, i) => (
              <div
                key={`a-${i}`}
                className="flex items-center mx-8 space-x-2 text-xs font-medium"
              >
                <span className="text-gray-400 font-bold tracking-wider">
                  {item.symbol}/USDT
                </span>
                <span className="text-white font-mono">
                  $
                  {item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`${
                    item.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  } font-bold`}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change}%
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex shrink-0 animate-scroll min-w-full"
            aria-hidden="true"
          >
            {scrollingTickerData.map((item, i) => (
              <div
                key={`b-${i}`}
                className="flex items-center mx-8 space-x-2 text-xs font-medium"
              >
                <span className="text-gray-400 font-bold tracking-wider">
                  {item.symbol}/USDT
                </span>
                <span className="text-white font-mono">
                  $
                  {item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`${
                    item.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  } font-bold`}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION HEADER */}
      <Header activePage="future-trading" />

      {/* CONTENT WRAPPER */}
      <div>
      {/* 3. HERO SECTION (Massive 3D Impact) */}
      <section className="relative pt-6 pb-10 lg:pt-10 lg:pb-20 px-4 overflow-hidden relative z-10">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          {/* Left: Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 drop-shadow-2xl uppercase">
              PREDICT THE <br />
              <span className="text-yellow-500 drop-shadow-[0_0_35px_rgba(234,179,8,0.5)]">
                FUTURE MARKET
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the next evolution of decentralized trading. Use
              AI-driven insights to predict market movements and earn instant
              payouts with{" "}
              <span className="text-white font-bold">up to 100x leverage</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button className="group relative px-8 py-4 bg-yellow-500 rounded-xl font-black text-black text-lg overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
                <span className="relative flex items-center gap-2">
                  START TRADING
                  <Icon name="ArrowRight" size={20} strokeWidth={3} />
                </span>
              </button>
              <button className="group px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white text-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
                <span className="flex items-center gap-2">
                  LEARN MORE
                  <Icon
                    name="FileText"
                    size={18}
                    fill="currentColor"
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Right: 3D Visual - THE NEW SHOWCASE */}
          <div className="relative h-[500px] w-full hidden lg:block perspective-container">
            <TiltCard className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-[90%] h-[90%] bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="w-[110%] h-[90%] transform rotate-y-[-10deg] rotate-x-[5deg] transition-all duration-500 hover:rotate-0 hover:scale-105 z-20">
                <HeroShowcaseInterface />
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 1: Win Big with Predictions & Futures (TEXT LEFT, ANIMATION RIGHT) */}
      {/* ========================================= */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Accent */}
        <AuroraBackground />

        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content (Left) */}
            <ScrollReveal>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight uppercase">
                  WIN BIG WITH <br />
                  <span className="text-yellow-500">PREDICTIONS & FUTURES</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Make accurate price predictions or leverage your positions
                  with futures trading. Maximize your profits on every market
                  move with our lightning-fast execution engine.
                </p>
                <AnimatedBorderButton className="mx-auto lg:mx-0">
                  FUTURES TRADING
                  <Icon
                    name="ArrowRight"
                    size={20}
                    strokeWidth={3}
                    className="ml-2"
                  />
                </AnimatedBorderButton>
              </div>
            </ScrollReveal>

            {/* Dashboard Animation (Right) */}
            <ScrollReveal delay={200}>
              <div className="relative group perspective-container h-[400px] flex items-center justify-center w-full">
                <TiltCard className="w-full max-w-md h-full">
                  <WinBigDashboard />
                </TiltCard>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 2: Predict & Trade Crypto Futures Today (REFINED) */}
      {/* ========================================= */}
      <section className="py-20 relative z-10">
        <PerspectiveGridBackground />
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
          {/* New Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Video in Square Container (Mobile Order 2) */}
            {/* Moved order classes to ScrollReveal (the grid item) */}
            <ScrollReveal className="order-2 lg:order-1">
              <div className="relative flex items-center justify-center order-2 lg:order-1">
                {/* UPDATED BACKGROUND GLOW: Shaped to the box */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-yellow-500/5 blur-[50px] rounded-3xl -z-10 pointer-events-none"></div>

                {/* Video Container with Gold Gradient Stroke (1px) */}
                <div className="relative z-10 w-[400px] h-[400px] rounded-3xl p-[1px] bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 shadow-2xl group cursor-pointer">
                  {/* Inner Container: Black background with subtle gold inset glow at edges */}
                  <div className="w-full h-full rounded-3xl bg-black overflow-hidden relative flex items-center justify-center shadow-[inset_0_0_60px_rgba(234,179,8,0.15)]">
                    {/* DUST PARTICLES OVERLAY */}
                    <DustParticles />

                    {/* Video: Squared, Overlay effect, Scales on hover */}
                    <video
                      src="https://i.imgur.com/AvmsJPd.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-[85%] h-[85%] object-cover rounded-2xl mix-blend-screen opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 relative z-0"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: Header & Features List (Mobile Order 1) */}
            {/* Moved order classes to ScrollReveal (the grid item) */}
            <ScrollReveal delay={200} className="order-1 lg:order-2">
              <div className="space-y-8 order-1 lg:order-2">
                <div>
                  <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 uppercase">
                    PREDICT & TRADE <br />
                    <span className="text-yellow-500">CRYPTO FUTURES</span>{" "}
                    TODAY
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    IOTrading offers powerful prediction markets and futures
                    trading with high leverage.
                  </p>
                </div>

                {/* Features List - Description Removed, Tighter Spacing */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: "Predict Price Movements", icon: "TrendingUp" },
                    { title: "High-Leverage Futures", icon: "Zap" },
                    { title: "Non-Custodial Trading", icon: "Wallet" },
                    { title: "Compete & Win", icon: "Trophy" },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 group w-fit cursor-default"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                        <Icon name={feature.icon} size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <AnimatedBorderButton>
                    ALL MARKETS
                    <Icon
                      name="ArrowRight"
                      size={20}
                      strokeWidth={3}
                      className="ml-2"
                    />
                  </AnimatedBorderButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 4.5: About Project (New Section) */}
      {/* ========================================= */}
      <section className="py-20 relative z-10 overflow-hidden bg-[#050505]">
        {/* Simple dark gradient background */}
        <CircuitNetworkBackground />

        {/* Subtle Side Glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
          {/* Swapped Layout: Text Left, Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <ScrollReveal>
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 leading-tight uppercase">
                    POWERING THE FUTURE OF <br />
                    <span className="text-yellow-500">
                      DECENTRALIZED TRADING
                    </span>
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    IO Trader is built on a robust, high-performance
                    infrastructure designed to provide traders with the fastest
                    execution speeds and lowest fees. Our decentralized
                    architecture ensures transparency and security for every
                    transaction.
                  </p>
                </div>

                {/* Feature Points */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: "Lightning Fast Execution", icon: "Zap" },
                    { title: "24/7 Support", icon: "Headphones" },
                  ].map((feature, idx) => (
                    /* Added w-fit to fix hover issue */
                    <div
                      key={idx}
                      className="flex items-center gap-4 group w-fit cursor-default"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                        <Icon
                          name={
                            feature.icon === "Headphones"
                              ? "Activity"
                              : feature.icon
                          }
                          size={24}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <AnimatedBorderButton>
                    PRICE PREDICTION
                    <Icon
                      name="ArrowRight"
                      size={20}
                      strokeWidth={3}
                      className="ml-2"
                    />
                  </AnimatedBorderButton>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: Image in Square Container */}
            <ScrollReveal delay={200}>
              <div className="relative flex items-center justify-center">
                {/* UPDATED BACKGROUND GLOW: Shaped to the box */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-yellow-500/20 blur-[60px] rounded-3xl -z-10 pointer-events-none"></div>

                {/* Image Container with Gold Gradient Stroke (1px) */}
                <div className="relative z-10 w-[400px] h-[400px] rounded-3xl p-[1px] bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 shadow-2xl group cursor-pointer">
                  {/* Inner Container: Black background with subtle gold inset glow at edges */}
                  <div className="w-full h-full rounded-3xl bg-black overflow-hidden relative flex items-center justify-center shadow-[inset_0_0_60px_rgba(234,179,8,0.15)]">
                    {/* DUST PARTICLES OVERLAY */}
                    <DustParticles />

                    {/* Image: Squared, Normal Blend Mode, Full Size */}
                    <img
                      src="https://i.imgur.com/KovViGN.jpeg"
                      alt="IO Trader Ecosystem"
                      className="w-full h-full object-cover rounded-3xl opacity-100 transition-transform duration-700 ease-out group-hover:scale-105 relative z-0"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 3: Trusted Platform Info */}
      {/* ========================================= */}
      <section className="py-20 bg-[#0a0a0a] border-y border-white/5 relative z-10 overflow-hidden">
        {/* Added Grid Background - Removed opacity-40 constraint */}
        <div className="absolute inset-0 opacity-100 pointer-events-none">
          <SquaredGridBackground />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 uppercase">
                BUILT FOR{" "}
                <span className="text-yellow-500">SECURITY & RELIABILITY</span>
              </h2>
              <p className="text-gray-400">
                Here are a few reasons why you should choose IOTrading for
                predictions and futures
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Audited Smart Contracts",
                desc: "Our smart contracts undergo rigorous audits by top-tier security firms to ensure maximum safety for your funds and transaction integrity.",
                icon: "CheckCircle2",
              },
              {
                title: "Non-Custodial Architecture",
                desc: "You retain full control of your private keys and assets. Trade directly from your wallet without ever depositing funds into a centralized exchange.",
                icon: "Lock",
              },
              {
                title: "Real-Time Risk Engine",
                desc: "Advanced risk management systems monitor market conditions 24/7 to protect the platform's solvency and ensure fair liquidation processes.",
                icon: "Shield",
              },
            ].map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 150}>
                <div className="flex flex-col h-full p-6 rounded-2xl bg-[#050505] border border-white/5 hover:border-white/10 transition-colors relative z-10">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-6">
                    <Icon name={item.icon} size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm flex-grow leading-relaxed">
                    {item.desc}
                  </p>
                  {/* "LEARN MORE" button removed from here */}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg shadow-lg shadow-yellow-500/20 transition-all">
              WHITEPAPER
            </button>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 4: Live Crypto Market */}
      {/* ========================================= */}
      <section className="py-20 relative overflow-hidden">
        <GoldGridBackground />
        <div className="max-w-5xl mx-auto px-4 lg:px-6 relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl font-black text-white mb-10 flex items-center gap-3 uppercase">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Live <span className="text-yellow-500">Crypto</span> Market
            </h2>
          </ScrollReveal>

          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm bg-opacity-80">
            {/* Removed overflow-x-auto wrappers, adjusted padding and text sizes for mobile */}
            <div className="grid grid-cols-4 bg-white/5 p-2 sm:p-4 text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">Asset</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-1 text-right">Change (24h)</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            {liveMarketData.map((coin, idx) => (
              <div
                key={coin.symbol}
                className="grid grid-cols-4 p-2 sm:p-4 border-t border-white/5 items-center hover:bg-white/5 transition-colors group"
              >
                <div className="col-span-1 flex items-center gap-2 sm:gap-3">
                  {/* Hidden on mobile, visible on sm screens and up. Removed yellow circle container. */}
                  <CryptoIcon
                    symbol={coin.symbol}
                    className="w-8 h-8 hidden sm:block flex-shrink-0"
                  />
                  <div>
                    <div className="font-bold text-white text-[10px] sm:text-sm">
                      {coin.name}
                    </div>
                    <div className="text-[8px] sm:text-xs text-gray-500">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div className="col-span-1 text-right font-mono text-white text-[10px] sm:text-sm">
                  $
                  {coin.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  className={`col-span-1 text-right font-bold text-[10px] sm:text-sm ${
                    coin.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {coin.change > 0 ? "+" : ""}
                  {coin.change.toFixed(2)}%
                </div>
                <div className="col-span-1 text-right">
                  <button className="text-[9px] sm:text-xs font-bold bg-white/10 hover:bg-yellow-500 hover:text-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-all">
                    Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 5: Get Started in a few minutes */}
      {/* ========================================= */}
      <section className="py-20 bg-[#080808] relative z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 uppercase">
                Get started{" "}
                <span className="text-yellow-500">in a few minutes</span>
              </h2>
              <p className="text-gray-400">
                Start predicting prices or trading futures on major
                cryptocurrencies today.
              </p>
            </div>
          </ScrollReveal>

          <AnimatedProcessSteps />
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 6: Final CTA */}
      {/* ========================================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase">
              TRADE FUTURES & <br />
              <span className="text-yellow-500">MAKE PREDICTIONS</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
              Start predicting crypto prices or trading futures with high
              leverage. Win big with every accurate prediction and successful
              trade.
            </p>
            <a
              href="https://t.me/iotradersiochat"
              target="_blank"
              rel="noopener noreferrer"
              className="animate-pulse-glow px-12 py-5 bg-white text-black font-black text-xl rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:bg-yellow-400 hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all flex items-center gap-3 mx-auto w-fit"
            >
              IOTRADER COMMUNITY
              <Icon name="ArrowRight" size={24} />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. FOOTER (Preserved) */}
      <footer className="bg-[#080808] border-t border-white/5 py-12 px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto md:flex md:justify-between grid grid-cols-2 gap-x-8 gap-y-12 md:gap-12">
          {/* Company Column */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trading Column */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Trading
            </h4>
            <ul className="space-y-2">
              {footerLinks.trading.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column */}
          <div className="md:text-right">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Community
            </h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name} className="md:flex md:justify-end">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium group"
                  >
                    <span className="bg-white/5 p-1.5 rounded-md mr-2 group-hover:bg-yellow-500/20 group-hover:text-yellow-500 transition-all">
                      {link.icon}
                    </span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <div className="mb-4 md:mb-0">
            <img
              src="/logo.png"
              alt="IO Trader"
              className="h-5 object-contain"
            />
          </div>
          <p>
            &copy; {new Date().getFullYear()} IO Trader. All rights reserved.
          </p>
        </div>
      </footer>
      </div>
      {/* END CONTENT WRAPPER */}
    </div>
  );
};

export default FutureMarket;
