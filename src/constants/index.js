import Icon from "../components/Icon";

// Footer links data
export const footerLinks = {
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
      url: "/price-prediction",
    },
    { name: "Futures Trading", url: "/future-trading" },
    { name: "Market Predictions", url: "/markets" },
    { name: "User Dashboard", url: "/user-dashboard" },
    { name: "Create Market", url: "/create-market" },
  ],
  support: [
    { name: "Help Center", url: "https://iotrader.io/help-center" },
    { name: "Contact Us", url: "https://iotrader.io/contact" },
    { name: "Public API", url: "/public-api" },
    { name: "Fees", url: "/fees" },
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

// Network icons
export const networkIcons = {
  Polygon: (
    <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
      <path d="M283.3,136.7l-60.6-36c-5.7-2.8-12.3-2.8-18,0l-40.7,24.6-27.5,16.1v-23.7l26.5-16.1v-24.6c0-6.6-2.8-12.3-8.5-15.2l-58.7-35.1c-5.7-2.8-12.3-2.8-18,0L18,61.9c-5.7,2.8-8.5,9.5-8.5,15.2v71.1c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l40.7-23.7v26.5h0v22.7c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l59.7-35.1c5.7-2.8,8.5-9.5,8.5-15.2v-71.1c0-6.6-2.8-12.3-8.5-15.2l.9-.9ZM95.7,166.1c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-37.9c0-6.6,2.8-12.3,8.5-15.2l32.2-19c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5,15.2v24.6h0v23.7l-40.7,24.6v-.9ZM263.4,205.9c0,6.6-2.8,12.3-8.5,15.2l-32.2,19c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-24.6l-27.5,16.1v-23.7l27.5-16.1,40.7-23.7c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5,15.2,0,0,0,37.9,0,37.9Z" />
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

// Ticker items data
export const tickerItems = [
  { symbol: "BTC", price: 64231.45, change: 0.57 },
  { symbol: "ETH", price: 3452.12, change: -0.55 },
  { symbol: "SOL", price: 148.6, change: 0.86 },
  { symbol: "BNB", price: 592.3, change: -0.86 },
  { symbol: "XRP", price: 0.62, change: 1.2 },
  { symbol: "ADA", price: 0.45, change: -0.3 },
  { symbol: "DOGE", price: 0.16, change: 4.5 },
  { symbol: "AVAX", price: 35.4, change: 2.1 },
];

// Navigation items (main navigation - shown in header)
export const navItems = [
  { name: "Home", href: "/" },
  { name: "Price Prediction", href: "/price-prediction" },
  { name: "Future Trading", href: "/future-trading" },
  { name: "All Markets", href: "/markets" },
];

// More menu items (shown in dropdown)
export const moreMenuItems = [
  { name: "Coins & Markets Info", href: "/coin-market-info" },
  { name: "Fees", href: "/fees" },
  { name: "Public API", href: "/public-api" },
  { name: "Contract Specification", href: "/contract-specification" },
  { name: "User Dashboard", href: "/user-dashboard" },
  { name: "Leaderboard", href: "/leaderboard" },
];
