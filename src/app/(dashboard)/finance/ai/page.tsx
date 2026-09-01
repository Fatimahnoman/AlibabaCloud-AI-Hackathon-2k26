'use client';

import DepartmentChat from '@/components/department-chat/DepartmentChat';

export default function FinanceAIPage() {
  return (
    <div className="animate-fade-in">
      <DepartmentChat
        department="finance"
        title="FinanceAdvisor AI"
        subtitle="Investment, banking, tax & Islamic finance expert"
        avatar="📈"
        avatarColor="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        suggestions={[
          'Pakistan Stock Exchange kya hai?',
          'Meezan Bank me savings account kholna chahta hoon',
          'FBR tax return kaise file karoon?',
          'Islamic banking vs conventional banking?',
          'Halal investment options in Pakistan?',
          'Remittance bhejni hai UK se Pakistan',
        ]}
      />
    </div>
  );
}
