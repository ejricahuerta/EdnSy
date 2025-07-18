// Configuration file for API settings and environment variables

export const config = {
  // API Configuration
  api: {
    host: import.meta.env.VITE_API_HOST || 'http://localhost:5235',
    timeout: 10000, // 10 seconds
  },
  
  // OAuth Configuration
  oauth: {
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:5173/oauth-callback',
  },
  
  // App Configuration
  app: {
    name: 'Ed & Sy',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  
  // Feature Flags
  features: {
    enableDebugLogging: import.meta.env.DEV,
  }
} as const;

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${config.api.host}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

// Helper function to check if we're in development mode
export function isDevelopment(): boolean {
  return config.app.environment === 'development';
} 