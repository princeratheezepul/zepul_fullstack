// Configuration for the application
export const config = {
  // Backend URL - use environment variable or fallback to production URL
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'https://zepul-fullstack.onrender.com',
  
  // Frontend URL - use environment variable or fallback to the correct Vercel URL
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'https://zepul-fullstack-9hgn.vercel.app',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint) => {
  return `${config.backendUrl}${endpoint}`;
};

// Helper function to log configuration (for debugging)
export const logConfig = () => {
  console.log('App Configuration:', {
    backendUrl: config.backendUrl,
    frontendUrl: config.frontendUrl,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    currentLocation: window.location.href,
  });
}; 