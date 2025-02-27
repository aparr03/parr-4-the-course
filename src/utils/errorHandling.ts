/**
 * Monkey patch String and Array prototype to make includes method safe
 * This helps prevent "Cannot read properties of undefined" errors
 */
export function installErrorProtections() {
  // Store the original includes methods
  const originalStringIncludes = String.prototype.includes;
  const originalArrayIncludes = Array.prototype.includes;

  // Replace with safe versions
  String.prototype.includes = function(searchString: string, position?: number): boolean {
    if (this === undefined || this === null) {
      console.warn('Called includes() on undefined or null string');
      return false;
    }
    return originalStringIncludes.call(this, searchString, position);
  };

  Array.prototype.includes = function<T>(searchElement: T, fromIndex?: number): boolean {
    if (this === undefined || this === null) {
      console.warn('Called includes() on undefined or null array');
      return false;
    }
    return originalArrayIncludes.call(this, searchElement, fromIndex);
  };

  // Add global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    // Optionally log to a service
    return false;
  });

  console.log('Error protections installed');
}
