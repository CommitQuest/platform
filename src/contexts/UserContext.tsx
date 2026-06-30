import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { authAPI, userAPI, assetsAPI, characterAPI, isLoggedIn } from '../services/api';
import { getOrCreateSocket, disconnectSocket } from '../services/socket';
import { mergeCommitStats } from '../utils/commitEvent';
import { isVisualEquippedItem } from '../utils/inventory';
import type { CommitEvent, InventoryResponse, UserInventory } from '../types';

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

export type AvatarSceneState = 'idle' | 'celebration';

interface UserContextType {
  user: UserData | null;
  session: AuthSession | null;
  hasCharacter: boolean | null;
  needsCharacter: boolean;
  background: Background | null;
  loading: boolean;
  error: string | null;
  avatarSceneState: AvatarSceneState;
  equippedVisualItems: UserInventory[];
  lastCommitEvent: CommitEvent | null;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  clearUser: () => void;
  refreshBackground: () => Promise<void>;
  refreshEquippedItems: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * If the backend doesn't populate avatar_assets with celebration URLs,
 * derive them from the character's avatar_option_id + species.avatar_options.
 */
function resolveAvatarAssets(character: Character | null): Character['avatar_assets'] | undefined {
  if (!character) return undefined;
  if (character.avatar_assets?.celebration && character.avatar_assets?.idle) {
    return character.avatar_assets;
  }
  const optionId = character.avatar_option_id;
  const options = character.species?.avatar_options ?? character.avatar_options ?? [];
  const match = optionId != null ? options.find((o) => o.id === optionId) : options[0];
  if (match) {
    return {
      idle: match.idle_url ?? character.avatar_assets?.idle ?? character.avatar_url,
      celebration: match.celebration_url ?? match.idle_url ?? character.avatar_assets?.idle ?? character.avatar_url,
    };
  }
  return character.avatar_assets;
}

function enrichCharacterAssets(userData: any): any {
  if (!userData?.character) return userData;
  return {
    ...userData,
    character: {
      ...userData.character,
      avatar_assets: resolveAvatarAssets(userData.character),
    },
  };
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarSceneState, setAvatarSceneState] = useState<AvatarSceneState>('idle');
  const [equippedVisualItems, setEquippedVisualItems] = useState<UserInventory[]>([]);
  const [lastCommitEvent, setLastCommitEvent] = useState<CommitEvent | null>(null);

  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketConnectedRef = useRef(false);
  const avatarAssetsRef = useRef<Character['avatar_assets'] | undefined>(undefined);

  const fetchSession = useCallback(async (): Promise<AuthSession | null> => {
    if (!isLoggedIn()) {
      setSession(null);
      return null;
    }

    const sessionResponse = await authAPI.getMe();
    setSession(sessionResponse);
    return sessionResponse;
  }, []);

  const fetchEquippedItems = useCallback(async () => {
    if (!isLoggedIn()) {
      setEquippedVisualItems([]);
      return;
    }

    try {
      const response = (await assetsAPI.getUserInventory()) as InventoryResponse;
      const inventory = response.items ?? response.inventory ?? [];
      setEquippedVisualItems(inventory.filter(isVisualEquippedItem));
    } catch (err) {
      console.error('Error loading equipped items:', err);
      setEquippedVisualItems([]);
    }
  }, []);

