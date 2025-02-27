/**
 * Debug utility to help identify text contrast issues
 * This can be used during development to highlight potential accessibility problems
 */

// Toggle debug mode
let debugStylesEnabled = false;

// Add debug styles to the document
export function enableContrastDebugMode() {
  if (debugStylesEnabled) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'contrast-debug-styles';
  styleElement.innerHTML = `
    /* Highlight elements with potential contrast issues */
    [class*="text-white"], [class*="text-gray-100"], [class*="text-gray-200"] {
      outline: 2px solid red !important;
    }
    
    /* Highlight white or light text on light backgrounds */
    .bg-white [class*="text-white"],
    .bg-gray-50 [class*="text-white"],
    .bg-gray-100 [class*="text-white"],
    .bg-gray-200 [class*="text-white"],
    .bg-white [class*="text-gray-100"],
    .bg-gray-50 [class*="text-gray-100"],
    .bg-gray-100 [class*="text-gray-100"],
    .bg-gray-200 [class*="text-gray-100"] {
      background-color: rgba(255, 0, 0, 0.3) !important;
    }
  `;
  
  document.head.appendChild(styleElement);
  debugStylesEnabled = true;
  console.log('Contrast debug mode enabled. Elements with potential contrast issues are highlighted.');
}

// Remove debug styles
export function disableContrastDebugMode() {
  if (!debugStylesEnabled) return;
  
  const styleElement = document.getElementById('contrast-debug-styles');
  if (styleElement) {
    document.head.removeChild(styleElement);
  }
  
  debugStylesEnabled = false;
  console.log('Contrast debug mode disabled.');
}

// Toggle debug mode
export function toggleContrastDebugMode() {
  if (debugStylesEnabled) {
    disableContrastDebugMode();
  } else {
    enableContrastDebugMode();
  }
}
