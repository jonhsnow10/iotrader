import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';


const SEO = ({
  title = "IO Trader - Decentralized Prediction Markets & Price Predictions",
  description = "Trade on cryptocurrency price predictions, create prediction markets, and participate in decentralized futures trading. Built on BSC blockchain with real-time price feeds.",
  keywords = "cryptocurrency, prediction markets, price predictions, futures trading, blockchain, BSC, DeFi, trading, BTC, ETH, BNB",
  image = "/logo.png",
  url = "",
  type = "website",
  siteName = "IO Trader"
}) => {
  const location = useLocation();
  const fullTitle = title.includes("IO Trader") ? title : `${title} | IO Trader`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Determine canonical URL: use provided url, or fallback to current pathname
  // Remove query parameters and hash for canonical URL
  let canonicalPath = url || location.pathname;
  // Ensure canonical path starts with /
  if (!canonicalPath.startsWith('/')) {
    canonicalPath = '/' + canonicalPath;
  }
  // Remove trailing slash except for root
  if (canonicalPath !== '/' && canonicalPath.endsWith('/')) {
    canonicalPath = canonicalPath.slice(0, -1);
  }
  const fullUrl = `${siteUrl}${canonicalPath}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="IO Trader" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL - Always present to prevent duplicate content issues */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@iotradersio" />
      <meta name="twitter:site" content="@iotradersio" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="IO Trader" />
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "IO Trader",
          "description": description,
          "url": siteUrl,
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "100"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
