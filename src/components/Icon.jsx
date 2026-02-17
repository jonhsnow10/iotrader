import React from "react";

// Icon component with all icons used across the application
const Icon = ({ name, size = 24, className = "", ...props }) => {
  const icons = {
    // Navigation & UI
    ArrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
    ArrowDown: <path d="M12 5v14m-7-7 7 7 7-7" />,
    ArrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
    Wallet: (
      <>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </>
    ),
    ChevronDown: <path d="M6 9l6 6 6-6" />,
    ChevronLeft: <path d="M15 18l-6-6 6-6" />,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    Search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    Filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    ExternalLink: (
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    ),
    Menu: <path d="M3 12h18M3 6h18M3 18h18" />,
    X: <path d="M18 6L6 18M6 6l12 12" />,

    // Updated Flame Icon (Sharper style)
    FlameFilled: (
      <path d="M12 2c0 0-7 5.5-7 11.5S8.5 22 12 22s7-4.5 7-8.5S12 2 12 2zm0 17c-1.1 0-2-.9-2-2 0-2 2-3 2-3s2 1 2 3c0 1.1-.9 2-2 2z" />
    ),

    // Categories
    LayoutGrid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),

    // Globe for Crypto
    Globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
      </>
    ),

    // Libra (Balance Scale) for Politics
    Libra: (
      <>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </>
    ),

    Trophy: (
      <>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </>
    ),
    Tv: (
      <>
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </>
    ),
    Activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    Clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    TrendingUp: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />,
    Check: <polyline points="20 6 9 17 4 12" />,
    CheckCircle: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </>
    ),
    Copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    DollarSign: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
    Shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    Maximize: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      </>
    ),

    // Socials
    Send: (
      <>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </>
    ),
    Youtube: (
      <>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2.85 2.85 0 0 1 2.5-2.5h14a2.85 2.85 0 0 1 2.5 2.5 24.12 24.12 0 0 1 0 10 2.85 2.85 0 0 1-2.5 2.5h-14a2.85 2.85 0 0 1-2.5-2.5z" />
        <polygon points="10 15 15 12 10 9" />
      </>
    ),
    Twitter: (
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 14.6-5.6-4.6-7.8-11 2-12.7-3.7-4-1.8-12.9 6-11.5 3-2 10-1.8 6.7 6.2 0 0 0 0 0z" />
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

export default Icon;
