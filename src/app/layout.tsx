import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RetailPro — Обучающая платформа для супермаркетов',
  description: 'Полный курс подготовки персонала супермаркета: от новичка до руководителя',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
