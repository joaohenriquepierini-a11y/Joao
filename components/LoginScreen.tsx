
import React, { useState, useEffect } from 'react';

interface Props {
  onLogin: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const CORRECT_PIN = '1203';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
          onLogin();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center mb-12">
        <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
          <span className="material-symbols-outlined text-primary text-4xl font-black">lock</span>
        </div>
        <h1 className="text-2xl font-black text-text-main-light dark:text-white italic uppercase tracking-tighter">Acesso Restrito</h1>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2 italic">Trufa Pro Master Edition</p>
      </div>

      <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`size-4 rounded-full border-2 transition-all duration-300 ${
              pin.length > i 
                ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/40' 
                : 'border-gray-200 dark:border-white/10'
            } ${error ? 'bg-red-500 border-red-500' : ''}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="size-16 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 text-xl font-black text-text-main-light dark:text-white active:scale-90 active:bg-primary active:text-white transition-all"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleKeyPress('0')}
          className="size-16 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 text-xl font-black text-text-main-light dark:text-white active:scale-90 active:bg-primary active:text-white transition-all"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="size-16 rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl">backspace</span>
        </button>
      </div>

      <p className="mt-12 text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-50">Proteção de Dados Ativada</p>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default LoginScreen;
