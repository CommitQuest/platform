import React, { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useUser } from '../../contexts/UserContext';

const CommitNotifications: React.FC = () => {
  const { lastCommitEvent, user } = useUser();
  const toast = useToast();
  const previousLevelRef = useRef<number | null>(null);
  const processedTimestampRef = useRef<string | null>(null);

  // Track the user's level so we can detect level-ups
  useEffect(() => {
    if (user?.level != null && previousLevelRef.current === null) {
      previousLevelRef.current = user.level;
    }
  }, [user?.level]);

  useEffect(() => {
    if (!lastCommitEvent) return;
    if (lastCommitEvent.timestamp === processedTimestampRef.current) return;
    processedTimestampRef.current = lastCommitEvent.timestamp;

    const { xpGained, goldGained, newAchievements, autoUnlockedItems, stats, repository } = lastCommitEvent;

    const repoName = repository?.split('/').pop() ?? repository;

    toast({
      title: `Commit received${repoName ? ` — ${repoName}` : ''}`,
      description: `+${xpGained} XP  ·  +${goldGained} Gold`,
      status: 'success',
      duration: 4000,
      isClosable: true,
      position: 'bottom-right',
    });

    if (previousLevelRef.current !== null && stats.level > previousLevelRef.current) {
      toast({
        title: `Level Up!`,
        description: `You reached level ${stats.level}!`,
        status: 'info',
        duration: 6000,
        isClosable: true,
        position: 'top',
      });
    }
    previousLevelRef.current = stats.level;

    for (const achievement of newAchievements ?? []) {
      toast({
        title: `Achievement Unlocked: ${achievement.name}`,
        description: achievement.description,
        status: 'success',
        duration: 6000,
        isClosable: true,
        position: 'bottom-right',
      });
    }

    for (const item of autoUnlockedItems ?? []) {
      toast({
        title: `Item Unlocked: ${item.name}`,
        description: `${item.rarity} ${item.item_type}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  }, [lastCommitEvent, toast]);

  return null;
};

export default CommitNotifications;
