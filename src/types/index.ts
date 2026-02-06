// User types
export interface User {
  id: number;
  github_username: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

// Character types
export interface Character {
  id: number;
  user_id: number;
  name: string;
  level: number;
  xp: number;
  xp_to_next: number;
  gold: number;
  species: string;
  class: string;
  stats: Record<string, any>;
  equipment: Record<string, any>;
  avatar_url?: string;
}

// Achievement types
export interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  criteria: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserAchievement {
  id: number;
  achievement_id: number;
  user_id: number;
  earned_at: string;
  achievement: Achievement;
}

// Friend system types
export interface FriendRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender: User;
}

export interface Friendship {
  id: number;
  user_id: number;
  friend_id: number;
  created_at: string;
  friend: User;
  mutual_count?: number; // number of mutual friends (if API provides it)
}

// Leaderboard entry (e.g. weekly XP)
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  github_username: string;
  avatar_url?: string; // GitHub avatar (fallback if no character)
  character_name?: string;
  character_avatar_url?: string; // Character image to show in leaderboard
  value: number; // e.g. experience_gained in timeframe
  metric: string;
}

// GitHub connection: GitHub follower/following who is also on CommitQuest
export interface GithubConnection {
  user: User;
  connection_type: 'following' | 'follower' | 'mutual';
}

// Shop types
export interface ShopItem {
  id: number;
  item_id: number;
  price: number;
  is_available: boolean;
  stock_quantity: number;
  item: {
    id: number;
    name: string;
    description: string;
    item_type: string;
    rarity: string;
    asset_url?: string;
  };
}

export interface Purchase {
  id: number;
  user_id: number;
  shop_item_id: number;
  quantity: number;
  price_paid: number;
  purchased_at: string;
  item_name: string;
}

// Stats types
export interface UserStats {
  total_commits: number;
  current_streak: number;
  longest_streak: number;
  total_repositories: number;
  achievements_earned: number;
  total_achievements: number;
  level: number;
  total_gold: number;
}

// Activity types
export interface Activity {
  type: string;
  repository: string;
  message: string;
  timestamp: string;
}

// Privacy settings types
export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  show_achievements: boolean;
  show_stats: boolean;
  allow_friend_requests: boolean;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  item_type: string;
  rarity: string;
  stats: Record<string, any>;
  cost: number;
  file_path: string;
  is_active: boolean;
}

export interface UserInventory {
  id: number;
  aquired_at: string;
  user_id: number;
  item_id: number;
  quantity: number;
  background_id?: number;
  active: boolean;
  asset_type: string;
  items: Item;
}

export interface InventoryResponse {
  inventory: UserInventory[];
  count: number;
} 