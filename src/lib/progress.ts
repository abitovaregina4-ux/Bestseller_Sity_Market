import { UserProgress, Lesson, Block, Level } from '@/types';

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

function findLessonInCourse(courseData: Level[], lessonId: string): { lesson: Lesson; block: Block; level: Level } | null {
  for (const level of courseData) {
    for (const block of level.blocks) {
      const lesson = block.lessons.find(l => l.id === lessonId);
      if (lesson) return { lesson, block, level };
    }
  }
  return null;
}

function findBlockInCourse(courseData: Level[], blockId: string): { block: Block; level: Level } | null {
  for (const level of courseData) {
    const block = level.blocks.find(b => b.id === blockId);
    if (block) return { block, level };
  }
  return null;
}

export function isLessonUnlocked(
  progress: UserProgress,
  courseData: Level[],
  lessonId: string
): boolean {
  const found = findLessonInCourse(courseData, lessonId);
  if (!found) return false;

  const { level } = found;
  const levelIndex = ['basic', 'intermediate', 'advanced'].indexOf(level.id);
  const currentLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(progress.currentLevel);

  if (levelIndex > currentLevelIndex) return false;

  const { block, lesson } = found;
  const blockIndex = level.blocks.indexOf(block);
  const lessonIndex = block.lessons.indexOf(lesson);

  if (lessonIndex === 0) return true;

  const previousLesson = block.lessons[lessonIndex - 1];
  if (!previousLesson) return true;

  return progress.lessonScores[previousLesson.id] === 100;
}

export function isBlockUnlocked(
  progress: UserProgress,
  courseData: Level[],
  blockId: string
): boolean {
  const found = findBlockInCourse(courseData, blockId);
  if (!found) return false;

  const { level } = found;
  const levelIndex = ['basic', 'intermediate', 'advanced'].indexOf(level.id);
  const currentLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(progress.currentLevel);

  if (levelIndex > currentLevelIndex) return false;

  const { block } = found;
  const blockIndex = level.blocks.indexOf(block);
  if (blockIndex === 0) return true;

  const previousBlock = level.blocks[blockIndex - 1];
  if (!previousBlock) return true;

  return progress.blockScores[previousBlock.id] === 100;
}

export function canAdvanceLevel(progress: UserProgress, courseData: Level[], targetLevel: string): boolean {
  const currentLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(progress.currentLevel);
  const targetLevelIndex = ['basic', 'intermediate', 'advanced'].indexOf(targetLevel);

  if (targetLevelIndex <= currentLevelIndex) return true;
  if (targetLevelIndex !== currentLevelIndex + 1) return false;

  const currentLevel = courseData[currentLevelIndex];
  if (!currentLevel) return false;

  return currentLevel.blocks.every(block => progress.blockScores[block.id] === 100);
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
}
