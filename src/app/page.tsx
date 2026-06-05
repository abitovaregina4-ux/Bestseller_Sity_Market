'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ranks } from '@/data/course';
import { getProgress, updateStreak, saveProgress, isRankUnlocked, resetProgress } from '@/lib/progress';
import { UserProgress } from '@/types';
import { Star, Flame, Trophy, ChevronRight, CheckCircle, Lock, BookOpen } from 'lucide-react';

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);
    if (!p.name) setShowNameInput(true);
  }, []);

  const handleSetName = () => {
    if (!name.trim()) return;
    const p = getProgress();
    const updated = { ...p, name: name.trim() };
    saveProgress(updated);
    setProgress(updated);
    setShowNameInput(false);
  };

  const handleReset = () => {
    if (confirm('Сбросить весь прогресс?')) {
      resetProgress();
      window.location.reload();
    }
  };

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131F24]">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center p-4">
        <div className="duo-card max-w-md w-full text-center bg-gradient-to-br from-duo-green/10 to-duo-blue/10 border-duo-green/30">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-2xl font-extrabold mb-2">Добро пожаловать!</h1>
          <p className="text-gray-400 mb-6">Введите ваше ФИО для начала обучения</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetName()}
            placeholder="Иванов Иван Иванович"
            className="duo-input mb-4 text-center text-lg"
            autoFocus
          />
          <button
            onClick={handleSetName}
            disabled={!name.trim()}
            className={`duo-btn px-8 py-3 w-full font-extrabold text-lg ${name.trim() ? 'duo-btn-green' : 'duo-btn-gray'}`}
          >
            Начать обучение 🚀
          </button>
        </div>
      </div>
    );
  }

  const totalTopics = ranks.reduce((a, r) => a + r.blocks.reduce((b, bl) => b + bl.topics.length, 0), 0);
  const completedTopics = progress.completedTopics.length;
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);

  return (
    <div className="min-h-screen bg-[#131F24]">
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-green flex items-center justify-center text-xl font-black">R</div>
            <div>
              <span className="font-extrabold text-lg">RetailPro</span>
              <span className="text-sm text-gray-400 ml-2">{progress.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="duo-card mb-8 bg-gradient-to-r from-duo-green/20 to-duo-blue/20 border-duo-green/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold mb-1">Привет, {progress.name}! 👋</h1>
              <p className="text-gray-400 mb-3">Общий прогресс обучения</p>
              <div className="duo-progress w-full max-w-md">
                <div className="duo-progress-fill bg-duo-green" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-sm text-gray-400 mt-1">{completedTopics} из {totalTopics} тем ({progressPercent}%)</p>
            </div>
            <Trophy className="w-20 h-20 text-duo-yellow float" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Ранги обучения
          </h2>
          <button onClick={handleReset} className="text-sm text-duo-red hover:underline">Сбросить прогресс</button>
        </div>

        <div className="space-y-4">
          {ranks.map((rank, i) => {
            const unlocked = isRankUnlocked(progress, ranks, rank.id);
            const completed = progress.certificates.includes(rank.id);
            const rankTopics = rank.blocks.reduce((a, b) => a + b.topics.length, 0);
            const rankDone = rank.blocks.reduce((a, b) => a + b.topics.filter(t => progress.completedTopics.includes(t.id)).length, 0);
            const rankPct = Math.round((rankDone / rankTopics) * 100);

            const colorBorder: Record<string, string> = {
              'duo-green': 'border-duo-green/30 from-duo-green/20',
              'duo-blue': 'border-duo-blue/30 from-duo-blue/20',
              'duo-purple': 'border-duo-purple/30 from-duo-purple/20',
              'duo-orange': 'border-duo-orange/30 from-duo-orange/20',
            };

            return (
              <Link
                key={rank.id}
                href={unlocked || completed ? `/rank/${rank.id}` : '#'}
                onClick={(e) => { if (!unlocked && !completed) e.preventDefault(); }}
                className={`duo-card bg-gradient-to-r ${colorBorder[rank.color] || 'from-[#1A2C38]'} block transition-all ${unlocked || completed ? 'hover:scale-[1.02]' : 'opacity-40 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#1A2C38] flex items-center justify-center text-3xl">
                      {completed ? '✅' : unlocked ? rank.icon : '🔒'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{rank.title}</h3>
                      <p className="text-gray-400 text-sm">{rank.subtitle} • {rank.blocks.length} блок • {rankTopics} тем</p>
                      <div className="duo-progress w-48 mt-2">
                        <div className={`duo-progress-fill ${rank.color === 'duo-green' ? 'bg-duo-green' : rank.color === 'duo-blue' ? 'bg-duo-blue' : rank.color === 'duo-purple' ? 'bg-duo-purple' : 'bg-duo-orange'}`}
                          style={{ width: `${rankPct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {completed && <CheckCircle className="w-6 h-6 text-duo-green" />}
                    <span className="font-bold text-sm text-gray-400">{rankPct}%</span>
                    {unlocked && <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
