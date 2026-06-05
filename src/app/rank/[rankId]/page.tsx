'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ranks } from '@/data/course';
import { getProgress, updateStreak, saveProgress, isBlockUnlocked } from '@/lib/progress';
import { UserProgress } from '@/types';
import { ArrowLeft, Star, Flame, Lock, CheckCircle, BookOpen, ChevronRight, Play, Trophy } from 'lucide-react';

export default function RankPage() {
  const params = useParams();
  const rankId = params.rankId as string;
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);
  }, []);

  const rank = ranks.find(r => r.id === rankId);
  if (!rank) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Ранг не найден</h1>
          <Link href="/" className="duo-btn duo-btn-green px-6 py-3">На главную</Link>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    'duo-green': 'from-duo-green/20 to-[#131F24] text-duo-green',
    'duo-blue': 'from-duo-blue/20 to-[#131F24] text-duo-blue',
    'duo-purple': 'from-duo-purple/20 to-[#131F24] text-duo-purple',
    'duo-orange': 'from-duo-orange/20 to-[#131F24] text-duo-orange',
  };

  const rankCompleted = progress.certificates.includes(rankId);
  const rankTopics = rank.blocks.reduce((a, b) => a + b.topics.length, 0);
  const rankDone = rank.blocks.reduce((a, b) => a + b.topics.filter(t => progress.completedTopics.includes(t.id)).length, 0);
  const allBlocksDone = rank.blocks.every(b => progress.blockScores[b.id] === 100);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colorMap[rank.color]?.split(' ')[0] || 'bg-[#131F24]'}`}>
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="duo-btn duo-btn-gray px-3 py-2 text-sm"><ArrowLeft className="w-4 h-4" /></Link>
            <span className="text-2xl">{rank.icon}</span>
            <span className="font-extrabold">{rank.title}</span>
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
        <div className={`duo-card mb-8 bg-gradient-to-r ${colorMap[rank.color]?.split(' ')[0] || ''} border-${rank.color}/30`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A2C38] flex items-center justify-center text-4xl">{rankCompleted ? '✅' : rank.icon}</div>
            <div>
              <h1 className="text-2xl font-extrabold">{rank.title}</h1>
              <p className="text-gray-400">{rank.subtitle} • {rankTopics} тем • {rankDone} изучено</p>
              <div className="duo-progress w-64 mt-2">
                <div className={`duo-progress-fill ${rank.color === 'duo-green' ? 'bg-duo-green' : rank.color === 'duo-blue' ? 'bg-duo-blue' : rank.color === 'duo-purple' ? 'bg-duo-purple' : 'bg-duo-orange'}`}
                  style={{ width: `${Math.round((rankDone / rankTopics) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {rank.blocks.map((block, bi) => {
            const unlocked = isBlockUnlocked(progress, ranks, rankId, bi);
            const completed = progress.blockScores[block.id] === 100;
            const viewed = block.topics.filter(t => progress.completedTopics.includes(t.id)).length;
            const allViewed = viewed === block.topics.length;

            return (
              <div key={block.id} className={`duo-card ${!unlocked ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#37464F] flex items-center justify-center text-2xl">
                      {completed ? '✅' : unlocked ? block.icon : '🔒'}
                    </div>
                    <div>
                      <h2 className="font-extrabold">Блок {block.number}: {block.title}</h2>
                      <p className="text-sm text-gray-400">{block.topics.length} тем • просмотрено {viewed}</p>
                    </div>
                  </div>
                  {!unlocked && <Lock className="w-6 h-6 text-gray-500" />}
                  {completed && <CheckCircle className="w-6 h-6 text-duo-green" />}
                </div>

                <div className="space-y-1.5">
                  {block.topics.map((topic) => {
                    const viewed = progress.completedTopics.includes(topic.id);
                    return (
                      <Link
                        key={topic.id}
                        href={unlocked ? `/block/${block.id}?topic=${topic.id}` : '#'}
                        onClick={(e) => { if (!unlocked) e.preventDefault(); }}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all
                          ${viewed ? 'bg-[#37464F]' : unlocked ? 'bg-[#2A3A44] hover:bg-[#37464F]' : 'bg-[#2A3A44] opacity-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                            ${viewed ? 'bg-duo-green text-white' : unlocked ? 'bg-[#4B5C66] text-gray-300' : 'bg-[#37464F] text-gray-500'}`}>
                            {viewed ? '✓' : topic.number}
                          </div>
                          <span className={`text-sm ${viewed ? 'text-gray-300' : 'text-gray-400'}`}>{topic.title}</span>
                        </div>
                        {unlocked && <ChevronRight className="w-4 h-4 text-gray-500" />}
                      </Link>
                    );
                  })}
                </div>

                {unlocked && allViewed && !completed && (
                  <Link href={`/block/${block.id}?exam=true`}
                    className="mt-3 flex items-center justify-center gap-2 p-4 rounded-xl bg-duo-yellow/20 border-2 border-duo-yellow/30 hover:bg-duo-yellow/30 transition-all font-extrabold text-duo-yellow">
                    <Trophy className="w-5 h-5" /> Сдать экзамен блока
                  </Link>
                )}

                {completed && (
                  <div className="mt-3 p-3 rounded-xl bg-duo-green/10 border border-duo-green/30 flex items-center justify-center gap-2 text-duo-green font-bold">
                    <CheckCircle className="w-5 h-5" /> Экзамен сдан на 100%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allBlocksDone && !rankCompleted && (
          <Link href={`/block/final?rank=${rankId}`}
            className="mt-6 duo-btn duo-btn-green px-8 py-4 w-full flex items-center justify-center gap-2 text-lg font-extrabold">
            <Trophy className="w-6 h-6" /> Финальный экзамен ранга
          </Link>
        )}

        {rankCompleted && (
          <div className="mt-6 duo-card bg-duo-green/10 border-duo-green/30 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-duo-green mb-2">Ранг пройден!</h2>
            <p className="text-gray-400 mb-4">Вы получили сертификат {rank.certificateTitle}</p>
            <Link href={`/certificate/${rankId}`}
              className="duo-btn duo-btn-green px-8 py-3 inline-flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Посмотреть сертификат
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
