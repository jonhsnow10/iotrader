// Mock for @metamask/sdk-analytics to prevent openapi-fetch from being loaded
// This is a no-op implementation that provides the same API but doesn't actually send analytics

class Analytics {
  constructor(baseUrl) {
    this.enabled = false;
    this.properties = {};
    // No-op: don't create any client, just store the baseUrl
    this.baseUrl = baseUrl;
  }

  enable() {
    this.enabled = true;
  }

  setGlobalProperty(key, value) {
    this.properties[key] = value;
  }

  track(name, properties) {
    // No-op: analytics tracking is disabled in this mock
    // This prevents openapi-fetch from being used
    if (!this.enabled) {
      return;
    }
    // Silently ignore tracking calls
  }
}

// Get endpoint from environment (matching the original package)
let endpoint;
if (typeof process !== 'undefined' && process.env) {
  endpoint = process.env.METAMASK_ANALYTICS_ENDPOINT || process.env.NEXT_PUBLIC_METAMASK_ANALYTICS_ENDPOINT;
}
const METAMASK_ANALYTICS_ENDPOINT = endpoint || 'https://mm-sdk-analytics.api.cx.metamask.io/';

// Create a default instance (matching the package's export)
const analytics = new Analytics(METAMASK_ANALYTICS_ENDPOINT);

// Export exactly as the package does: { analytics } with __esModule flag
// This matches the CommonJS export structure
const exports = {
  __esModule: true,
  analytics: analytics,
};

// Support both CommonJS and ES module imports
module.exports = exports;
module.exports.default = exports;

