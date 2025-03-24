/**
 * Creates a URL-friendly slug from a given string
 * @param text The text to convert to a slug
 * @returns URL-friendly slug
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except whitespace and hyphens
    .replace(/\s+/g, '-')     // Replace whitespace with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
}; 