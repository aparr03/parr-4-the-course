/**
 * Safely checks if a collection includes a value by handling undefined and null values
 */
export function safeIncludes<T>(collection: T[] | string | null | undefined, value: T): boolean {
  if (collection == null) {
    return false;
  }
  return collection.includes(value as any);
}
