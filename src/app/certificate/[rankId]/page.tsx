'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ranks } from '@/data/course';
import { getProgress, updateStreak, saveProgress } from '@/lib/progress';
import { ArrowLeft, Printer } from 'lucide-react';

export default function CertificatePage() {
  const params = useParams();
  const rankId = params.rankId as string;
  const [progress, setProgress] = useState<any>(null);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }));
    const p = getProgress();
    saveProgress(updateStreak(p));
    setProgress(p);
  }, []);

  const rank = ranks.find(r => r.id === rankId);
  if (!rank) return (
    <div className="min-h-screen bg-[#131F24] flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-4">🔍</div><h1 className="font-bold mb-2">Сертификат не найден</h1><Link href="/" className="duo-btn duo-btn-green px-6 py-3">На главную</Link></div>
    </div>
  );

  if (!progress) return null;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#131F24]">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between no-print">
        <Link href={`/rank/${rankId}`} className="duo-btn duo-btn-gray px-4 py-2 flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Назад</Link>
        <button onClick={handlePrint} className="duo-btn duo-btn-green px-4 py-2 flex items-center gap-2 text-sm"><Printer className="w-4 h-4" /> Печать / PDF</button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div id="certificate" className="bg-white text-black rounded-3xl p-12 shadow-2xl" style={{ pageBreakInside: 'avoid' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">{rank.certificateTitle}</h1>
            <div className="w-24 h-1 bg-yellow-400 mx-auto my-4" />
            <p className="text-xl text-gray-500 uppercase tracking-widest font-medium">{rank.certificateSubtitle}</p>
          </div>

          {/* Body */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-500 mb-3">Настоящий сертификат подтверждает, что</p>
            <div className="text-3xl font-black text-gray-900 mb-3 border-b-2 border-dashed border-gray-300 pb-3 inline-block px-12">
              {progress.name}
            </div>
            <p className="text-lg text-gray-500 mt-3">
              успешно прошёл(а) полный курс обучения <span className="font-bold text-gray-800">{rank.title}</span>
            </p>
            <p className="text-gray-500 mt-2">и сдал(а) финальный экзамен на 100%.</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Дата</p>
              <p className="font-bold text-gray-800">{today}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Опыт (XP)</p>
              <p className="font-bold text-gray-800">{progress.xp} XP</p>
            </div>
          </div>

          {/* Competencies */}
          <div className="mb-8">
            <p className="text-sm text-gray-400 uppercase tracking-wider text-center mb-3">Допуски и компетенции</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Торговый зал', 'Выкладка товара', 'Приёмка товара', 'Возвраты поставщику', 'Ценники', 'Печать ценников', 'Контроль сроков', 'Гарантия свежести', 'Санитария', 'Работа с клиентом'].map(s => (
                <div key={s} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-sm">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span className="font-bold text-gray-600">RetailPro</span>
              <span>•</span>
              <span className="text-sm">Обучающая платформа для супермаркетов</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
