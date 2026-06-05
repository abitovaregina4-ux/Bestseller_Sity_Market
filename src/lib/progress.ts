import { UserProgress, Rank } from '@/types';

const PROGRESS_KEY = 'retailpro-progress';

const defaultProgress: UserProgress = {
  name: '',
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  completedTopics: [],
  completedBlocks: [],
  completedRanks: [],
  topicScores: {},
  blockScores: {},
  rankScores: {},
  currentRank: 'rank-1',
  certificates: [],
};

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return { ...defaultProgress, ...p };
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return defaultProgress;
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toDateString();
  if (progress.lastActiveDate === today) return progress;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let newStreak = progress.streak;
  if (progress.lastActiveDate === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }
  return { ...progress, streak: newStreak, lastActiveDate: today };
}

export function addXP(progress: UserProgress, amount: number): UserProgress {
  return { ...progress, xp: progress.xp + amount };
}

export function completeTopic(progress: UserProgress, topicId: string): UserProgress {
  if (progress.completedTopics.includes(topicId)) return progress;
  return addXP({
    ...progress,
    completedTopics: [...progress.completedTopics, topicId],
    topicScores: { ...progress.topicScores, [topicId]: 100 },
  }, 5);
}

export function completeBlockExam(progress: UserProgress, blockId: string, score: number): UserProgress {
  const completed = progress.completedBlocks.includes(blockId);
  const currentScore = progress.blockScores[blockId] || 0;
  if (currentScore >= score) return progress;
  return addXP({
    ...progress,
    completedBlocks: completed ? progress.completedBlocks : [...progress.completedBlocks, blockId],
    blockScores: { ...progress.blockScores, [blockId]: score },
  }, score * 3);
}

export function completeRank(progress: UserProgress, rankId: string, score: number): UserProgress {
  const completed = progress.completedRanks.includes(rankId);
  const currentScore = progress.rankScores[rankId] || 0;
  if (currentScore >= score) return progress;
  return addXP({
    ...progress,
    completedRanks: completed ? progress.completedRanks : [...progress.completedRanks, rankId],
    rankScores: { ...progress.rankScores, [rankId]: score },
    certificates: [...new Set([...progress.certificates, rankId])],
  }, score * 10);
}

export function isBlockUnlocked(progress: UserProgress, ranks: Rank[], rankId: string, blockNumber: number): boolean {
  if (blockNumber === 0) {
    const rankIndex = ranks.findIndex(r => r.id === rankId);
    if (rankIndex === 0) return true;
    const prevRank = ranks[rankIndex - 1];
    return progress.certificates.includes(prevRank?.id || '');
  }
  const rank = ranks.find(r => r.id === rankId);
  if (!rank) return false;
  const prevBlock = rank.blocks[blockNumber - 1];
  if (!prevBlock) return true;
  return progress.blockScores[prevBlock.id] === 100;
}

export function isRankUnlocked(progress: UserProgress, ranks: Rank[], rankId: string): boolean {
  const rankIndex = ranks.findIndex(r => r.id === rankId);
  if (rankIndex === 0) return true;
  const prevRank = ranks[rankIndex - 1];
  return progress.certificates.includes(prevRank?.id || '');
}

export function allTopicsViewed(progress: UserProgress, blockId: string, ranks: Rank[]): boolean {
  for (const rank of ranks) {
    for (const block of rank.blocks) {
      if (block.id === blockId) {
        return block.topics.every(t => progress.completedTopics.includes(t.id));
      }
    }
  }
  return false;
}
