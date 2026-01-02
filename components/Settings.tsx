import React from 'react';

interface Props {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Settings: React.FC<Props> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 border-b border-gray-200 dark:border-gray-800/50">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white text-center">Configurações</h1>
      </header>

      <main className="p-4 flex flex-col gap-8 pb-20">
        <section>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Nuvem e Dados</h2>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-3xl">cloud_sync</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Backup no Google Drive</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Mantenha seu histórico de vendas sincronizado e seguro em sua conta Google.</p>
              </div>
            </div>
            <button className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition">
              <span className="material-symbols-outlined">add_to_drive</span>
              <span>Conectar Google Drive</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
              <span className="material-symbols-outlined !text-[12px]">lock</span>
              Seus dados são criptografados
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Preferências</h2>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
            <SettingsToggle icon="dark_mode" label="Modo Escuro" checked={isDarkMode} onChange={onToggleTheme} color="text-neutral-600 bg-neutral-100 dark:bg-neutral-800" />
            <SettingsAction icon="attach_money" label="Moeda Principal" value="BRL (R$)" color="text-green-600 bg-green-50" />
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Suporte</h2>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
            <SettingsAction icon="star" label="Avaliar App" color="text-yellow-600 bg-yellow-50" />
            <SettingsAction icon="policy" label="Política de Privacidade" color="text-teal-600 bg-teal-50" />
          </div>
        </section>

        <p className="text-center text-[10px] text-gray-400 font-medium">Trufa Pro v1.2.0 • Made with ❤️</p>
      </main>
    </div>
  );
};

const SettingsToggle: React.FC<{ icon: string, label: string, checked: boolean, onChange?: () => void, color: string }> = ({ icon, label, checked, onChange, color }) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <div className={`size-10 rounded-lg flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
);

const SettingsAction: React.FC<{ icon: string, label: string, value?: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`size-10 rounded-lg flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
      <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward_ios</span>
    </div>
  </div>
);

export default Settings;