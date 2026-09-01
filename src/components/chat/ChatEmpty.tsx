'use client';

interface ChatEmptyProps {
  onSendMessage: (message: string) => void;
  easyMode?: boolean;
}

const quickActions = [
  { label: 'Education', labelEasy: '🎓 Taleem', icon: '🎓', message: 'Help me with education guidance' },
  { label: 'Fraud Check', labelEasy: '🛡️ Security', icon: '🛡️', message: 'I want to check something for fraud' },
  { label: 'Budget', labelEasy: '💰 Budget', icon: '💰', message: 'Help me create a budget' },
  { label: 'Study Plan', labelEasy: '📚 Study', icon: '📚', message: 'Create a study plan for me' },
];

export default function ChatEmpty({ onSendMessage, easyMode }: ChatEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="text-center max-w-lg">
        <div className={`bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 ${easyMode ? 'w-20 h-20' : 'w-16 h-16'}`}>
          <span className={easyMode ? 'text-4xl' : 'text-3xl'} aria-hidden="true">🤖</span>
        </div>
        <h2 className={`${easyMode ? 'text-3xl' : 'text-2xl'} font-bold gradient-text mb-2`}>
          Assalamualaikum! Main EduGuard AI hoon.
        </h2>
        <p className={`text-cyan-400 mb-8 leading-relaxed ${easyMode ? 'text-base' : ''}`}>
          Education, scholarships, fraud awareness, budgeting aur study planning mein help kar sakta hoon.
          Aap kya poochna chahte hain?
        </p>

        <div className={`grid grid-cols-2 gap-3 max-w-sm mx-auto ${easyMode ? 'gap-4' : ''}`}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onSendMessage(action.message)}
              className={`flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-xl hover:bg-[#0b1120] hover:border-[#334155] transition-all text-left group ${
                easyMode ? 'px-5 py-4 text-base' : 'px-4 py-3'
              }`}
              aria-label={action.label}
            >
              <span className={easyMode ? 'text-2xl' : 'text-lg'} aria-hidden="true">{action.icon}</span>
              <span className={`font-medium text-cyan-400 group-hover:text-cyan-300 ${easyMode ? 'text-base' : 'text-sm'}`}>
                {easyMode ? action.labelEasy : action.label}
              </span>
            </button>
          ))}
        </div>

        <p className={`text-cyan-400 mt-6 ${easyMode ? 'text-sm' : 'text-xs'}`}>
          Try: &quot;mujhe scholarship ke bare me batao&quot; or &quot;What is artificial intelligence?&quot;
        </p>
      </div>
    </div>
  );
}
