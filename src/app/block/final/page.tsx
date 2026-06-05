'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ranks } from '@/data/course';
import { getProgress, updateStreak, saveProgress, completeRank } from '@/lib/progress';
import { UserProgress, QuizQuestion } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

function FinalExamContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const rankId = sp.get('rank') || '';
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ q: number; s: number; ok: boolean }[]>([]);

  useEffect(() => {
    const p = getProgress();
    saveProgress(updateStreak(p));
    setProgress(p);
  }, []);

  const rank = ranks.find(r => r.id === rankId);
  if (!rank) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-4">🔍</div><h1 className="font-bold mb-2">Ранг не найден</h1><Link href="/" className="duo-btn duo-btn-green px-6 py-3">На главную</Link></div>
      </div>
    );
  }

  const allQuestions: (QuizQuestion & { blockId: string })[] = rank.blocks.flatMap(b =>
    b.exam.map(q => ({ ...q, blockId: b.id }))
  );

  if (!progress) return null;

  const handleAnswer = (idx: number) => {
    if (showExp) return;
    setSelected(idx);
    setShowExp(true);
    const isCorrect = idx === allQuestions[qi].correctIndex;
    if (isCorrect) setCorrect(c => c + 1);
    setAnswers(a => [...a, { q: qi, s: idx, ok: isCorrect }]);
  };

  const handleNext = () => {
    if (qi < allQuestions.length - 1) {
      setQi(q => q + 1);
      setSelected(null);
      setShowExp(false);
    } else {
      const finalScore = Math.round((correct / allQuestions.length) * 100);
      setScore(finalScore);
      setDone(true);
      const p = completeRank(progress, rankId, finalScore);
      saveProgress(p);
      setProgress(p);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center p-4">
        <div className="duo-card max-w-lg w-full text-center">
          <div className="text-7xl mb-4">{score === 100 ? '🏆' : '📚'}</div>
          <h2 className="text-3xl font-extrabold mb-2">{score === 100 ? 'ФИНАЛ СДАН!' : 'Нужно 100%'}</h2>
          <p className="text-gray-400 mb-5">Правильных: {correct} из {allQuestions.length}</p>
          <div className="flex justify-center gap-4 mb-5">
            <div className="duo-card px-6 py-3"><div className="text-3xl font-extrabold text-duo-green">{score}%</div><div className="text-xs text-gray-400">Результат</div></div>
            <div className="duo-card px-6 py-3"><div className="text-3xl font-extrabold text-duo-yellow">+{score * 10}</div><div className="text-xs text-gray-400">XP</div></div>
          </div>
          {score === 100 ? (
            <div>
              <div className="p-4 rounded-xl bg-duo-green/10 border border-duo-green/30 mb-4">
                <p className="font-bold text-duo-green">🎉 {rank.certificateTitle} получен!</p>
              </div>
              <Link href={`/certificate/${rankId}`}
                className="duo-btn duo-btn-green px-8 py-3 w-full flex items-center justify-center gap-2 font-bold">
                <Trophy className="w-5 h-5" /> Посмотреть сертификат
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-duo-red/10 border border-duo-red/30">
                <p className="text-sm">Нужно 100% для получения сертификата. Повторите материал.</p>
              </div>
              <button onClick={() => { setQi(0); setSelected(null); setShowExp(false); setCorrect(0); setScore(0); setDone(false); setAnswers([]); }}
                className="duo-btn bg-yellow-400 text-black px-8 py-3 w-full flex items-center justify-center gap-2 font-bold">
                <RotateCcw className="w-5 h-5" /> Попробовать снова
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = allQuestions[qi];
  return (
    <div className="min-h-screen bg-[#131F24]">
      <header className="bg-[#1A2C38] border-b border-[#37464F] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href={`/rank/${rankId}`} className="duo-btn duo-btn-gray px-3 py-2 text-sm"><ArrowLeft className="w-4 h-4" /></Link>
          <span className="font-extrabold">Финальный экзамен: {rank.title}</span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="duo-progress mb-4">
          <div className="duo-progress-fill bg-duo-green" style={{ width: `${((qi + 1) / allQuestions.length) * 100}%` }} />
        </div>
        <div className="text-sm text-gray-400 mb-4 font-bold">ВОПРОС {qi + 1} ИЗ {allQuestions.length}</div>
        <div className="duo-card">
          <h3 className="text-lg font-extrabold mb-5">{q.question}</h3>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              let cls = 'quiz-option';
              if (showExp) { if (i === q.correctIndex) cls += ' correct'; else if (i === selected) cls += ' incorrect'; }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showExp} className={cls}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      showExp && i === q.correctIndex ? 'bg-duo-green text-white' :
                      showExp && i === selected ? 'bg-duo-red text-white' : 'bg-[#37464F]'}`}>{String.fromCharCode(65 + i)}</div>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {showExp && (
            <div className={`mt-4 p-4 rounded-xl ${selected === q.correctIndex ? 'bg-duo-green/10 border border-duo-green/30' : 'bg-duo-red/10 border border-duo-red/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                {selected === q.correctIndex ? <CheckCircle className="w-5 h-5 text-duo-green" /> : <XCircle className="w-5 h-5 text-duo-red" />}
                <span className={`font-bold ${selected === q.correctIndex ? 'text-duo-green' : 'text-duo-red'}`}>{selected === q.correctIndex ? 'Правильно!' : 'Неправильно'}</span>
              </div>
              <p className="text-sm text-gray-300">{q.explanation}</p>
            </div>
          )}
        </div>
        {showExp && (
          <div className="flex justify-end mt-4">
            <button onClick={handleNext} className="duo-btn bg-yellow-400 text-black px-8 py-3 flex items-center gap-2 font-bold">
              {qi === allQuestions.length - 1 ? 'Результат' : 'Далее'} <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function FinalExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    }>
      <FinalExamContent />
    </Suspense>
  );
}
