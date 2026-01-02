
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userName: string;
  userImage: string;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string) => void;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ isDarkMode, onToggleTheme, userName, userImage, onUpdateName, onUpdateImage, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-8 border-b border-gray-100 dark:border-white/5">
        <h1 className="text-2xl font-black tracking-tight text-text-main-light dark:text-white uppercase italic">Ajustes</h1>
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Configurações do Sistema</p>
      </header>

      <main className="p-6 flex flex-col gap-8 pb-32">
        {!isInstalled && (
          <section>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Aplicativo</h2>
            <div className="bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-6 border-2 border-primary/20 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-2xl">install_mobile</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-text-main-light dark:text-white uppercase italic leading-none">Trufa Pro no seu Celular</h3>
                  <p className="text-[9px] text-primary font-bold mt-1 uppercase">Acesso rápido e funcionamento offline</p>
                </div>
              </div>
              <button 
                onClick={handleInstallApp}
                className={`w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${deferredPrompt ? 'bg-primary text-white shadow-xl shadow-primary/20 active:scale-95' : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'}`}
              >
                {deferredPrompt ? 'Instalar Agora' : 'Pronto para Instalação'}
              </button>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Meu Cadastro</h2>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-5">
            <div className="relative shrink-0 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div 
                className="size-16 rounded-2xl bg-cover bg-center border-2 border-primary/20 shadow-md bg-gray-100 dark:bg-white/5 flex items-center justify-center"
                style={userImage ? { backgroundImage: `url("${userImage}")` } : {}}
              >
                {!userImage && <span className="material-symbols-outlined text-gray-400">person</span>}
              </div>
              <div className="absolute -bottom-1 -right-1 size-6 bg-primary text-white rounded-lg flex items-center justify-center border-2 border-white dark:border-surface-dark">
                <span className="material-symbols-outlined !text-xs font-black">photo_camera</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                className="w-full bg-transparent border-none p-0 text-lg font-black text-text-main-light dark:text-white italic focus:ring-0 uppercase tracking-tighter"
                value={userName === 'Usuário' ? '' : userName}
                placeholder="Usuário"
                onChange={e => onUpdateName(e.target.value || 'Usuário')}
              />
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Identificação do Vendedor</p>
            </div>
            <span className="material-symbols-outlined text-gray-200">edit</span>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Preferências e Segurança</h2>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            <SettingsToggle icon="dark_mode" label="Modo Escuro" checked={isDarkMode} onChange={onToggleTheme} />
            <SettingsAction icon="notifications" label="Notificações de Rota" value="Ativado" />
            
            {/* Botão de Sair Reestilizado */}
            <button 
              onClick={onLogout} 
              className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-500 group-active:scale-90 transition-transform">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-red-500 uppercase italic leading-none block">Encerrar Sessão</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Bloquear acesso com senha</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-red-200 text-sm">chevron_right</span>
            </button>
          </div>
        </section>

        <div className="mt-4 flex flex-col items-center gap-2 opacity-30">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Trufa Pro v2.2.0</p>
        </div>
      </main>
    </div>
  );
};

const SettingsToggle: React.FC<{ icon: string, label: string, checked: boolean, onChange?: () => void }> = ({ icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between p-5">
    <div className="flex items-center gap-4">
      <div className={`size-10 rounded-xl flex items-center justify-center ${checked ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-400'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-xs font-black text-text-main-light dark:text-gray-200 uppercase italic">{label}</span>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
);

const SettingsAction: React.FC<{ icon: string, label: string, value?: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-4">
      <div className="size-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-xs font-black text-text-main-light dark:text-gray-200 uppercase italic">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-[10px] text-primary font-black uppercase tracking-widest">{value}</span>}
      <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
    </div>
  </div>
);

export default Settings;
