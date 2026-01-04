
import React, { useState, useMemo } from 'react';
import { PDV, View, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onNavigate: (view: View) => void;
  onSelectPDVForSale: (pdv: PDV) => void;
  onShowPDVHistory: (pdv: PDV) => void;
  onDeletePDV?: (id: string) => boolean;
}

type ListMode = 'selection' | 'cities' | 'all';

const PDVList: React.FC<Props> = ({ pdvs, sales, onNavigate, onSelectPDVForSale, onShowPDVHistory, onDeletePDV }) => {
  const [search, setSearch] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);
  const [mode, setMode] = useState<ListMode>('selection');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const getPDVStats = (pdv: PDV) => {
    const pdvSales = sales.filter(s => s.location.toLowerCase() === pdv.companyName.toLowerCase() && s.type === 'PDV');
    if (pdvSales.length === 0) return { efficiency: 0, daysSince: 9999, totalRevenue: 0, isFuture: true };
    const lastSale = [...pdvSales].sort((a, b) => b.timestamp - a.timestamp)[0];
    const daysSince = Math.floor((Date.now() - lastSale.timestamp) / (1000 * 60 * 60 * 24));
    return { efficiency: 0, daysSince, totalRevenue: 0, isFuture: false };
  };

  const processedPdvs = useMemo(() => {
    let list = pdvs.map(p => ({ ...p, stats: getPDVStats(p) }));
    if (search) {
      list = list.filter(p => 
        p.companyName.toLowerCase().includes(search.toLowerCase()) || 
        p.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list.sort((a, b) => b.stats.daysSince - a.stats.daysSince);
  }, [pdvs, sales, search]);

  const cityGroups = useMemo(() => {
    const groups: Record<string, { pdvs: typeof processedPdvs, maxDays: number, isFuture: boolean }> = {};
    
    processedPdvs.forEach(p => {
      if (!groups[p.city]) {
        groups[p.city] = { pdvs: [], maxDays: 0, isFuture: true };
      }
      groups[p.city].pdvs.push(p);
      if (!p.stats.isFuture && p.stats.daysSince > groups[p.city].maxDays) {
        groups[p.city].maxDays = p.stats.daysSince;
        groups[p.city].isFuture = false;
      }
    });

    return Object.entries(groups).sort((a, b) => b[1].maxDays - a[1].maxDays);
  }, [processedPdvs]);

  const handleDelete = (e: React.MouseEvent, pdv: PDV) => {
    e.stopPropagation();
    if (onDeletePDV && window.confirm(`Remover PDV?`)) onDeletePDV(pdv.id);
  };

  const handleBack = () => {
    if (selectedCity) {
      setSelectedCity(null);
    } else {
      setMode('selection');
    }
  };

  // TELA DE SELEÇÃO INICIAL (OS 2 QUADRADOS)
  if (mode === 'selection') {
    return (
      <div className="flex flex-col gap-6 bg-background-light dark:bg-background-dark min-h-screen p-6 pb-44">
        <header className="pt-4 mb-4">
          <h1 className="text-2xl font-black tracking-tight text-text-main-light dark:text-white uppercase italic leading-none">PDVs</h1>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-2 italic">Gestão de Pontos de Venda</p>
        </header>

        <div className="grid grid-cols-2 gap-4 h-48">
          <button 
            onClick={() => setMode('cities')}
            className="flex flex-col items-center justify-center gap-4 bg-white/40 backdrop-blur-md dark:bg-surface-dark rounded-[2.5rem] border border-black/10 shadow-sm active:scale-95 transition-all group"
          >
            <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">location_city</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-main-light dark:text-white italic">Por Cidades</span>
          </button>

          <button 
            onClick={() => setMode('all')}
            className="flex flex-col items-center justify-center gap-4 bg-white/40 backdrop-blur-md dark:bg-surface-dark rounded-[2.5rem] border border-black/10 shadow-sm active:scale-95 transition-all group"
          >
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-main-light dark:text-white italic">Todos os PDVs</span>
          </button>
        </div>
      </div>
    );
  }

  // TELA DE LISTAGEM
  return (
    <div className="flex flex-col gap-6 bg-background-light dark:bg-background-dark min-h-screen pb-44">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBack} className="size-10 flex items-center justify-center rounded-xl bg-surface-light/40 border border-black/5 text-text-sub-light active:scale-90">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-tight text-text-main-light dark:text-white uppercase italic leading-none truncate">
              {selectedCity ? selectedCity : (mode === 'cities' ? 'Cidades' : 'Todos os PDVs')}
            </h1>
            <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1 italic">
              {selectedCity ? 'Visualizando parceiros locais' : 'Organizado por urgência'}
            </p>
          </div>
          {(mode === 'all' || selectedCity) && (
            <button onClick={() => setIsManageMode(!isManageMode)} className={`size-10 rounded-xl flex items-center justify-center transition-all border border-black/10 ${isManageMode ? 'bg-red-500 text-white' : 'bg-surface-light/40 text-text-sub-light'}`}>
              <span className="material-symbols-outlined !text-base">{isManageMode ? 'close' : 'delete'}</span>
            </button>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-sub-light/50">search</span>
          <input className="w-full bg-white/40 dark:bg-surface-dark border border-black/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold shadow-sm" placeholder="Buscar parceiro ou cidade..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </header>

      <main className="px-6 space-y-6">
        {mode === 'all' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {processedPdvs.length === 0 ? (
              <div className="py-20 text-center opacity-30 italic">Nenhum PDV encontrado.</div>
            ) : (
              processedPdvs.map(pdv => <PDVVisitCard key={pdv.id} pdv={pdv} isManageMode={isManageMode} onDelete={handleDelete} onShowPDVHistory={onShowPDVHistory} />)
            )}
          </div>
        ) : (
          /* MODO CIDADES */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!selectedCity ? (
              /* LISTA DE CIDADES (RESUMO) */
              cityGroups.length === 0 ? (
                <div className="py-20 text-center opacity-30 italic">Nenhuma cidade cadastrada.</div>
              ) : (
                cityGroups.map(([cityName, data]) => (
                  <div 
                    key={cityName}
                    onClick={() => setSelectedCity(cityName)}
                    className="group flex items-center justify-between p-6 bg-white/40 backdrop-blur-md dark:bg-surface-dark rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-sm transition-all active:scale-[0.98] cursor-pointer hover:border-primary/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-14 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 ${data.maxDays > 28 ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-blue-500/10 text-blue-500'}`}>
                        <span className="material-symbols-outlined text-2xl">location_city</span>
                      </div>
                      <div>
                        <h4 className="text-base font-black uppercase italic leading-none">{cityName}</h4>
                        <p className="text-[8px] font-bold text-text-sub-light mt-2 uppercase tracking-[0.2em]">
                          {data.pdvs.length} {data.pdvs.length === 1 ? 'PARCEIRO' : 'PARCEIROS'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <span className={`text-[10px] font-black uppercase italic ${data.maxDays > 28 ? 'text-red-500' : 'text-primary'}`}>
                          {data.isFuture ? 'AGUARDANDO' : `${data.maxDays} DIAS`}
                       </span>
                       <span className="text-[7px] text-gray-400 uppercase font-black tracking-tighter mt-1">Status de Atenção</span>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* PDVs DA CIDADE SELECIONADA */
              <div className="space-y-4">
                {cityGroups.find(g => g[0] === selectedCity)?.[1].pdvs.map(pdv => (
                  <PDVVisitCard key={pdv.id} pdv={pdv} isManageMode={isManageMode} onDelete={handleDelete} onShowPDVHistory={onShowPDVHistory} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const PDVVisitCard: React.FC<{ pdv: any, isManageMode: boolean, onDelete: any, onShowPDVHistory: any }> = ({ pdv, isManageMode, onDelete, onShowPDVHistory }) => (
  <div 
    onClick={() => !isManageMode && onShowPDVHistory(pdv)}
    className={`relative p-5 bg-white/40 backdrop-blur-md dark:bg-surface-dark rounded-[2.2rem] border transition-all active:scale-[0.98] cursor-pointer shadow-sm ${isManageMode ? 'border-red-500/30' : 'border-black/10 dark:border-white/10'}`}
  >
    {isManageMode && (
      <button onClick={(e) => onDelete(e, pdv)} className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center z-10 border border-black/10">
        <span className="material-symbols-outlined !text-sm">close</span>
      </button>
    )}
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-sm font-black uppercase italic leading-none truncate">{pdv.companyName}</h4>
        <p className="text-[9px] font-bold text-text-sub-light mt-1.5 uppercase truncate tracking-widest">{pdv.contactName}</p>
      </div>
      <div className="text-right">
         <p className={`text-[10px] font-black uppercase italic ${pdv.stats.daysSince > 28 ? 'text-red-500' : 'text-primary'}`}>
            {pdv.stats.isFuture ? 'AGUARDANDO' : `${pdv.stats.daysSince} DIAS`}
         </p>
         <span className="text-[7px] text-gray-400 uppercase font-black">Sem visita</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/5 dark:border-white/5">
      <span className="text-[8px] font-black text-text-sub-light/60 uppercase tracking-widest">Rever acertos anteriores</span>
      <span className="material-symbols-outlined text-sm text-primary">history</span>
    </div>
  </div>
);

export default PDVList;
