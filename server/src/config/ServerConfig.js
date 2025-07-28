import dotenv from "dotenv";
dotenv.config();

// Helper function to clean up the frontend URL
const cleanFrontendUrl = (url) => {
  if (!url) return null;
  
  // Remove any @ symbols and trim whitespace
  let cleanedUrl = url.replace(/@/g, '').trim();
  
  // Ensure it starts with http:// or https://
  if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
    cleanedUrl = 'https://' + cleanedUrl;
  }
  
  return cleanedUrl;
};

export default {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  Frontend_URL: cleanFrontendUrl(process.env.FRONTEND_URL),
};
