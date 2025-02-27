/**
 * A collection of safe utility functions to prevent common JavaScript errors
 */

// Safe version of includes that handles undefined/null values
export function safeIncludes<T>(collection: T[] | string | null | undefined, value: T): boolean {
  if (collection == null) {
    return false;
  }
  return collection.includes(value as any);
}

// Safe object access helper
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  if (obj == null) {
    return undefined;
  }
  return obj[key];
}

// Safe array access helper
export function safeAt<T>(arr: T[] | null | undefined, index: number): T | undefined {
  if (!arr || index < 0 || index >= arr.length) {
    return undefined;
  }
  return arr[index];
}

// Safe string operation helper
export function safeString(value: unknown): string {
  if (value == null) {
    return '';
  }
  return String(value);
}

// Safe JSON parse helper
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) {
    return fallback;
  }
  
  try {
    return JSON.parse(json) as T;
  } catch (err) {
    console.error('Error parsing JSON:', err);
    return fallback;
  }
}
