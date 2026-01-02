
import React, { useRef } from 'react';

interface Props {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userName: string;
  userImage: string;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string) => void;
}

const Settings: React.FC<Props> = ({ isDarkMode, onToggleTheme, userName, userImage, onUpdateName, onUpdateImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        {/* SEÇÃO MEU PERFIL */}
        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Meu Perfil</h2>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-5">
            <div className="relative shrink-0 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div 
                className="size-16 rounded-2xl bg-cover bg-center border-2 border-primary/20 shadow-md"
                style={{ backgroundImage: `url("${userImage}")` }}
              ></div>
              <div className="absolute -bottom-1 -right-1 size-6 bg-primary text-white rounded-lg flex items-center justify-center border-2 border-white dark:border-surface-dark">
                <span className="material-symbols-outlined !text-xs font-black">photo_camera</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                className="w-full bg-transparent border-none p-0 text-lg font-black text-text-main-light dark:text-white italic focus:ring-0 uppercase tracking-tighter"
                value={userName}
                onChange={e => onUpdateName(e.target.value)}
              />
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Vendedor Master</p>
            </div>
            <span className="material-symbols-outlined text-gray-200">edit</span>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Nuvem e Dados</h2>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">cloud_sync</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-text-main-light dark:text-white uppercase italic">Backup Seguro</h3>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-bold">Mantenha seu histórico seguro em sua conta Google.</p>
              </div>
            </div>
            <button className="w-full h-12 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all">
              Conectar Google Drive
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Preferências</h2>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            <SettingsToggle icon="dark_mode" label="Modo Escuro" checked={isDarkMode} onChange={onToggleTheme} />
            <SettingsAction icon="notifications" label="Notificações de Rota" value="Ativado" />
          </div>
        </section>

        <div className="mt-4 flex flex-col items-center gap-2 opacity-30">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Trufa Pro v2.0.0</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined !text-sm">verified_user</span>
            <span className="material-symbols-outlined !text-sm">security</span>
          </div>
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
