import React from 'react';
import { PDV, View, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onNavigate: (view: View) => void;
}

const PDVList: React.FC<Props> = ({ pdvs, sales, onNavigate }) => {
  const uniqueCities = Array.from(new Set(pdvs.map(p => p.city)));

  // Cálculos de Tempo (Mês Atual e Anterior)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(now.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  // 1. Quantidade vendida este mês (Rua vs PDV)
  const currentMonthSales = sales.filter(s => {
    const d = new Date(s.timestamp);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const unitsSoldRua = currentMonthSales
    .filter(s => s.type === 'Rua')
    .reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  const unitsSoldPDV = currentMonthSales
    .filter(s => s.type === 'PDV')
    .reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  // 2. Performance de Giro (Vendidas este mês vs Deixadas mês passado em PDVs)
  const lastMonthPDVSales = sales.filter(s => {
    const d = new Date(s.timestamp);
    return s.type === 'PDV' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const unitsLeftLastMonth = lastMonthPDVSales
    .reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + (item.consignedQuantity || 0), 0), 0);

  // Média de giro geral
  const performanceRate = unitsLeftLastMonth > 0 
    ? Math.min(100, Math.round((unitsSoldPDV / unitsLeftLastMonth) * 100))
    : 100;

  return (
    <div className="flex flex-col gap-6">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-6 border-b border-gray-200 dark:border-gray-800/50">
        <h1 className="text-2xl font-black tracking-tight text-text-main-light dark:text-text-main-dark italic uppercase">Logística Pro</h1>
        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Gestão de Pontos e Performance</p>
      </header>

      {/* CARD DE PERFORMANCE PADRONIZADO (SOFT PINK) */}
      <div className="px-6 relative">
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/10 dark:bg-primary/5 blur-3xl rounded-full"></div>
        
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-8 shadow-[0_20px_60px_-15px_rgba(255,143,163,0.15)] border border-primary/5 relative overflow-hidden">
          {/* Decoração sutil */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-8xl text-primary transform -rotate-12">analytics</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/10 mb-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Análise de Giro</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <h1 className="text-4xl font-bold tracking-tighter text-text-main-light dark:text-text-main-dark">
                {performanceRate}%
              </h1>
              <span className="text-primary font-black text-xs uppercase italic">Conversão</span>
            </div>

            <p className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-tight">
              Giro do que foi consignado no mês anterior
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-white/5">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary !text-[14px]">pedal_bike</span>
                <span className="text-[9px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest">Venda Rua</span>
              </div>
              <p className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{unitsSoldRua} <span className="text-[10px] font-medium text-text-sub-light opacity-60">un.</span></p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-blue-400 !text-[14px]">storefront</span>
                <span className="text-[9px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest">Giro PDV</span>
              </div>
              <p className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{unitsSoldPDV} <span className="text-[10px] font-medium text-text-sub-light opacity-60">un.</span></p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-text-sub-light/60 dark:text-text-sub-dark/60 uppercase tracking-widest">Performance Geral</span>
              <span className="text-[9px] font-black text-primary uppercase">{unitsLeftLastMonth} DEIXADAS VS {unitsSoldPDV} VENDIDAS</span>
            </div>
            <div className="h-2 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,143,163,0.3)]" 
                style={{ width: `${performanceRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate(View.PDV_DETAILS)}
          className="bg-white dark:bg-surface-dark p-6 rounded-[2.2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
        >
          <div className="size-11 bg-primary/10 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total PDVs</span>
            <p className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-tight">{pdvs.length}</p>
          </div>
          <span className="text-[9px] font-black text-primary uppercase border-b border-primary/20 pb-0.5">Gerenciar PDVs</span>
        </button>

        <button 
          onClick={() => onNavigate(View.CITY_DETAILS)}
          className="bg-white dark:bg-surface-dark p-6 rounded-[2.2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
        >
          <div className="size-11 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-2xl">map</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Cidades</span>
            <p className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-tight">{uniqueCities.length}</p>
          </div>
          <span className="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600/20 pb-0.5">Ver métricas</span>
        </button>
      </div>

      <div className="px-6 pb-10">
        <div className="flex justify-between items-center mb-5 mt-2">
          <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold tracking-tight">Regiões em Destaque</h3>
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Atualizado</span>
        </div>
        <div className="flex flex-col gap-3">
          {uniqueCities.slice(0, 3).map(city => {
            const count = pdvs.filter(p => p.city === city).length;
            return (
              <div key={city} className="flex items-center justify-between p-5 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-text-sub-light">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main-light dark:text-white leading-none italic uppercase">{city}</h4>
                    <p className="text-[10px] font-bold text-text-sub-light mt-1 uppercase tracking-tighter">{count} PDVs ativos</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-200">chevron_right</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PDVList;