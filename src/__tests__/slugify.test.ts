import { createSlug } from '../utils/slugify';

describe('Slugify Utility', () => {
  test('converts basic text to slug', () => {
    expect(createSlug('Hello World')).toBe('hello-world');
  });

  test('handles special characters', () => {
    expect(createSlug('Chicken & Waffles!')).toBe('chicken-waffles');
  });

  test('converts uppercase to lowercase', () => {
    expect(createSlug('UPPER CASE')).toBe('upper-case');
  });

  test('trims whitespace', () => {
    expect(createSlug('  Padded String  ')).toBe('padded-string');
  });

  test('handles multiple spaces', () => {
    expect(createSlug('Multiple   Spaces')).toBe('multiple-spaces');
  });

  test('handles multiple hyphens', () => {
    expect(createSlug('already-has---hyphens')).toBe('already-has-hyphens');
  });

  test('handles mixed case and special characters', () => {
    expect(createSlug('Spicy 🔥 Chicken Recipe')).toBe('spicy-chicken-recipe');
  });

  test('returns empty string for empty input', () => {
    expect(createSlug('')).toBe('');
  });

  test('handles non-latin characters properly', () => {
    expect(createSlug('Café au lait')).toBe('caf-au-lait');
  });
}); 