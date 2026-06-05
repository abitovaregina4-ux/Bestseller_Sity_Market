export interface Topic {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Block {
  id: string;
  title: string;
  number: number;
  icon: string;
  topics: Topic[];
  exam: QuizQuestion[];
}

export interface Rank {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  blocks: Block[];
  certificateTitle: string;
  certificateSubtitle: string;
}

export interface UserProgress {
  name: string;
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedTopics: string[];
  completedBlocks: string[];
  completedRanks: string[];
  topicScores: Record<string, number>;
  blockScores: Record<string, number>;
  rankScores: Record<string, number>;
  currentRank: string;
  certificates: string[];
}
