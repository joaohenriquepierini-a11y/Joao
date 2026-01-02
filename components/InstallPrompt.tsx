
import React, { useState, useEffect } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // Detect Standalone Mode (Already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIos) {
      // Show iOS prompt after a small delay to not annoy the user immediately
      const timer = setTimeout(() => setShowIosPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setShowAndroidPrompt(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setShowAndroidPrompt(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* Prompt para Android/Chrome */}
      {showAndroidPrompt && (
        <div className="fixed bottom-24 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-[2rem] shadow-2xl border-2 border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-2xl">install_mobile</span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-primary">Instalar App</p>
                <p className="text-xs font-bold text-text-main-light dark:text-white leading-none">Acesso rápido e offline!</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setShowAndroidPrompt(false)} className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase">Depois</button>
               <button onClick={handleInstallClick} className="bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">Instalar</button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Guia para iOS/Safari */}
      {showIosPrompt && (
        <div className="fixed bottom-24 left-6 right-6 z-[100] animate-in fade-in duration-500">
          <div className="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border-2 border-primary/20 flex flex-col items-center text-center">
            <div className="size-14 rounded-[1.5rem] bg-primary mb-4 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-3xl">add_to_home_screen</span>
            </div>
            <h3 className="text-sm font-black uppercase italic text-text-main-light dark:text-white mb-2">Trufa Pro no seu iPhone</h3>
            <p className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark leading-relaxed mb-6">
              Toque no botão <span className="bg-gray-100 dark:bg-white/10 px-1 rounded inline-flex items-center mx-1"><span className="material-symbols-outlined !text-[12px]">ios_share</span> compartilhar</span> abaixo e selecione <br/>
              <span className="text-primary font-black font-display italic">"Adicionar à Tela de Início"</span>
            </p>
            <button 
              onClick={() => setShowIosPrompt(false)} 
              className="w-full py-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400"
            >
              Agora não
            </button>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-surface-dark/95 rotate-45 border-r-2 border-b-2 border-primary/20"></div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
