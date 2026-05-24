'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseData } from '@/data/course';
import { getProgress, updateStreak, saveProgress, isBlockUnlocked, isLessonUnlocked } from '@/lib/progress';
import { UserProgress } from '@/types';
import { ArrowLeft, Star, Flame, Lock, CheckCircle, BookOpen, Trophy, ChevronRight, Play } from 'lucide-react';

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.levelId as string;
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);
  }, []);

  const level = courseData.find(l => l.id === levelId);

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Уровень не найден</h1>
          <Link href="/" className="duo-btn duo-btn-green px-6 py-3">На главную</Link>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    'duo-green': 'text-duo-green',
    'duo-blue': 'text-duo-blue',
    'duo-purple': 'text-duo-purple',
  };

  const bgMap: Record<string, string> = {
    'duo-green': 'from-duo-green/20 to-[#131F24]',
    'duo-blue': 'from-duo-blue/20 to-[#131F24]',
    'duo-purple': 'from-duo-purple/20 to-[#131F24]',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgMap[level.color]}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="duo-btn duo-btn-gray px-3 py-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{level.icon}</span>
              <span className="font-extrabold text-lg">{level.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#37464F] rounded-full px-3 py-1.5">
              <Flame className="w-5 h-5 text-duo-orange" />
              <span className="font-bold text-duo-orange">{progress.streak}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#37464F] rounded-full px-3 py-1.5">
              <Star className="w-5 h-5 text-duo-yellow" />
              <span className="font-bold text-duo-yellow">{progress.xp} XP</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Level Info */}
        <div className={`duo-card mb-8 bg-gradient-to-r ${bgMap[level.color]} border-${level.color}/30`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-[#1A2C38] flex items-center justify-center text-4xl ${colorMap[level.color]}`}>
              {level.icon}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{level.title}</h1>
              <p className="text-gray-400">{level.subtitle} • {level.blocks.length} блоков</p>
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-6">
          {level.blocks.map((block, blockIndex) => {
            const unlocked = isBlockUnlocked(progress, courseData, block.id);
            const completed = progress.blockScores[block.id] === 100;
            const blockLessons = block.lessons.length;
            const blockCompleted = block.lessons.filter(l => progress.lessonScores[l.id] === 100).length;
            const blockProgress = Math.round((blockCompleted / blockLessons) * 100);

            return (
              <div key={block.id} className={`duo-card ${!unlocked ? 'opacity-50' : ''}`}>
                {/* Block Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-[#37464F] flex items-center justify-center text-2xl`}>
                      {completed ? '✅' : block.icon}
                    </div>
                    <div>
                      <h2 className="font-extrabold text-lg">{block.title}</h2>
                      <p className="text-sm text-gray-400">{block.description}</p>
                    </div>
                  </div>
                  {!unlocked && <Lock className="w-6 h-6 text-gray-500" />}
                </div>

                {/* Block Progress */}
                {unlocked && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Прогресс блока</span>
                      <span className="font-bold">{blockProgress}%</span>
                    </div>
                    <div className="duo-progress">
                      <div
                        className={`duo-progress-fill ${level.color === 'duo-green' ? 'bg-duo-green' : level.color === 'duo-blue' ? 'bg-duo-blue' : 'bg-duo-purple'}`}
                        style={{ width: `${blockProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Lessons */}
                <div className="space-y-2">
                  {block.lessons.map((lesson, lessonIndex) => {
                    const lessonUnlocked = isLessonUnlocked(progress, courseData, lesson.id);
                    const lessonScore = progress.lessonScores[lesson.id];
                    const lessonCompleted = lessonScore === 100;

                    return (
                      <Link
                        key={lesson.id}
                        href={lessonUnlocked ? `/lesson/${lesson.id}` : '#'}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                          lessonUnlocked
                            ? 'bg-[#37464F] hover:bg-[#4B5C66] cursor-pointer'
                            : 'bg-[#2A3A44] opacity-50 cursor-not-allowed'
                        }`}
                        onClick={(e) => !lessonUnlocked && e.preventDefault()}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            lessonCompleted ? 'bg-duo-green' : lessonUnlocked ? 'bg-[#4B5C66]' : 'bg-[#37464F]'
                          }`}>
                            {lessonCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : lessonUnlocked ? (
                              <Play className="w-5 h-5 text-white" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">{lesson.title}</div>
                            <div className="text-sm text-gray-400">{lesson.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lessonScore !== undefined && (
                            <span className={`text-sm font-bold ${lessonScore === 100 ? 'text-duo-green' : 'text-duo-yellow'}`}>
                              {lessonScore}%
                            </span>
                          )}
                          {lessonUnlocked && <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>
                      </Link>
                    );
                  })}

                  {/* Exam */}
                  {unlocked && blockLessons === blockCompleted && (
                    <Link
                      href={`/exam/${block.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-duo-yellow/20 border-2 border-duo-yellow/30 hover:bg-duo-yellow/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-duo-yellow flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-duo-black" />
                        </div>
                        <div>
                          <div className="font-bold text-duo-yellow">Экзамен блока</div>
                          <div className="text-sm text-gray-400">Проверьте свои знания</div>
                        </div>
                      </div>
                      {progress.blockScores[block.id] === 100 ? (
                        <CheckCircle className="w-5 h-5 text-duo-green" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-duo-yellow" />
                      )}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
