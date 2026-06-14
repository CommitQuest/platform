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
export interface AvatarOption {
  id: number;
  idle_url: string;
  celebration_url?: string;
  preview_swatch_hex?: string | null;
  display_order?: number;
}

export interface Character {
  id: number;
  user_id: number;
  name: string;
  level: number;
  xp: number;
  xp_to_next: number;
  species: string;
  class: string;
  stats: Record<string, any>;
  equipment: Record<string, any>;
  avatar_url?: string;
  avatar_option_id?: number | null;
  avatar_assets?: {
    idle?: string;
    celebration?: string;
  };
  avatar_options?: AvatarOption[];
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
  slug: string;
  name: string;
  description: string;
  item_type: string;
  slot?: string | null;
  rarity: string;
  has_visual: boolean;
  render_layer?: 'front' | 'back' | 'both' | null;
  price_gold: number;
  quantity_available: number | null;
  owned_quantity: number;
  asset_variant?: ItemAssetVariant | null;
}

export interface ShopResponse {
  shop: ShopItem[];
}

export interface ShopPurchaseResponse {
  success: boolean;
  item: ShopItem;
  gold_remaining: number;
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
  slot?: string | null;
  rarity: string;
  stats: Record<string, any>;
  cost: number;
  file_path?: string;
  number_available: number;
  is_active: boolean;
  has_visual?: boolean;
  render_layer?: 'front' | 'back' | 'both';
  asset_variant?: ItemAssetVariant | null;
}

export interface ItemAssetVariant {
  idle_url?: string | null;
  celebration_url?: string | null;
  back_idle_url?: string | null;
  back_celebration_url?: string | null;
  preview_url?: string | null;
  species_id?: number | null;
}

export interface UserInventory {
  id: number;
  inventory_id?: number;
  aquired_at: string;
  user_id: number;
  item_id: number;
  quantity: number;
  background_id?: number;
  active: boolean;
  equipped?: boolean;
  asset_type: string;
  items?: Item;
  item?: Item;
  name?: string;
  description?: string;
  item_type?: string;
  slot?: string | null;
  rarity?: string;
  cost?: number;
  file_path?: string;
  has_visual?: boolean;
  render_layer?: 'front' | 'back' | 'both';
  asset_variant?: ItemAssetVariant | null;
}

export interface InventoryResponse {
  inventory?: UserInventory[];
  items?: UserInventory[];
  backgrounds?: any[];
  count: number;
} 