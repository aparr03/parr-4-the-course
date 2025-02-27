import { usingMockData } from '../lib/supabase.ts';

/**
 * Displays a banner when the application is using mock data
 */
const MockDataBanner = () => {
  if (!usingMockData) return null;

  return (
    <div className="bg-yellow-100 text-yellow-800 border-b border-yellow-200 p-2 text-center text-sm font-medium">
      <p>
        <strong>⚠️ Notice:</strong> This application is currently running with mock data.
        Some features may be limited.
      </p>
    </div>
  );
};

export default MockDataBanner;
