// Mock for openapi-fetch to prevent runtime errors
// This provides a minimal implementation that matches the expected API

function createClient(options = {}) {
  // Return a mock client object with the methods that might be called
  return {
    GET: async () => ({ response: { status: 200 }, data: null, error: null }),
    POST: async () => ({ response: { status: 200 }, data: null, error: null }),
    PUT: async () => ({ response: { status: 200 }, data: null, error: null }),
    PATCH: async () => ({ response: { status: 200 }, data: null, error: null }),
    DELETE: async () => ({ response: { status: 200 }, data: null, error: null }),
    OPTIONS: async () => ({ response: { status: 200 }, data: null, error: null }),
    HEAD: async () => ({ response: { status: 200 }, data: null, error: null }),
  };
}

// Export as the default function directly
// This ensures __toESM(require("openapi-fetch")).default is a function
// Webpack's __toESM helper checks for __esModule and uses .default if present
module.exports = createClient;
module.exports.default = createClient;
module.exports.__esModule = true;

