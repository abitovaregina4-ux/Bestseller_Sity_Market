'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ranks } from '@/data/course';
import { getProgress, updateStreak, saveProgress, completeTopic, completeBlockExam, allTopicsViewed } from '@/lib/progress';
import { UserProgress } from '@/types';
import { ArrowLeft, Star, Flame, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

function BlockPageContent() {
  const params = useParams();
  const sp = useSearchParams();
  const router = useRouter();
  const blockId = params.blockId as string;
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mode, setMode] = useState<'topics' | 'exam' | 'result'>('topics');
  const [topicIndex, setTopicIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ q: number; s: number; ok: boolean }[]>([]);

  const block = ranks.flatMap(r => r.blocks).find(b => b.id === blockId);
  const rank = ranks.find(r => r.blocks.some(b => b.id === blockId));

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);

    if (sp.get('exam') === 'true') {
      setMode('exam');
    }
  }, [sp]);

  if (!block || !rank) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Блок не найден</h1>
          <Link href="/" className="duo-btn duo-btn-green px-6 py-3">На главную</Link>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const colorMap: Record<string, string> = {
    'duo-green': 'text-duo-green bg-duo-green',
    'duo-blue': 'text-duo-blue bg-duo-blue',
    'duo-purple': 'text-duo-purple bg-duo-purple',
    'duo-orange': 'text-duo-orange bg-duo-orange',
  };
  const rc = rank.color;

  const handleNextTopic = () => {
    const topic = block.topics[topicIndex];
    const p = completeTopic(progress, topic.id);
    saveProgress(p);
    setProgress(p);
    if (topicIndex < block.topics.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setTopicIndex(i => i + 1), 100);
    } else {
      // All topics done
      setMode('exam');
    }
  };

  const handleAnswer = (idx: number) => {
    if (showExp) return;
    setSelected(idx);
    setShowExp(true);
    const isCorrect = idx === block.exam[qi].correctIndex;
    if (isCorrect) setCorrect(c => c + 1);
    setAnswers(a => [...a, { q: qi, s: idx, ok: isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (qi < block.exam.length - 1) {
      setQi(q => q + 1);
      setSelected(null);
      setShowExp(false);
    } else {
      const finalScore = Math.round((correct / block.exam.length) * 100);
      setScore(finalScore);
      setMode('result');
      const p = completeBlockExam(progress, blockId, finalScore);
      saveProgress(p);
      setProgress(p);
    }
  };

  const handleRetry = () => {
    setQi(0);
    setSelected(null);
    setShowExp(false);
    setCorrect(0);
    setScore(0);
    setAnswers([]);
    setMode('exam');
  };

  // Topic flashcard view
  if (mode === 'topics') {
    const topic = block.topics[topicIndex];
    return (
      <div className="min-h-screen bg-[#131F24]">
        <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/rank/${rank.id}`} className="duo-btn duo-btn-gray px-3 py-2 text-sm"><ArrowLeft className="w-4 h-4" /></Link>
              <span className="font-extrabold text-sm">{block.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{topicIndex + 1}/{block.topics.length}</span>
              <div className="flex items-center gap-1.5 bg-[#37464F] rounded-full px-3 py-1.5">
                <Star className="w-4 h-4 text-duo-yellow" />
                <span className="font-bold text-sm text-duo-yellow">{progress.xp} XP</span>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 py-8">
          <div className="duo-progress mb-6">
            <div className="duo-progress-fill bg-duo-green" style={{ width: `${((topicIndex + 1) / block.topics.length) * 100}%` }} />
          </div>
          <div className="flashcard-container cursor-pointer" style={{ height: 320 }}
            onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`flashcard-inner relative w-full h-full transition-transform duration-500 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              <div className="flashcard-front absolute inset-0 duo-card flex flex-col items-center justify-center bg-gradient-to-br from-[#1A2C38] to-[#2A3A44]">
                <div className="text-5xl mb-4">{block.icon}</div>
                <span className="text-sm text-gray-500 mb-2">Тема {topic.number}</span>
                <h3 className="text-xl font-extrabold text-center px-4">{topic.title}</h3>
                <p className="text-sm text-gray-400 mt-4">Нажмите, чтобы узнать ответ</p>
              </div>
              <div className="flashcard-back absolute inset-0 duo-card flex flex-col items-center justify-center bg-gradient-to-br from-duo-green/5 to-duo-blue/5 [transform:rotateY(180deg)]">
                <div className="text-5xl mb-4">{block.icon}</div>
                <span className="text-sm text-gray-500 mb-2">{topic.title}</span>
                <p className="text-center px-6 leading-relaxed">{topic.description}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <div></div>
            <button onClick={handleNextTopic} className="duo-btn duo-btn-green px-8 py-3 flex items-center gap-2 font-bold">
              {topicIndex === block.topics.length - 1 ? 'К экзамену' : 'Далее'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Exam mode
  if (mode === 'exam') {
    const q = block.exam[qi];
    return (
      <div className="min-h-screen bg-[#131F24]">
        <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/rank/${rank.id}`} className="duo-btn duo-btn-gray px-3 py-2 text-sm"><ArrowLeft className="w-4 h-4" /></Link>
              <span className="text-sm font-extrabold">Экзамен: {block.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-400">{qi + 1}/{block.exam.length}</span>
            </div>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 py-8">
          <div className="duo-progress mb-6">
            <div className="duo-progress-fill bg-yellow-400" style={{ width: `${((qi + 1) / block.exam.length) * 100}%` }} />
          </div>
          <div className="duo-card">
            <h3 className="text-lg font-extrabold mb-5">{q.question}</h3>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                let cls = 'quiz-option';
                if (showExp) {
                  if (i === q.correctIndex) cls += ' correct';
                  else if (i === selected) cls += ' incorrect';
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={showExp} className={cls}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        showExp && i === q.correctIndex ? 'bg-duo-green text-white' :
                        showExp && i === selected ? 'bg-duo-red text-white' : 'bg-[#37464F]'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
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
                  <span className={`font-bold ${selected === q.correctIndex ? 'text-duo-green' : 'text-duo-red'}`}>
                    {selected === q.correctIndex ? 'Правильно!' : 'Неправильно'}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{q.explanation}</p>
              </div>
            )}
          </div>
          {showExp && (
            <div className="flex justify-end mt-4">
              <button onClick={handleNextQuestion}
                className="duo-btn bg-yellow-400 text-black px-8 py-3 flex items-center gap-2 font-bold">
                {qi === block.exam.length - 1 ? 'Результат' : 'Далее'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Result
  return (
    <div className="min-h-screen bg-[#131F24]">
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <span className="font-extrabold">Результат: {block.title}</span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="duo-card text-center">
          <div className="text-6xl mb-4">{score === 100 ? '🏆' : '📚'}</div>
          <h2 className="text-2xl font-extrabold mb-2">{score === 100 ? 'Экзамен сдан!' : 'Нужно 100%'}</h2>
          <p className="text-gray-400 mb-5">Правильных: {correct} из {block.exam.length}</p>
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="duo-card px-6 py-3"><div className="text-3xl font-extrabold text-duo-green">{score}%</div><div className="text-xs text-gray-400">Результат</div></div>
            <div className="duo-card px-6 py-3"><div className="text-3xl font-extrabold text-duo-yellow">+{score * 3}</div><div className="text-xs text-gray-400">XP</div></div>
          </div>
          {answers.length > 0 && (
            <div className="text-left mb-4">
              <p className="font-bold text-sm mb-2">Ваши ответы:</p>
              {answers.map((a, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm mb-1 ${a.ok ? 'bg-duo-green/10' : 'bg-duo-red/10'}`}>
                  {a.ok ? <CheckCircle className="w-4 h-4 text-duo-green flex-shrink-0" /> : <XCircle className="w-4 h-4 text-duo-red flex-shrink-0" />}
                  <span>{block.exam[a.q].question.substring(0, 50)}...</span>
                </div>
              ))}
            </div>
          )}
          {score === 100 ? (
            <Link href={`/rank/${rank.id}`} className="duo-btn duo-btn-green px-8 py-3 w-full flex items-center justify-center gap-2 font-bold">
              <CheckCircle className="w-5 h-5" /> Вернуться к блокам
            </Link>
          ) : (
            <button onClick={handleRetry} className="duo-btn bg-yellow-400 text-black px-8 py-3 w-full flex items-center justify-center gap-2 font-bold">
              <RotateCcw className="w-5 h-5" /> Попробовать снова
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BlockPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    }>
      <BlockPageContent />
    </Suspense>
  );
}
