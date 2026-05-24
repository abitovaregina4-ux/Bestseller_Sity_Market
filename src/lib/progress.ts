import { UserProgress } from '@/types';

const PROGRESS_KEY = 'supermarket-training-progress';

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  completedLessons: [],
  completedBlocks: [],
  lessonScores: {},
  blockScores: {},
  currentLevel: 'basic',
};

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const progress = JSON.parse(saved);
      return { ...defaultProgress, ...progress };
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

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toDateString();
  if (progress.lastActiveDate === today) return progress;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = progress.streak;
  if (progress.lastActiveDate === yesterday.toDateString()) {
    newStreak += 1;
  } else if (progress.lastActiveDate !== today) {
    newStreak = 1;
  }

  return { ...progress, streak: newStreak, lastActiveDate: today };
}

export function addXP(progress: UserProgress, amount: number): UserProgress {
  const updated = { ...progress, xp: progress.xp + amount };
  return updateStreak(updated);
}

export function completeLesson(progress: UserProgress, lessonId: string, score: number): UserProgress {
  const completedLessons = [...progress.completedLessons];
  if (!completedLessons.includes(lessonId)) {
    completedLessons.push(lessonId);
  }

  const lessonScores = { ...progress.lessonScores };
  lessonScores[lessonId] = Math.max(lessonScores[lessonId] || 0, score);

  return addXP({ ...progress, completedLessons, lessonScores }, score * 10);
}

export function completeBlock(progress: UserProgress, blockId: string, score: number): UserProgress {
  const completedBlocks = [...progress.completedBlocks];
  if (!completedBlocks.includes(blockId)) {
    completedBlocks.push(blockId);
  }

  const blockScores = { ...progress.blockScores };
  blockScores[blockId] = Math.max(blockScores[blockId] || 0, score);

  return addXP({ ...progress, completedBlocks, blockScores }, score * 20);
}

export function isLessonUnlocked(progress: UserProgress, lessonId: string, blockId: string, levelId: string): boolean {
  const levelIndex = ['basic', 'intermediate', 'advanced'].indexOf(levelId);
  const currentLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(progress.currentLevel);

  if (levelIndex > currentLevelIndex) return false;

  if (levelIndex < currentLevelIndex) return true;

  const courseData = require('@/data/course').courseData;
  const level = courseData.find((l: any) => l.id === levelId);
  if (!level) return false;

  const blockIndex = level.blocks.findIndex((b: any) => b.id === blockId);
  const lessonIndex = level.blocks[blockIndex]?.lessons.findIndex((l: any) => l.id === lessonId);

  if (lessonIndex === 0) return true;

  const previousLesson = level.blocks[blockIndex]?.lessons[lessonIndex - 1];
  if (!previousLesson) return true;

  return progress.lessonScores[previousLesson.id] === 100;
}

export function isBlockUnlocked(progress: UserProgress, blockId: string, levelId: string): boolean {
  const levelIndex = ['basic', 'intermediate', 'advanced'].indexOf(levelId);
  const currentLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(progress.currentLevel);

  if (levelIndex > currentLevelIndex) return false;
  if (levelIndex < currentLevelIndex) return true;

  const courseData = require('@/data/course').courseData;
  const level = courseData.find((l: any) => l.id === levelId);
  if (!level) return false;

  const blockIndex = level.blocks.findIndex((b: any) => b.id === blockId);
  if (blockIndex === 0) return true;

  const previousBlock = level.blocks[blockIndex - 1];
  if (!previousBlock) return true;

  return progress.blockScores[previousBlock.id] === 100;
}

export function canAdvanceLevel(progress: UserProgress, targetLevel: string): boolean {
  const courseData = require('@/data/course').courseData;
  const currentLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(progress.currentLevel);
  const targetLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(targetLevel);

  if (targetLevelIndex <= currentLevelIndex) return true;
  if (targetLevelIndex !== currentLevelIndex + 1) return false;

  const currentLevel = courseData[currentLevelIndex];
  if (!currentLevel) return false;

  return currentLevel.blocks.every((block: any) => progress.blockScores[block.id] === 100);
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
}
