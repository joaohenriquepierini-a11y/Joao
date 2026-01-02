
import React, { useState, useMemo } from 'react';
import { PDV, View, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onNavigate: (view: View) => void;
  onSelectPDVForSale: (pdv: PDV) => void;
}

type CitySort = 'MAIS_DEIXO' | 'MENOS_DEIXO';
type PdvSort = 'TODOS' | 'TOP_GIRO' | 'BAIXO_GIRO';

const PDVList: React.FC<Props> = ({ pdvs, sales, onNavigate, onSelectPDVForSale }) => {
  const [citySort, setCitySort] = useState<CitySort>('MAIS_DEIXO');
  const [pdvSort, setPdvSort] = useState<PdvSort>('TODOS');

  // Cálculo de Eficiência por PDV
  const getPDVStats = (pdvName: string) => {
    const pdvSales = sales.filter(s => s.location === pdvName && s.type === 'PDV');
    if (pdvSales.length === 0) return { efficiency: 0, lastConsigned: 0, lastVisit: '---' };

    const lastSale = [...pdvSales].sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastConsigned = lastSale.items.reduce((sum, item) => sum + (item.newConsignedQuantity || 0), 0);

    let totalSold = 0;
    let totalLeftOver = 0;
    pdvSales.forEach(sale => {
      sale.items.forEach(item => {
        totalSold += item.quantity || 0;
        totalLeftOver += item.leftOverQuantity || 0;
      });
    });

    const efficiency = (totalSold + totalLeftOver) > 0 ? (totalSold / (totalSold + totalLeftOver)) * 100 : 0;
    return { efficiency, lastConsigned, lastVisit: lastSale.date };
  };

  // Análise de Cidades
  const cityAnalysis = useMemo(() => {
    const cities = Array.from(new Set(pdvs.map(p => p.city)));
    const data = cities.map(cityName => {
      const cityPdvs = pdvs.filter(p => p.city === cityName);
      const totalDeixado = cityPdvs.reduce((acc, p) => acc + getPDVStats(p.companyName).lastConsigned, 0);
      return { name: cityName, count: cityPdvs.length, volume: totalDeixado };
    });

    return data.sort((a, b) => citySort === 'MAIS_DEIXO' ? b.volume - a.volume : a.volume - b.volume);
  }, [pdvs, sales, citySort]);

  // Análise de PDVs
  const pdvAnalysis = useMemo(() => {
    const data = pdvs.map(p => ({ ...p, stats: getPDVStats(p.companyName) }));
    if (pdvSort === 'TOP_GIRO') return data.sort((a, b) => b.stats.efficiency - a.stats.efficiency);
    if (pdvSort === 'BAIXO_GIRO') return data.sort((a, b) => a.stats.efficiency - b.stats.efficiency);
    return data;
  }, [pdvs, sales, pdvSort]);

  const totalAvgEfficiency = useMemo(() => {
    if (pdvs.length === 0) return 0;
    const sum = pdvs.reduce((acc, p) => acc + getPDVStats(p.companyName).efficiency, 0);
    return Math.round(sum / pdvs.length);
  }, [pdvs, sales]);

  return (
    <div className="flex flex-col gap-8 bg-background-light dark:bg-background-dark min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main-light dark:text-text-main-dark italic uppercase leading-none">Logística Master</h1>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Gestão de Distribuição</p>
        </div>
        <button 
          onClick={() => onNavigate(View.REGISTER_PDV)}
          className="size-11 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined font-bold">add_business</span>
        </button>
      </header>

      {/* CARD DE GIRO GERAL */}
      <div className="px-6">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-9xl text-text-main-light dark:text-white">monitoring</span>
          </div>
          <h3 className="text-[10px] font-black text-text-sub-light uppercase tracking-widest mb-4 italic">Eficiência de Giro Geral</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-primary italic leading-none">{totalAvgEfficiency}%</p>
            <span className="text-[10px] font-black text-text-sub-light uppercase">Vendas / Carga</span>
          </div>
        </div>
      </div>

      <main className="px-6 space-y-10">
        {/* QUADRADO 1: CIDADES */}
        <section className="bg-white dark:bg-surface-dark p-6 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined">location_city</span>
              </div>
              <h3 className="text-lg font-black text-text-main-light dark:text-white uppercase italic tracking-tighter">Cidades</h3>
            </div>
            <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setCitySort('MAIS_DEIXO')}
                className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${citySort === 'MAIS_DEIXO' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}
              >
                MAIS
              </button>
              <button 
                onClick={() => setCitySort('MENOS_DEIXO')}
                className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${citySort === 'MENOS_DEIXO' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}
              >
                MENOS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
            {cityAnalysis.length === 0 ? (
              <p className="text-center py-10 text-[10px] font-bold text-gray-300 uppercase">Nenhuma cidade cadastrada</p>
            ) : (
              cityAnalysis.map(city => (
                <div key={city.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase italic leading-none text-text-main-light dark:text-white">{city.name}</span>
                    <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{city.count} Pontos de Venda</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-500 italic">{city.volume} un.</span>
                    <p className="text-[7px] font-black text-gray-300 uppercase">Deixadas (Últ. Visita)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* QUADRADO 2: TODOS OS PDVs */}
        <section className="bg-white dark:bg-surface-dark p-6 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <h3 className="text-lg font-black text-text-main-light dark:text-white uppercase italic tracking-tighter">Pontos de Venda</h3>
            </div>
            <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setPdvSort('TODOS')}
                className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${pdvSort === 'TODOS' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}
              >
                TODOS
              </button>
              <button 
                onClick={() => setPdvSort('TOP_GIRO')}
                className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${pdvSort === 'TOP_GIRO' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}
              >
                TOP
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
            {pdvAnalysis.length === 0 ? (
              <p className="text-center py-10 text-[10px] font-bold text-gray-300 uppercase">Sem PDVs cadastrados</p>
            ) : (
              pdvAnalysis.map(pdv => (
                <div 
                  key={pdv.id} 
                  onClick={() => onSelectPDVForSale(pdv)}
                  className="flex flex-col p-5 bg-gray-50 dark:bg-white/5 rounded-[2.2rem] border border-transparent hover:border-primary/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm font-black uppercase italic leading-none text-text-main-light dark:text-white truncate">{pdv.companyName}</h4>
                      <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase truncate">{pdv.city}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black italic ${pdv.stats.efficiency >= 75 ? 'text-green-500' : 'text-primary'}`}>{Math.round(pdv.stats.efficiency)}%</span>
                      <p className="text-[7px] font-black text-gray-300 uppercase">GIRO</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined !text-xs text-gray-300">history</span>
                       <span className="text-[8px] font-black text-gray-400 uppercase">Visita: {pdv.stats.lastVisit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">Reposição: {pdv.stats.lastConsigned}un</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PDVList;
