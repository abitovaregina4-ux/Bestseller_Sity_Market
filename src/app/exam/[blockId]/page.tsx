'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseData } from '@/data/course';
import { getProgress, updateStreak, saveProgress, completeBlock } from '@/lib/progress';
import { UserProgress } from '@/types';
import { ArrowLeft, Star, Flame, ChevronRight, CheckCircle, XCircle, Trophy, RotateCcw, Zap, Award } from 'lucide-react';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.blockId as string;
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [examComplete, setExamComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionIndex: number; selected: number; correct: boolean }[]>([]);

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);
  }, []);

  const block = courseData.flatMap(l => l.blocks).find(b => b.id === blockId);
  const level = courseData.find(l => l.blocks.some(b => b.id === blockId));

  if (!block) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Экзамен не найден</h1>
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

  const question = block.exam[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === question.correctIndex;
    if (isCorrect) {
      setCorrectAnswers(c => c + 1);
    }
    setAnswers(a => [...a, { questionIndex: currentQuestion, selected: answerIndex, correct: isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < block.exam.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = Math.round((correctAnswers / block.exam.length) * 100);
      setScore(finalScore);
      setExamComplete(true);

      const updatedProgress = completeBlock(progress, blockId, finalScore);
      saveProgress(updatedProgress);
      setProgress(updatedProgress);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setExamComplete(false);
    setScore(0);
    setAnswers([]);
  };

  if (examComplete) {
    return (
      <div className="min-h-screen bg-[#131F24]">
        <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/level/${level?.id}`} className="duo-btn duo-btn-gray px-3 py-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="font-extrabold">Экзамен: {block.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-[#37464F] rounded-full px-3 py-1.5">
                <Star className="w-5 h-5 text-duo-yellow" />
                <span className="font-bold text-duo-yellow">{progress.xp} XP</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="duo-card text-center bg-gradient-to-br from-[#1A2C38] to-[#2A3A44]">
            <div className="text-7xl mb-4">
              {score === 100 ? '🏆' : score >= 80 ? '🎉' : '📚'}
            </div>
            <h2 className="text-3xl font-extrabold mb-2">
              {score === 100 ? 'Экзамен сдан!' : score >= 80 ? 'Почти отлично!' : 'Нужно повторить'}
            </h2>
            <p className="text-gray-400 mb-6">
              Вы ответили правильно на {correctAnswers} из {block.exam.length} вопросов
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="duo-card text-center px-6">
                <div className="text-4xl font-extrabold text-duo-green">{score}%</div>
                <div className="text-sm text-gray-400">Результат</div>
              </div>
              <div className="duo-card text-center px-6">
                <div className="text-4xl font-extrabold text-duo-yellow">+{score * 20}</div>
                <div className="text-sm text-gray-400">XP</div>
              </div>
            </div>

            {/* Answers Review */}
            <div className="text-left mb-6">
              <h3 className="font-bold mb-3">Ваши ответы:</h3>
              <div className="space-y-2">
                {answers.map((answer, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${answer.correct ? 'bg-duo-green/10' : 'bg-duo-red/10'}`}>
                    {answer.correct ? (
                      <CheckCircle className="w-5 h-5 text-duo-green flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-duo-red flex-shrink-0" />
                    )}
                    <span className="text-sm">{block.exam[answer.questionIndex].question}</span>
                  </div>
                ))}
              </div>
            </div>

            {score === 100 ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-duo-green/10 border border-duo-green/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-6 h-6 text-duo-yellow" />
                    <span className="font-bold text-duo-green">Блок пройден!</span>
                  </div>
                  <p className="text-sm text-gray-300">Следующий блок разблокирован 🎉</p>
                </div>
                <Link
                  href={`/level/${level?.id}`}
                  className="duo-btn duo-btn-green px-8 py-3 w-full flex items-center justify-center gap-2"
                >
                  К следующему блоку
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-duo-red/10 border border-duo-red/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-6 h-6 text-duo-yellow" />
                    <span className="font-bold text-duo-red">Нужно 100% для сдачи</span>
                  </div>
                  <p className="text-sm text-gray-300">Повторите материал и попробуйте снова</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="duo-btn duo-btn-yellow px-8 py-3 w-full flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Попробовать снова
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131F24]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/level/${level?.id}`} className="duo-btn duo-btn-gray px-3 py-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-duo-yellow" />
              <span className="font-extrabold">Экзамен: {block.title}</span>
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

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400 font-bold">ВОПРОС {currentQuestion + 1} / {block.exam.length}</span>
            <span className="font-bold text-duo-yellow">{Math.round(((currentQuestion + 1) / block.exam.length) * 100)}%</span>
          </div>
          <div className="duo-progress">
            <div
              className="duo-progress-fill bg-duo-yellow"
              style={{ width: `${((currentQuestion + 1) / block.exam.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="duo-card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-duo-yellow" />
            <span className="text-sm font-bold text-duo-yellow">ЭКЗАМЕН</span>
          </div>

          <h3 className="text-xl font-extrabold mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              let optionClass = 'quiz-option';
              if (showExplanation) {
                if (index === question.correctIndex) {
                  optionClass += ' correct';
                } else if (index === selectedAnswer && index !== question.correctIndex) {
                  optionClass += ' incorrect';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showExplanation}
                  className={optionClass}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      showExplanation && index === question.correctIndex ? 'bg-duo-green text-white' :
                      showExplanation && index === selectedAnswer ? 'bg-duo-red text-white' :
                      'bg-[#37464F]'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`mt-6 p-4 rounded-xl ${
              selectedAnswer === question.correctIndex ? 'bg-duo-green/10 border border-duo-green/30' : 'bg-duo-red/10 border border-duo-red/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === question.correctIndex ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-duo-green" />
                    <span className="font-bold text-duo-green">Правильно!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-duo-red" />
                    <span className="font-bold text-duo-red">Неправильно</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-300">{question.explanation}</p>
            </div>
          )}
        </div>

        {showExplanation && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleNextQuestion}
              className="duo-btn duo-btn-yellow px-8 py-3 flex items-center gap-2"
            >
              {currentQuestion === block.exam.length - 1 ? 'Результат' : 'Далее'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
