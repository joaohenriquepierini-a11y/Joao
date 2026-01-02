
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
  const importInputRef = useRef<HTMLInputElement>(null);
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

  // Lógica de Backup - Exportar
  const handleExportBackup = () => {
    const backupData = {
      sales: JSON.parse(localStorage.getItem('tp_sales') || '[]'),
      truffles: JSON.parse(localStorage.getItem('tp_truffles') || '[]'),
      pdvs: JSON.parse(localStorage.getItem('tp_pdvs') || '[]'),
      name: localStorage.getItem('tp_name') || 'Usuário',
      image: localStorage.getItem('tp_image') || '',
      theme: localStorage.getItem('tp_theme') || 'light',
      version: '2.4.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    
    link.href = url;
    link.download = `trufa-pro-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Atualiza a data do último backup para o lembrete semanal
    localStorage.setItem('tp_last_backup', Date.now().toString());
    
    alert('Backup gerado com sucesso! Salve este arquivo no seu Google Drive para segurança.');
  };

  // Lógica de Backup - Importar
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('ATENÇÃO: Importar um backup irá substituir todos os dados atuais deste dispositivo. Deseja continuar?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validação básica
        if (!data.sales || !data.truffles || !data.pdvs) {
          throw new Error('Arquivo de backup inválido.');
        }

        localStorage.setItem('tp_sales', JSON.stringify(data.sales));
        localStorage.setItem('tp_truffles', JSON.stringify(data.truffles));
        localStorage.setItem('tp_pdvs', JSON.stringify(data.pdvs));
        localStorage.setItem('tp_name', data.name || 'Usuário');
        localStorage.setItem('tp_image', data.image || '');
        localStorage.setItem('tp_theme', data.theme || 'light');
        localStorage.setItem('tp_last_backup', Date.now().toString());
        
        alert('Backup restaurado com sucesso! O aplicativo será reiniciado.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao importar backup: arquivo corrompido ou formato inválido.');
      }
    };
    reader.readAsText(file);
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
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1 italic">Segurança de Dados</h2>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
            <div onClick={handleExportBackup} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <span className="material-symbols-outlined">cloud_download</span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-text-main-light dark:text-gray-200 uppercase italic leading-none block">Exportar Backup</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Salvar dados no Google Drive</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
            </div>

            <div onClick={() => importInputRef.current?.click()} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                  <span className="material-symbols-outlined">cloud_upload</span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-text-main-light dark:text-gray-200 uppercase italic leading-none block">Restaurar Backup</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recuperar dados de um arquivo</span>
                </div>
              </div>
              <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImportBackup} />
              <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
            </div>
          </div>
        </section>

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
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Trufa Pro v2.4.0</p>
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

export default Settings;