  const fetchUserData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        setUser(null);
        setSession(null);
        setBackground(null);
        setEquippedVisualItems([]);
        return;
      }

      const currentSession = await fetchSession();
      if (currentSession?.needsCharacter === true) {
        setUser(null);
        setBackground(null);
        setEquippedVisualItems([]);
        return;
      }

      const [userResponse, backgroundResponse] = await Promise.allSettled([
        userAPI.getUserWeb(),
        assetsAPI.getActiveBackground()
      ]);
      
      let userData: any = null;
      if (userResponse.status === 'fulfilled') {
        userData = enrichCharacterAssets(userResponse.value.user);

        // If celebration URL is still missing, fetch species data to resolve it
        if (userData?.character && !userData.character.avatar_assets?.celebration) {
          try {
            const speciesData = await characterAPI.getSpecies();
            const speciesList = speciesData.species ?? speciesData ?? [];
            const charSpecies = speciesList.find((s: any) => s.id === userData.character.species_id || s.id === userData.character.species?.id);
            if (charSpecies?.avatar_options) {
              userData = {
                ...userData,
                character: {
                  ...userData.character,
                  species: { ...userData.character.species, avatar_options: charSpecies.avatar_options },
                },
              };
              userData = enrichCharacterAssets(userData);
            }
          } catch { /* non-critical */ }
        }

        avatarAssetsRef.current = userData?.character?.avatar_assets;
        console.log('[CommitQuest] Resolved avatar_assets:', avatarAssetsRef.current);
        setUser(userData);
      } else {
        console.error('Error fetching user data:', userResponse.reason);
        setError('Failed to fetch user data');
        setUser(null);
      }

      if (backgroundResponse.status === 'fulfilled') {
        setBackground(backgroundResponse.value.background);
      } else {
        console.error('Error fetching background:', backgroundResponse.reason);
        setBackground(null);
      }

      await fetchEquippedItems();

    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      setUser(null);
      setBackground(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [fetchSession, fetchEquippedItems]);

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

  const refreshEquippedItems = useCallback(async () => {
    await fetchEquippedItems();
  }, [fetchEquippedItems]);

  const clearUser = useCallback(() => {
    setUser(null);
    setSession(null);
    setBackground(null);
    setError(null);
    setEquippedVisualItems([]);
    setLastCommitEvent(null);
    setAvatarSceneState('idle');
    disconnectSocket();
    socketConnectedRef.current = false;
  }, []);

  // Keep refs to latest versions of handlers so the socket effect never re-runs
  const fetchEquippedItemsRef = useRef(fetchEquippedItems);
  fetchEquippedItemsRef.current = fetchEquippedItems;
  const fetchUserDataRef = useRef(fetchUserData);
  fetchUserDataRef.current = fetchUserData;

  // Socket lifecycle: connect once when session is ready, disconnect on logout/unmount
  useEffect(() => {
    const shouldConnect = isLoggedIn() && session && !session.needsCharacter;

    if (!shouldConnect) {
      if (socketConnectedRef.current) {
        disconnectSocket();
        socketConnectedRef.current = false;
      }
      return;
    }

    const sock = getOrCreateSocket();
    if (!sock) return;
    socketConnectedRef.current = true;

    const handleCommit = (event: CommitEvent) => {
      console.log('[CommitQuest] commit event received:', { celebrate: event.celebrate, type: event.type, stats: !!event.stats });
      const merged = mergeCommitStats(event);

      setUser((prev) => {
        if (!prev) return prev;

        const existingIds = new Set(prev.achievements.map((a) => a.id));
        const newAchievements = (event.newAchievements ?? []).filter((a) => !existingIds.has(a.id));

        const cachedAssets = avatarAssetsRef.current;

        return {
          ...prev,
          ...merged,
          character: prev.character
            ? {
                ...prev.character,
                level: merged.level,
                xp: merged.levelProgress.expInCurrentLevel,
                xpToNext: merged.levelProgress.expNeededForNextLevel,
                avatar_assets: prev.character.avatar_assets ?? cachedAssets,
              }
            : prev.character,
          achievements: newAchievements.length > 0
            ? [...prev.achievements, ...newAchievements.map((a) => ({ id: a.id, name: a.name, description: a.description, type: a.type, criteria: {}, metadata: {} }))]
            : prev.achievements,
        };
      });

      setLastCommitEvent(event);

      if (event.autoUnlockedItems?.length > 0) {
        fetchEquippedItemsRef.current();
      }

      // Always celebrate on commit events
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
      console.log('[CommitQuest] Starting celebration, avatar_assets:', avatarAssetsRef.current);
      setAvatarSceneState('celebration');
      celebrationTimerRef.current = setTimeout(() => {
        setAvatarSceneState('idle');
        celebrationTimerRef.current = null;
      }, 3000);
    };

    const handleConnect = () => {
      fetchUserDataRef.current(true);
    };

    sock.off('commit').on('commit', handleCommit);
    sock.off('connect').on('connect', handleConnect);

    return () => {
      sock.off('commit', handleCommit);
      sock.off('connect', handleConnect);
    };
  // Only re-run when session identity actually changes (login/logout/character creation)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.needsCharacter, session?.user?.id]);

  // Cleanup on full unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
      socketConnectedRef.current = false;
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  // Initial data load
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
    avatarSceneState,
    equippedVisualItems,
    lastCommitEvent,
    refreshUser,
    refreshSession,
    clearUser,
    refreshBackground,
    refreshEquippedItems,
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
