import type { CommitEvent } from '../types';

/**
 * Merges a real-time commit event into the existing UserData shape
 * used by UserContext, returning only the fields that should change.
 */
export function mergeCommitStats(
  event: CommitEvent
): {
  totalCommits: number;
  streakCount: number;
  experienceGained: number;
  gold: number;
  level: number;
  levelProgress: {
    currentLevel: number;
    expInCurrentLevel: number;
    expNeededForNextLevel: number;
    progress: number;
  };
} {
  const { stats, gold } = event;
  return {
    totalCommits: stats.totalCommits,
    streakCount: stats.currentStreak,
    experienceGained: stats.experience ?? stats.levelProgress?.totalExp ?? 0,
    gold,
    level: stats.level,
    levelProgress: {
      currentLevel: stats.levelProgress.currentLevel,
      expInCurrentLevel: stats.levelProgress.expInCurrentLevel,
      expNeededForNextLevel: stats.levelProgress.expNeededForNextLevel,
      progress: stats.levelProgress.progress,
    },
  };
}
