/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove leading/trailing hyphens (important after substring)
    .replace(/^-+|-+$/g, '');
};

