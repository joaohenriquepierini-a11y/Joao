
import React, { useState, useRef } from 'react';
import { Sale, PDV } from '../types';

interface Props {
  sales: Sale[];
  pdvs: PDV[];
  userName: string;
  userImage: string;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string) => void;
}

const Dashboard: React.FC<Props> = ({ sales, pdvs, userName, userImage, onUpdateName, onUpdateImage }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName === 'Usuário' ? '' : userName);
  const [tempImage, setTempImage] = useState(userImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_IN_MS = 7 * DAY_IN_MS;

  const lastBackupTimestamp = Number(localStorage.getItem('tp_last_backup') || 0);
  const needsBackup = (now - lastBackupTimestamp) > SEVEN_DAYS_IN_MS;

  const dateNow = new Date();
  const firstDayThisMonth = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1).getTime();
  const firstDayLastMonth = new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, 1).getTime();
  const lastDayLastMonth = firstDayThisMonth - 1;

  const currentMonthSales = sales.filter(s => s.timestamp >= firstDayThisMonth);
  const currentTotal = currentMonthSales.reduce((acc, curr) => acc + curr.total, 0);

  const lastMonthSales = sales.filter(s => s.timestamp >= firstDayLastMonth && s.timestamp <= lastDayLastMonth);
  const lastMonthTotal = lastMonthSales.reduce((acc, curr) => acc + curr.total, 0);

  const diffPercent = lastMonthTotal > 0 ? ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const isUp = currentTotal >= lastMonthTotal;

  const registeredPdvCities: string[] = Array.from(new Set(pdvs.map(p => p.city)));

  const citiesData = registeredPdvCities.reduce<Record<string, number>>((acc, cityName: string) => {
    const lastPdvSaleInCity = sales
      .filter(s => s.type === 'PDV' && s.city === cityName)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    acc[cityName] = lastPdvSaleInCity ? lastPdvSaleInCity.timestamp : 0;
    return acc;
  }, {});

  const cityAbsence = Object.entries(citiesData)
    .map(([name, lastVisit]) => ({
      name,
      daysSince: lastVisit === 0 ? 999 : Math.floor((now - lastVisit) / DAY_IN_MS),
      lastVisit
    }))
    .sort((a, b) => b.daysSince - a.daysSince);

  const criticalCities = cityAbsence.filter(c => c.daysSince > 28);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    onUpdateName(tempName.trim() || 'Usuário');
    onUpdateImage(tempImage);
    setIsEditingProfile(false);
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-32">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="size-12 rounded-full bg-cover bg-center border border-black/10 shadow-sm overflow-hidden active:scale-90 transition-transform bg-surface-light/30 dark:bg-surface-dark flex items-center justify-center" 
            style={userImage ? { backgroundImage: `url("${userImage}")` } : {}}
          >
            {!userImage && <span className="material-symbols-outlined text-text-sub-light text-2xl">person</span>}
          </button>
          <div>
            <p className="text-[10px] text-text-sub-light font-black uppercase tracking-widest leading-none mb-1">Boas vendas,</p>
            <h2 className="text-text-main-light dark:text-text-main-dark text-xl font-bold tracking-tight italic uppercase">
              {userName}
            </h2>
          </div>
        </div>
        <div className="size-11 bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark rounded-2xl flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10">
          <span className="material-symbols-outlined text-primary">analytics</span>
        </div>
      </header>

      {needsBackup && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-surface-light/30 backdrop-blur-xl dark:bg-surface-dark rounded-[3rem] p-8 shadow-sm border border-black/10 dark:border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
              <span className="material-symbols-outlined text-9xl text-primary">cloud_upload</span>
            </div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="px-4 py-1 rounded-full bg-primary/10 border border-black/5 mb-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Lembrete de Segurança</span>
              </div>
              <h3 className="text-sm font-black text-text-main-light dark:text-text-main-dark leading-tight italic uppercase max-w-[220px]">
                Já faz uma semana! Faça um backup para não perder seus dados.
              </h3>
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/10">
                <span className="material-symbols-outlined !text-sm font-black animate-pulse">backup</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Ação Necessária</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {criticalCities.length > 0 && (
        <section className="animate-bounce-short">
          <div className="bg-red-500 text-white rounded-[2.5rem] p-6 shadow-xl shadow-red-500/20 relative overflow-hidden border border-black/10">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-7xl transform rotate-12 font-black">emergency_home</span>
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Limite de Rota PDV Excedido</span>
              <h3 className="text-lg font-black leading-tight italic uppercase mt-1">
                {criticalCities.length === 1 
                  ? `Você não visita os PDVs de ${criticalCities[0].name} há ${criticalCities[0].daysSince >= 999 ? 'muito tempo' : criticalCities[0].daysSince + ' dias'}!`
                  : `Atenção: ${criticalCities.length} cidades com PDVs precisam de visita urgente!`}
              </h3>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="bg-surface-light/30 backdrop-blur-xl dark:bg-surface-dark rounded-[3rem] p-8 shadow-sm border border-black/10 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
            <span className="material-symbols-outlined text-9xl text-primary">receipt_long</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="px-4 py-1 rounded-full bg-primary/10 border border-black/5 mb-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Faturamento do Mês</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-primary font-bold text-lg">R$</span>
              <h1 className="text-4xl font-bold tracking-tighter text-text-main-light dark:text-text-main-dark italic">
                {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h1>
            </div>
            <div className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-black/5 ${isUp ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
              <span className="material-symbols-outlined !text-sm font-black">
                {isUp ? 'trending_up' : 'trending_down'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {Math.abs(diffPercent).toFixed(1)}% vs mês anterior
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Atenção à Rota PDV</h3>
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Cidades Cadastradas</span>
        </div>
        <div className="flex flex-col gap-3">
          {cityAbsence.length === 0 ? (
            <div className="py-12 flex flex-col items-center opacity-20 italic">
               <span className="material-symbols-outlined text-4xl mb-2">storefront</span>
               <p className="text-xs">Cadastre PDVs para ver sua rota.</p>
            </div>
          ) : (
            cityAbsence.slice(0, 5).map(city => (
              <div key={city.name} className={`p-4 rounded-[2rem] border shadow-sm flex justify-between items-center transition-all ${city.daysSince > 28 ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark border-black/10 dark:border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center border border-black/5 ${city.daysSince > 28 ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary'}`}>
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase italic leading-none">{city.name}</h4>
                    <p className={`text-[9px] font-bold mt-1 uppercase ${city.daysSince > 28 ? 'text-red-500' : 'text-text-sub-light'}`}>
                      {city.daysSince === 0 ? 'Visitado hoje' : city.daysSince >= 999 ? 'Sem visitas registradas' : `${city.daysSince} dias sem visita`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-xs rounded-[3xl] p-8 shadow-2xl border border-black/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black uppercase italic text-center mb-8">Meu Perfil</h3>
            
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div 
                  className="size-28 rounded-[2.5rem] bg-cover bg-center border border-black/10 shadow-xl overflow-hidden flex items-center justify-center bg-background-light dark:bg-white/5" 
                  style={tempImage ? { backgroundImage: `url("${tempImage}")` } : {}}
                >
                  {!tempImage && <span className="material-symbols-outlined text-gray-400 text-5xl">person_add</span>}
                </div>
                <div className="absolute -bottom-1 -right-1 size-10 bg-primary text-white rounded-2xl flex items-center justify-center border-2 border-white dark:border-surface-dark shadow-lg">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="w-full space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Como quer ser chamado?</label>
                <input 
                  type="text" 
                  className="w-full bg-background-light/50 dark:bg-white/5 border border-black/5 rounded-2xl p-4 text-center font-bold text-lg focus:ring-2 focus:ring-primary/40" 
                  value={tempName} 
                  placeholder="Seu nome"
                  onChange={e => setTempName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSaveProfile} 
                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all border border-black/5"
              >
                Salvar Cadastro
              </button>
              <button 
                onClick={() => setIsEditingProfile(false)} 
                className="w-full text-[10px] font-black uppercase text-gray-400 py-2 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
