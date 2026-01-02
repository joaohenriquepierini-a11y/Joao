
import React, { useState } from 'react';
import { PDV, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onBack: () => void;
}

const PDVDetails: React.FC<Props> = ({ pdvs, sales, onBack }) => {
  const [search, setSearch] = useState('');
  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  // Encontrar última venda para cada PDV
  const pdvAnalysis = pdvs.map(pdv => {
    const lastSale = sales
      .filter(s => s.type === 'PDV' && (s.location.toLowerCase() === pdv.name.toLowerCase() || s.city === pdv.city))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    const daysSince = lastSale ? Math.floor((now - lastSale.timestamp) / DAY_IN_MS) : 999;
    
    return {
      ...pdv,
      daysSince,
      lastVisit: lastSale ? lastSale.date : 'NUNCA VISITADO'
    };
  }).sort((a, b) => b.daysSince - a.daysSince); // Ordena pelos mais antigos (esquecidos) no topo

  const filtered = pdvAnalysis.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 h-20 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark shadow-sm text-gray-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Todos os PDVs</h2>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ordenado por Visita</span>
        </div>
        <div className="size-11"></div>
      </header>

      <div className="p-6">
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
          <input 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-dark rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary/20 text-sm font-bold"
            placeholder="Buscar por nome ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map(pdv => (
            <div key={pdv.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-black text-gray-900 dark:text-white text-base truncate">{pdv.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{pdv.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${pdv.daysSince >= 28 ? 'bg-red-500 text-white' : pdv.daysSince >= 15 ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                    {pdv.daysSince >= 999 ? 'Sem Histórico' : `${pdv.daysSince} dias`}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-gray-300">calendar_today</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Última: {pdv.lastVisit}</span>
                </div>
                <button className="text-[10px] font-black text-primary uppercase hover:underline">Ver Histórico</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDVDetails;
