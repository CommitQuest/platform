import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI, assetsAPI, isLoggedIn } from '../services/api';

// User data types
interface Character {
  id: number;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
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
  };
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
  level: number;
  character: Character | null;
  achievements: Achievement[];
  levelProgress: LevelProgress | null;
}

interface UserContextType {
  user: UserData | null;
  background: Background | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
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
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  const clearUser = () => {
    setUser(null);
    setBackground(null);
    setError(null);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value: UserContextType = {
    user,
    background,
    loading,
    error,
    refreshUser,
    clearUser,
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