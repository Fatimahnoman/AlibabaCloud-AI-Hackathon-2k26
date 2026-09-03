import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduGuard AI - Education, Security & Finance Platform',
  description: 'AI-powered platform for finance education, fraud detection, and smart budgeting with multilingual support.',
  keywords: ['education', 'fraud detection', 'budgeting', 'AI', 'scholarships', 'universities'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
