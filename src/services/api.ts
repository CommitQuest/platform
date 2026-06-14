// API service for communicating with the backend

// Use named npm scripts to choose a backend:
// - npm run dev:local -> http://localhost:3001
// - npm run dev:prod / npm run build:prod -> Heroku production backend
// Normalize: no trailing slash, no surrounding quotes (from .env)
function normalizeBaseUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  return trimmed;
}

const DEFAULT_API_URL = 'https://commit-quest-app-3914e1ae3b5a.herokuapp.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';

// Use REACT_APP_API_URL when set (so localhost can point at Heroku); else localhost -> local backend.
// REACT_APP_USE_LOCAL_BACKEND=true (set by `npm run dev:local`) forces local backend and overrides .env.
function getApiBaseUrl(): string {
  if (process.env.REACT_APP_USE_LOCAL_BACKEND === 'true') {
    return LOCAL_BACKEND_URL;
  }
  const fromEnv = normalizeBaseUrl(process.env.REACT_APP_API_URL);
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return LOCAL_BACKEND_URL;
  }
  return DEFAULT_API_URL;
}

const API_BASE_URL = getApiBaseUrl();

/** Base URL of the backend (for auth redirects, etc.). Respects REACT_APP_API_URL. */
export const getBackendUrl = (): string => getApiBaseUrl();

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
    const url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, config);
    const responseText = await response.text();
    let data: any = null;
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        window.location.href = '/login';
        throw new Error(data?.error || data?.message || 'Authentication required');
      }
      throw new Error(data?.error || data?.message || `API request failed: ${response.status}`);
    }

    return data;
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

// Friends API calls (backend must implement these endpoints)
export const friendsAPI = {
  // List current user's friends (optionally with mutual counts)
  getFriends: () => apiRequest('/api/friends'),
  // Mutual friends only (friends you have in common with others)
  getMutualFriends: () => apiRequest('/api/friends/mutual'),
  // Pending friend requests (sent and received)
  getFriendRequests: () => apiRequest('/api/friends/requests'),
  // Send friend request
  sendFriendRequest: (receiverId: number) =>
    apiRequest('/api/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId }),
    }),
  // Accept friend request
  acceptFriendRequest: (requestId: number) =>
    apiRequest(`/api/friends/requests/${requestId}/accept`, { method: 'POST' }),
  // Reject friend request
  rejectFriendRequest: (requestId: number) =>
    apiRequest(`/api/friends/requests/${requestId}/reject`, { method: 'POST' }),
  // Remove friend
  removeFriend: (friendId: number) =>
    apiRequest(`/api/friends/${friendId}`, { method: 'DELETE' }),
};

// GitHub connections: users you follow or who follow you on GitHub and are on CommitQuest
// Backend uses GitHub API (with user's token) to fetch followers/following, then matches with users table
export const githubConnectionsAPI = {
  getConnections: () => apiRequest('/api/user/github-connections'),
};

// Character API calls
export const characterAPI = {
  // Get character data
  getCharacter: () => apiRequest('/api/character'),

  // Get all classes and species
  getClasses: () => apiRequest('/api/character/classes'),
  getSpecies: () => apiRequest('/api/character/species'),

  // Create first character during onboarding
  createCharacter: (data: { name: string; class_id: number; species_id: number; avatar_option_id?: number }) =>
    apiRequest('/api/character', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update character
  updateCharacter: (data: { name?: string; class_id?: number; species_id?: number; avatar_option_id?: number }) =>
    apiRequest('/api/character', {
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
  // List user's owned backgrounds
  getBackgrounds: () => apiRequest('/api/assets/backgrounds'),
  // Equip a background by id
  equipBackground: (backgroundId: number) =>
    apiRequest('/api/assets/background/equip', {
      method: 'POST',
      body: JSON.stringify({ background_id: backgroundId }),
    }),
  // Get user inventory
  getUserInventory: () => apiRequest('/api/assets/inventory'),
  // Equip a visual/inventory item
  equipItem: (itemId: number, slot?: string | null) =>
    apiRequest('/api/assets/equip', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        ...(slot ? { slot } : {}),
      }),
    }),
  // Unequip an item
  unequipItem: (itemId: number) =>
    apiRequest('/api/assets/unequip', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    }),
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
  friendsAPI,
  githubConnectionsAPI,
  isLoggedIn,
  logout,
};

export default api;