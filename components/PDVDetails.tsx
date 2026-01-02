
import React, { useState } from 'react';
import { PDV, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onBack: () => void;
  onDeletePDV: (id: string) => void;
  onSelectPDVForSale: (pdv: PDV) => void;
}

const PDVDetails: React.FC<Props> = ({ pdvs, sales, onBack, onDeletePDV, onSelectPDVForSale }) => {
  const [search, setSearch] = useState('');
  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  // Encontrar última venda para cada PDV
  const pdvAnalysis = pdvs.map(pdv => {
    const lastSale = sales
      .filter(s => s.type === 'PDV' && (s.location.toLowerCase() === pdv.companyName.toLowerCase() || s.city === pdv.city))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    const daysSince = lastSale ? Math.floor((now - lastSale.timestamp) / DAY_IN_MS) : 999;
    
    return {
      ...pdv,
      daysSince,
      lastVisit: lastSale ? lastSale.date : 'NUNCA VISITADO'
    };
  }).sort((a, b) => b.daysSince - a.daysSince); // Ordena pelos mais antigos (esquecidos) no topo

  const filtered = pdvAnalysis.filter(p => 
    p.companyName.toLowerCase().includes(search.toLowerCase()) || 
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-10">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 h-20 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark shadow-sm text-gray-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tighter italic">Todos os PDVs</h2>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Gestão de Carteira</span>
        </div>
        <div className="size-11"></div>
      </header>

      <div className="p-6">
        <div className="relative mb-8">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300">search</span>
          <input 
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-surface-dark rounded-[2rem] border-none shadow-sm focus:ring-2 focus:ring-primary/20 text-sm font-bold placeholder:text-gray-300"
            placeholder="Qual ponto deseja encontrar?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center opacity-20 text-center">
               <span className="material-symbols-outlined text-5xl mb-3">manage_search</span>
               <p className="text-sm font-bold uppercase italic">Nenhum parceiro encontrado...</p>
            </div>
          ) : (
            filtered.map(pdv => (
              <div key={pdv.id} className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:border-primary/20 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-black text-gray-900 dark:text-white text-base truncate uppercase italic tracking-tight leading-none">{pdv.companyName}</h4>
                    <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-widest">{pdv.city} • {pdv.contactName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${pdv.daysSince >= 28 ? 'bg-red-500 text-white shadow-red-200' : pdv.daysSince >= 15 ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-green-500 text-white shadow-green-200'}`}>
                      {pdv.daysSince >= 999 ? 'Sem Histórico' : `${pdv.daysSince} dias`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-3 pt-5 border-t border-gray-50 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-gray-300">update</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase italic">Última Visita: {pdv.lastVisit}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onDeletePDV(pdv.id)}
                      className="size-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                      title="Excluir PDV"
                    >
                      <span className="material-symbols-outlined !text-lg">delete_forever</span>
                    </button>
                    <button 
                      onClick={() => onSelectPDVForSale(pdv)}
                      className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-primary/10"
                    >
                      <span className="material-symbols-outlined !text-sm">receipt_long</span>
                      Acerto
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PDVDetails;
