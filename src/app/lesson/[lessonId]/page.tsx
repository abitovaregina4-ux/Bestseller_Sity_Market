'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ranks } from '@/data/course';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

function LessonPageContent() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const lesson = ranks
    .flatMap(r => r.blocks)
    .flatMap(b => b.topics)
    .find(t => t.id === lessonId);

  const block = ranks
    .flatMap(r => r.blocks)
    .find(b => b.topics.some(t => t.id === lessonId));

  const rank = ranks.find(r => r.blocks.some(b => b.topics.some(t => t.id === lessonId)));

  if (!lesson || !block || !rank) {
    return (
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Урок не найден</h1>
          <Link href="/" className="duo-btn duo-btn-green px-6 py-3">На главную</Link>
        </div>
      </div>
    );
  }

  const topicIndex = block.topics.findIndex(t => t.id === lessonId);

  return (
    <div className="min-h-screen bg-[#131F24]">
      <header className="sticky top-0 z-50 bg-[#1A2C38]/95 backdrop-blur-sm border-b border-[#37464F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/block/${block.id}`} className="duo-btn duo-btn-gray px-3 py-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-extrabold text-sm">{block.title}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#37464F] rounded-full px-3 py-1.5">
            <BookOpen className="w-4 h-4 text-duo-green" />
            <span className="font-bold text-sm">{topicIndex + 1}/{block.topics.length}</span>
          </div>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="duo-card">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{block.icon}</div>
            <span className="inline-block bg-duo-green/10 text-duo-green text-xs font-bold px-3 py-1 rounded-full mb-3">
              Тема {lesson.number}
            </span>
            <h2 className="text-2xl font-extrabold">{lesson.title}</h2>
          </div>
          <div className="bg-[#1A2C38] rounded-xl p-5">
            <p className="leading-relaxed text-gray-200">{lesson.description}</p>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          {topicIndex > 0 ? (
            <Link
              href={`/lesson/${block.topics[topicIndex - 1].id}`}
              className="duo-btn duo-btn-gray px-5 py-3 flex items-center gap-2 font-bold"
            >
              <ChevronLeft className="w-5 h-5" /> Назад
            </Link>
          ) : <div />}
          {topicIndex < block.topics.length - 1 ? (
            <Link
              href={`/lesson/${block.topics[topicIndex + 1].id}`}
              className="duo-btn duo-btn-green px-5 py-3 flex items-center gap-2 font-bold"
            >
              Далее <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href={`/block/${block.id}`}
              className="duo-btn bg-yellow-400 text-black px-5 py-3 flex items-center gap-2 font-bold"
            >
              К экзамену <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
        <div className="animate-pulse text-duo-green text-2xl font-bold">Загрузка...</div>
      </div>
    }>
      <LessonPageContent />
    </Suspense>
  );
}
