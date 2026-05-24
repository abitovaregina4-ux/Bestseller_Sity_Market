'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { courseData } from '@/data/course';
import { getProgress, updateStreak, saveProgress, completeLesson, isLessonUnlocked } from '@/lib/progress';
import { UserProgress } from '@/types';
import { ArrowLeft, Star, Flame, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Trophy, Zap } from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mode, setMode] = useState<'flashcards' | 'quiz' | 'result'>('flashcards');
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const p = getProgress();
    const updated = updateStreak(p);
    saveProgress(updated);
    setProgress(updated);
  }, []);

  const lesson = courseData.flatMap(l => l.blocks).flatMap(b => b.lessons).find(l => l.id === lessonId);
  const level = courseData.find(l => l.blocks.some(b => b.lessons.some(ls => ls.id === lessonId)));
  const block = level?.blocks.find(b => b.lessons.some(ls => ls.id === lessonId));

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Урок не найден</h1>
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

  const unlocked = isLessonUnlocked(progress, courseData, lessonId);

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center duo-card max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">Урок заблокирован</h1>
          <p className="text-gray-400 mb-4">Пройдите предыдущий урок на 100%, чтобы открыть этот урок.</p>
          <Link href={`/level/${level?.id}`} className="duo-btn duo-btn-green px-6 py-3">Назад к уровню</Link>
        </div>
      </div>
    );
  }

  const handleNextCard = () => {
    if (currentCard < lesson.flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCard(c => c + 1), 150);
    } else {
      setMode('quiz');
    }
  };

  const handlePrevCard = () => {
    if (currentCard > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCard(c => c - 1), 150);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === lesson.quiz[currentQuestion].correctIndex) {
      setCorrectAnswers(c => c + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < lesson.quiz.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = Math.round((correctAnswers / lesson.quiz.length) * 100);
      setScore(finalScore);
      setQuizComplete(true);
      setMode('result');

      const updatedProgress = completeLesson(progress, lessonId, finalScore);
      saveProgress(updatedProgress);
      setProgress(updatedProgress);
    }
  };

  const handleRetry = () => {
    setMode('flashcards');
    setCurrentCard(0);
    setIsFlipped(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setQuizComplete(false);
    setScore(0);
  };

  const card = lesson.flashcards[currentCard];
  const question = lesson.quiz[currentQuestion];

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
              <span className="text-xl">{lesson.icon}</span>
              <span className="font-extrabold">{lesson.title}</span>
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
            <span className="text-gray-400">
              {mode === 'flashcards' ? `Карточка ${currentCard + 1} из ${lesson.flashcards.length}` :
               mode === 'quiz' ? `Вопрос ${currentQuestion + 1} из ${lesson.quiz.length}` :
               'Результат'}
            </span>
            <span className="font-bold text-duo-green">
              {mode === 'flashcards' ? `${Math.round(((currentCard + 1) / lesson.flashcards.length) * 100)}%` :
               mode === 'quiz' ? `${Math.round(((currentQuestion + 1) / lesson.quiz.length) * 100)}%` :
               `${score}%`}
            </span>
          </div>
          <div className="duo-progress">
            <div
              className="duo-progress-fill bg-duo-green"
              style={{
                width: mode === 'flashcards' ? `${((currentCard + 1) / lesson.flashcards.length) * 100}%` :
                       mode === 'quiz' ? `${((currentQuestion + 1) / lesson.quiz.length) * 100}%` :
                       '100%'
              }}
            />
          </div>
        </div>

        {/* Flashcards Mode */}
        {mode === 'flashcards' && card && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-400 font-bold">КАРТОЧКА {currentCard + 1} / {lesson.flashcards.length}</span>
            </div>

            <div
              className="flashcard-container cursor-pointer"
              style={{ height: '300px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`flashcard-inner relative w-full h-full transition-transform duration-500 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="flashcard-front absolute inset-0 duo-card flex flex-col items-center justify-center bg-gradient-to-br from-[#1A2C38] to-[#2A3A44]">
                  <div className="text-5xl mb-4">{card.icon}</div>
                  <h3 className="text-xl font-extrabold text-center px-4">{card.front}</h3>
                  <p className="text-sm text-gray-400 mt-4">Нажмите, чтобы перевернуть</p>
                </div>

                {/* Back */}
                <div className="flashcard-back absolute inset-0 duo-card flex flex-col items-center justify-center bg-gradient-to-br from-duo-green/10 to-duo-blue/10 border-duo-green/30 [transform:rotateY(180deg)]">
                  <div className="text-5xl mb-4">{card.icon}</div>
                  <p className="text-center px-6 text-lg leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevCard}
                disabled={currentCard === 0}
                className={`duo-btn px-6 py-3 flex items-center gap-2 ${currentCard === 0 ? 'duo-btn-gray opacity-50' : 'duo-btn-blue'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                Назад
              </button>

              <div className="flex gap-1">
                {lesson.flashcards.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === currentCard ? 'bg-duo-green' : i < currentCard ? 'bg-duo-green/50' : 'bg-[#37464F]'}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextCard}
                className="duo-btn duo-btn-green px-6 py-3 flex items-center gap-2"
              >
                {currentCard === lesson.flashcards.length - 1 ? 'К тесту' : 'Далее'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {mode === 'quiz' && question && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-400 font-bold">ВОПРОС {currentQuestion + 1} / {lesson.quiz.length}</span>
            </div>

            <div className="duo-card">
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
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="duo-btn duo-btn-green px-8 py-3 flex items-center gap-2"
                >
                  {currentQuestion === lesson.quiz.length - 1 ? 'Результат' : 'Далее'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result Mode */}
        {mode === 'result' && (
          <div className="space-y-6">
            <div className="duo-card text-center bg-gradient-to-br from-[#1A2C38] to-[#2A3A44]">
              <div className="text-6xl mb-4">
                {score === 100 ? '🎉' : score >= 80 ? '👍' : '📚'}
              </div>
              <h2 className="text-2xl font-extrabold mb-2">
                {score === 100 ? 'Отлично!' : score >= 80 ? 'Хорошо!' : 'Нужно повторить'}
              </h2>
              <p className="text-gray-400 mb-6">
                Вы ответили правильно на {correctAnswers} из {lesson.quiz.length} вопросов
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="duo-card text-center px-6">
                  <div className="text-3xl font-extrabold text-duo-green">{score}%</div>
                  <div className="text-sm text-gray-400">Результат</div>
                </div>
                <div className="duo-card text-center px-6">
                  <div className="text-3xl font-extrabold text-duo-yellow">+{score * 10}</div>
                  <div className="text-sm text-gray-400">XP</div>
                </div>
              </div>

              {score === 100 ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-duo-green/10 border border-duo-green/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-6 h-6 text-duo-yellow" />
                      <span className="font-bold text-duo-green">Урок пройден!</span>
                    </div>
                    <p className="text-sm text-gray-300">Следующий урок разблокирован 🎉</p>
                  </div>
                  <Link
                    href={`/level/${level?.id}`}
                    className="duo-btn duo-btn-green px-8 py-3 w-full flex items-center justify-center gap-2"
                  >
                    К следующему уроку
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-duo-red/10 border border-duo-red/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-6 h-6 text-duo-yellow" />
                      <span className="font-bold text-duo-red">Нужно 100% для прохождения</span>
                    </div>
                    <p className="text-sm text-gray-300">Повторите карточки и попробуйте снова</p>
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
          </div>
        )}
      </main>
    </div>
  );
}
