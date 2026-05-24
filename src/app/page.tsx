'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseData } from '@/data/course';
import { getProgress, updateStreak, saveProgress } from '@/lib/progress';
import { UserProgress } from '@/types';
import { Star, Trophy, Flame, ChevronRight, Lock, CheckCircle, BookOpen, Target, BarChart3 } from 'lucide-react';

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }

  const totalLessons = courseData.reduce((acc, level) => acc + level.blocks.reduce((a, b) => a + b.lessons.length, 0), 0);
  const completedLessons = progress.completedLessons.length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-[#131F24]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-green flex items-center justify-center text-xl font-black">
              R
            </div>
            <span className="font-extrabold text-xl text-white">RetailPro</span>
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
        {/* Welcome Section */}
        <div className="duo-card mb-8 bg-gradient-to-r from-duo-green/20 to-duo-blue/20 border-duo-green/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold mb-2">Добро пожаловать! 👋</h1>
              <p className="text-gray-400 mb-4">Ваш прогресс обучения</p>
              <div className="duo-progress w-full max-w-md">
                <div
                  className="duo-progress-fill bg-duo-green"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{completedLessons} из {totalLessons} уроков ({progressPercent}%)</p>
            </div>
            <Trophy className="w-20 h-20 text-duo-yellow float" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="duo-card text-center">
            <Star className="w-8 h-8 text-duo-yellow mx-auto mb-2" />
            <div className="text-2xl font-extrabold">{progress.xp}</div>
            <div className="text-sm text-gray-400">Опыт (XP)</div>
          </div>
          <div className="duo-card text-center">
            <Flame className="w-8 h-8 text-duo-orange mx-auto mb-2" />
            <div className="text-2xl font-extrabold">{progress.streak}</div>
            <div className="text-sm text-gray-400">Дней подряд</div>
          </div>
          <div className="duo-card text-center">
            <CheckCircle className="w-8 h-8 text-duo-green mx-auto mb-2" />
            <div className="text-2xl font-extrabold">{completedLessons}</div>
            <div className="text-sm text-gray-400">Уроков пройдено</div>
          </div>
        </div>

        {/* Levels */}
        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Уровни обучения
        </h2>

        <div className="space-y-4">
          {courseData.map((level, index) => {
            const levelLessons = level.blocks.reduce((acc, b) => acc + b.lessons.length, 0);
            const levelCompleted = level.blocks.reduce((acc, b) => acc + b.lessons.filter(l => progress.lessonScores[l.id] === 100).length, 0);
            const levelProgress = Math.round((levelCompleted / levelLessons) * 100);
            const isUnlocked = index === 0 || progress.currentLevel !== level.id || levelProgress > 0;
            const isCompleted = levelProgress === 100;

            const colorMap: Record<string, string> = {
              'duo-green': 'from-duo-green/20 to-duo-green/5 border-duo-green/30',
              'duo-blue': 'from-duo-blue/20 to-duo-blue/5 border-duo-blue/30',
              'duo-purple': 'from-duo-purple/20 to-duo-purple/5 border-duo-purple/30',
            };

            const iconMap: Record<string, string> = {
              'duo-green': 'text-duo-green',
              'duo-blue': 'text-duo-blue',
              'duo-purple': 'text-duo-purple',
            };

            return (
              <Link
                key={level.id}
                href={`/level/${level.id}`}
                className={`duo-card bg-gradient-to-r ${colorMap[level.color]} block hover:scale-[1.02] transition-transform ${!isUnlocked ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-[#1A2C38] flex items-center justify-center text-3xl ${iconMap[level.color]}`}>
                      {isCompleted ? '✅' : level.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{level.title}</h3>
                      <p className="text-gray-400 text-sm">{level.subtitle} • {level.blocks.length} блоков • {levelLessons} уроков</p>
                      <div className="duo-progress w-48 mt-2">
                        <div
                          className={`duo-progress-fill ${level.color === 'duo-green' ? 'bg-duo-green' : level.color === 'duo-blue' ? 'bg-duo-blue' : 'bg-duo-purple'}`}
                          style={{ width: `${levelProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400">{levelProgress}%</span>
                    {isUnlocked ? (
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Features */}
        <h2 className="text-xl font-extrabold mt-8 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Возможности платформы
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="duo-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-green/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-duo-green" />
            </div>
            <div>
              <div className="font-bold text-sm">Карточки</div>
              <div className="text-xs text-gray-400">Anki-стиль</div>
            </div>
          </div>
          <div className="duo-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-blue/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-duo-blue" />
            </div>
            <div>
              <div className="font-bold text-sm">Тесты</div>
              <div className="text-xs text-gray-400">После каждого урока</div>
            </div>
          </div>
          <div className="duo-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-purple/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-duo-purple" />
            </div>
            <div>
              <div className="font-bold text-sm">KPI</div>
              <div className="text-xs text-gray-400">Отслеживание прогресса</div>
            </div>
          </div>
          <div className="duo-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-yellow/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-duo-yellow" />
            </div>
            <div>
              <div className="font-bold text-sm">Экзамены</div>
              <div className="text-xs text-gray-400">После каждого блока</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
