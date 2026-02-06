// API service for communicating with the backend

// Use local backend when running on localhost (local dev)
const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : (process.env.REACT_APP_API_URL || 'https://commit-quest-app-3914e1ae3b5a.herokuapp.com');

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('commitquest_token');
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return localStorage.getItem('commitquest_logged_in') === 'true' && !!getAuthToken();
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem('commitquest_token');
  localStorage.removeItem('commitquest_logged_in');
};

// Make authenticated API request
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // Get current user info
  getMe: () => apiRequest('/api/auth/web/me'),
  
  // Logout
  logout: () => apiRequest('/api/auth/web/logout', { method: 'POST' }),
  
  // Check installation status
  getInstallationStatus: () => apiRequest('/api/auth/web/installation/status'),
  
  // Get installation URL
  getInstallationUrl: () => apiRequest('/api/auth/web/installation/url'),
};

// User API calls
export const userAPI = {
  // Get user profile
  getUser: (userId: number) => apiRequest(`/api/user/${userId}`),
  
  // Get user character
  getUserCharacter: (userId: number) => apiRequest(`/api/user/${userId}/character`),
  
  // Get user achievements
  getUserAchievements: (userId: number) => apiRequest(`/api/user/${userId}/achievements`),
  
  // Get user data with stats, character, and achievements (for web platform)
  getUserWeb: () => apiRequest('/api/user/web'),
  
  // Search users
  searchUsers: (query: string, params?: Record<string, any>) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return apiRequest(`/api/user/search?${searchParams}`);
  },
  
  // Get leaderboard
  getLeaderboard: (metric?: string, timeframe?: string) => {
    const params = new URLSearchParams();
    if (metric) params.append('metric', metric);
    if (timeframe) params.append('timeframe', timeframe);
    return apiRequest(`/api/user/leaderboard?${params}`);
  },
};

// Character API calls
export const characterAPI = {
  // Get character data
  getCharacter: () => apiRequest('/api/character'),
  
  // Update character
  updateCharacter: (data: any) => apiRequest('/api/character', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Achievement API calls
export const achievementAPI = {
  // Get achievements
  getAchievements: () => apiRequest('/api/achievement'),
  
  // Get user achievements
  getUserAchievements: () => apiRequest('/api/achievement/user'),
};

// Assets API calls
export const assetsAPI = {
  // Get active background
  getActiveBackground: () => apiRequest('/api/assets/background'),
  // Get user inventory
  getUserInventory: () => apiRequest('/api/assets/inventory'),
};

// Stats API calls
export const statsAPI = {
  // Get stats summary
  getStatsSummary: () => apiRequest('/api/stats/summary'),
  
  // Get detailed stats
  getStats: () => apiRequest('/api/stats'),
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard data
  getDashboard: () => apiRequest('/api/dashboard'),
};
const api = {
  authAPI,
  userAPI,
  characterAPI,
  achievementAPI,
  assetsAPI,
  statsAPI,
  dashboardAPI,
  isLoggedIn,
  logout,
};

export default api;