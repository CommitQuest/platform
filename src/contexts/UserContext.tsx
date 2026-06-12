import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI, userAPI, assetsAPI, isLoggedIn } from '../services/api';

// User data types
interface Character {
  id: number;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  avatar_option_id?: number | null;
  avatar_assets?: {
    idle?: string;
    celebration?: string;
  };
  avatar_options?: AvatarOption[];
  avatar_url?: string;
  classes?: {
    id: number;
    name: string;
    description: string;
    base_stats: any;
  };
  species?: {
    id: number;
    name: string;
    description: string;
    base_stats: any;
    avatar_url?: string;
    avatar_options?: AvatarOption[];
  };
}

interface AvatarOption {
  id: number;
  idle_url: string;
  celebration_url?: string;
  preview_swatch_hex?: string | null;
  display_order?: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  criteria: any;
  metadata?: any;
}

interface LevelProgress {
  currentLevel: number;
  expInCurrentLevel: number;
  expNeededForNextLevel: number;
  progress: number;
}

interface Background {
  background_1?: string;
  background_2?: string;
  background_3?: string;
  background_4?: string;
  foreground_1?: string;
  foreground_2?: string;
}

interface UserData {
  totalCommits: number;
  streakCount: number;
  experienceGained: number;
  gold: number;
  level: number;
  character: Character | null;
  achievements: Achievement[];
  levelProgress: LevelProgress | null;
}

interface AuthSession {
  user?: {
    id: number;
    github_username: string;
    email?: string;
    avatar_url?: string;
    created_at: string;
    character?: Character | null;
  };
  hasInstallation?: boolean;
  needsInstallation?: boolean;
  hasCharacter?: boolean;
  needsCharacter?: boolean;
  character?: Character | null;
}

interface UserContextType {
  user: UserData | null;
  session: AuthSession | null;
  hasCharacter: boolean | null;
  needsCharacter: boolean;
  background: Background | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  clearUser: () => void;
  refreshBackground: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (): Promise<AuthSession | null> => {
    if (!isLoggedIn()) {
      setSession(null);
      return null;
    }

    const sessionResponse = await authAPI.getMe();
    setSession(sessionResponse);
    return sessionResponse;
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        setUser(null);
        setSession(null);
        setBackground(null);
        return;
      }

      const currentSession = await fetchSession();
      if (currentSession?.needsCharacter === true) {
        setUser(null);
        setBackground(null);
        return;
      }

      // Fetch user data and background in parallel
      const [userResponse, backgroundResponse] = await Promise.allSettled([
        userAPI.getUserWeb(),
        assetsAPI.getActiveBackground()
      ]);
      console.log('User response:', userResponse);
      console.log('Background response:', backgroundResponse);
      
      // Handle user data
      if (userResponse.status === 'fulfilled') {
        setUser(userResponse.value.user);
      } else {
        console.error('Error fetching user data:', userResponse.reason);
        setError('Failed to fetch user data');
        setUser(null);
      }

      // Handle background data
      if (backgroundResponse.status === 'fulfilled') {
        setBackground(backgroundResponse.value.background);
      } else {
        console.error('Error fetching background:', backgroundResponse.reason);
        // Don't set error for background failure, just use null
        setBackground(null);
      }

    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      setUser(null);
      setBackground(null);
    } finally {
      setLoading(false);
    }
  }, [fetchSession]);

  const fetchBackground = useCallback(async () => {
    try {
      if (!isLoggedIn()) {
        setBackground(null);
        return;
      }

      const response = await assetsAPI.getActiveBackground();
      setBackground(response.background);
    } catch (err) {
      console.error('Error in fetchBackground:', err);
      setBackground(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  const refreshSession = useCallback(async () => {
    return fetchSession();
  }, [fetchSession]);

  const refreshBackground = useCallback(async () => {
    await fetchBackground();
  }, [fetchBackground]);

  const clearUser = useCallback(() => {
    setUser(null);
    setSession(null);
    setBackground(null);
    setError(null);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const value: UserContextType = {
    user,
    session,
    hasCharacter: session?.hasCharacter ?? (user?.character ? true : null),
    needsCharacter: session?.needsCharacter === true,
    background,
    loading,
    error,
    refreshUser,
    refreshSession,
    clearUser,
    refreshBackground,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 