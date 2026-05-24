export interface Flashcard {
  id: string;
  front: string;
  back: string;
  icon?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  description: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface Block {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  exam: QuizQuestion[];
}

export interface Level {
  id: 'basic' | 'intermediate' | 'advanced';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  blocks: Block[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  completedBlocks: string[];
  lessonScores: Record<string, number>;
  blockScores: Record<string, number>;
  currentLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (progress: UserProgress) => boolean;
}
