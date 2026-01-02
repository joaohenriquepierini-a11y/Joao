
import React, { useState, useRef } from 'react';
import { Sale } from '../types';

interface Props {
  sales: Sale[];
  userName: string;
  userImage: string;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string) => void;
}

const Dashboard: React.FC<Props> = ({ sales, userName, userImage, onUpdateName, onUpdateImage }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempImage, setTempImage] = useState(userImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonthElapsed = now.getDate();

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(now.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  // Cálculos de Faturamento
  const currentMonthSales = sales.filter(s => {
    const d = new Date(s.timestamp);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthSales = sales.filter(s => {
    const d = new Date(s.timestamp);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const currentTotal = currentMonthSales.reduce((acc, curr) => acc + curr.total, 0);
  const lastTotal = lastMonthSales.reduce((acc, curr) => acc + curr.total, 0);
  
  const dailyAverage = currentTotal / daysInMonthElapsed;
  
  // Cálculo de tendência
  const diff = currentTotal - lastTotal;
  const percentChange = lastTotal > 0 ? (diff / lastTotal) * 100 : 100;
  const isUp = currentTotal >= lastTotal;

  // Saúde das Cidades
  const DAY_IN_MS = 24 * 60 * 60 * 1000;
  const citiesData = sales.reduce((acc: Record<string, { total: number, lastVisit: number, salesCount: number }>, sale) => {
    if (!acc[sale.city]) {
      acc[sale.city] = { total: 0, lastVisit: 0, salesCount: 0 };
    }
    acc[sale.city].total += sale.total;
    acc[sale.city].salesCount += 1;
    if (sale.timestamp > acc[sale.city].lastVisit) {
      acc[sale.city].lastVisit = sale.timestamp;
    }
    return acc;
  }, {});

  // Fix: Explicitly typing data to avoid 'unknown' and spread errors
  const citiesList = Object.entries(citiesData).map(([name, data]) => {
    const cityVal = data as { total: number; lastVisit: number; salesCount: number };
    return {
      name,
      ...cityVal,
      daysSince: Math.floor((Date.now() - cityVal.lastVisit) / DAY_IN_MS)
    };
  }).sort((a, b) => b.daysSince - a.daysSince);

  const mostDelayedCity = citiesList[0];

  const handleSaveProfile = () => {
    if (tempName.trim()) {
      onUpdateName(tempName);
      onUpdateImage(tempImage);
      setIsEditingProfile(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

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

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <header className="flex items-center justify-between">
        <button 
          onClick={() => { setTempName(userName); setTempImage(userImage); setIsEditingProfile(true); }}
          className="flex items-center gap-3 text-left active:scale-95 transition-transform group"
        >
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-primary/40 shadow-sm transition-all group-hover:border-primary" 
              style={{ backgroundImage: `url("${userImage}")` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 size-5 bg-primary rounded-full border-2 border-white dark:border-surface-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-white">edit</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark font-black uppercase tracking-widest leading-none mb-1">Bem-vinda de volta,</p>
            <h2 className="text-text-main-light dark:text-text-main-dark text-xl font-bold tracking-tight">{userName}</h2>
          </div>
        </button>
        <button className="flex items-center justify-center rounded-2xl size-11 bg-white dark:bg-surface-dark shadow-sm border border-black/5 dark:border-white/5 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
      </header>

      {/* SEÇÃO DE FATURAMENTO */}
      <section className="relative">
        <div className="absolute -z-10 top-0 left-0 w-full h-full bg-primary/10 dark:bg-primary/5 blur-3xl rounded-full scale-110"></div>
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-8 shadow-[0_20px_60px_-15px_rgba(255,143,163,0.15)] border border-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-8xl text-primary transform rotate-12">receipt_long</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/10 mb-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Faturamento Mensal</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-primary font-bold text-lg">R$</span>
              <h1 className="text-4xl font-bold tracking-tighter text-text-main-light dark:text-text-main-dark">
                {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h1>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${isUp ? 'text-green-500 bg-green-500/5' : 'text-primary bg-primary/5'}`}>
              <span className="material-symbols-outlined !text-[14px]">{isUp ? 'arrow_upward' : 'arrow_downward'}</span>
              <span>{Math.abs(percentChange).toFixed(1)}% em relação ao mês anterior</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-white/5">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary !text-[14px]">calendar_today</span>
                <span className="text-[9px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest">Média/Dia</span>
              </div>
              <p className="text-lg font-bold text-text-main-light dark:text-text-main-dark">R$ {dailyAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary !text-[14px]">trending_up</span>
                <span className="text-[9px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest">Status</span>
              </div>
              <p className={`text-lg font-bold ${isUp ? 'text-green-500' : 'text-primary'}`}>
                {isUp ? 'Evoluindo' : 'Ajustar Rota'}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-text-sub-light/60 dark:text-text-sub-dark/60 uppercase tracking-widest">Atingimento da Meta</span>
              <span className="text-[10px] font-black text-primary">{Math.min(100, Math.round((currentTotal / (lastTotal || currentTotal)) * 100))}%</span>
            </div>
            <div className="h-2 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${isUp ? 'bg-green-400' : 'bg-primary'}`} 
                style={{ width: `${Math.min(100, (currentTotal / (lastTotal || currentTotal)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTA DE CIDADES */}
      <section>
        <div className="flex justify-between items-center mb-5 mt-2">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-0.5">Visão Geral da Rota</span>
        </div>
        <div className="flex flex-col gap-3">
          {citiesList.slice(0, 4).map(city => (
            <div key={city.name} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${city.daysSince >= 28 ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-primary/5 text-primary'}`}>
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main-light dark:text-text-main-dark text-sm leading-none italic uppercase">{city.name}</h4>
                    <p className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark mt-1 uppercase tracking-tighter">
                      {city.daysSince === 0 ? 'Visitado hoje' : `${city.daysSince} dias sem visita`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-sm">R$ {city.total.toFixed(2)}</p>
                  <p className="text-[9px] text-text-sub-light dark:text-text-sub-dark font-bold uppercase">{city.salesCount} vendas</p>
                </div>
              </div>
              <div className="h-1 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${city.daysSince >= 28 ? 'bg-red-500' : city.daysSince >= 15 ? 'bg-orange-400' : 'bg-primary'}`} 
                  style={{ width: `${Math.max(5, 100 - (city.daysSince * 3.5))}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ALERTA DE RETORNO */}
      <section className="mb-8">
        {mostDelayedCity ? (
          <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 border border-primary/10 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-3">history</span>
            <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark uppercase tracking-widest">
              Alerta de Retorno
            </h4>
            <p className="text-[11px] text-text-sub-light dark:text-text-sub-dark mt-2 leading-relaxed">
              Você não visita <strong>{mostDelayedCity.name}</strong> há <strong>{mostDelayedCity.daysSince} dias</strong>. 
              {mostDelayedCity.daysSince >= 28 ? ' O estoque dos PDVs certamente já acabou!' : ' Planeje uma visita em breve para manter o giro alto.'}
            </p>
          </div>
        ) : (
          <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 border border-primary/10 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-3">verified</span>
            <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark uppercase tracking-widest">Rotas em Dia</h4>
            <p className="text-[11px] text-text-sub-light dark:text-text-sub-dark mt-2 leading-relaxed">
              Todas as suas cidades foram visitadas recentemente. Continue mantendo esse ritmo excelente!
            </p>
          </div>
        )}
      </section>

      {/* MODAL DE CADASTRO DE PERFIL (NOME + FOTO) */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setIsEditingProfile(false)}
          ></div>
          <div className="relative bg-white dark:bg-surface-dark w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              
              {/* ÁREA DE FOTO COM UPLOAD */}
              <div className="relative group/photo mb-4 cursor-pointer" onClick={handleImageClick}>
                <div 
                  className="size-24 bg-center bg-no-repeat bg-cover rounded-full border-4 border-primary/20 shadow-lg overflow-hidden transition-all group-hover/photo:border-primary/50"
                  style={{ backgroundImage: `url("${tempImage}")` }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-2xl">add_a_photo</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 size-7 bg-primary rounded-full border-2 border-white dark:border-surface-dark flex items-center justify-center shadow-md">
                   <span className="material-symbols-outlined text-[14px] text-white">camera_alt</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-1">Configurar Perfil</h3>
              <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark font-bold uppercase tracking-widest mb-6">Personalize sua experiência</p>
              
              <div className="w-full mb-6">
                <input 
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                  placeholder="Seu nome..."
                  className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-center font-bold text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="py-3 px-4 rounded-xl text-[10px] font-black uppercase text-text-sub-light dark:text-text-sub-dark bg-gray-100 dark:bg-white/5 active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="py-3 px-4 rounded-xl text-[10px] font-black uppercase text-white bg-primary shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
