
import React, { useState, useMemo } from 'react';
import { PDV, View, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onNavigate: (view: View) => void;
  onSelectPDVForSale: (pdv: PDV) => void;
  onDeletePDV?: (id: string) => boolean;
}

type SortOption = 'time_desc' | 'time_asc' | 'qty_desc' | 'qty_asc';
type FilterStatus = 'all' | 'no_sales';

const PDVList: React.FC<Props> = ({ pdvs, sales, onNavigate, onSelectPDVForSale, onDeletePDV }) => {
  const [isManageMode, setIsManageMode] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('time_desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [activeTab, setActiveTab] = useState<'cities' | 'all'>('cities');

  // Cálculo de Estatísticas Detalhadas
  const getPDVStats = (pdv: PDV) => {
    const pdvSales = sales.filter(s => s.location.toLowerCase() === pdv.companyName.toLowerCase() && s.type === 'PDV');
    
    if (pdvSales.length === 0) return { efficiency: 0, lastConsigned: 0, lastVisit: 'AGUARDANDO', daysSince: 999, totalRevenue: 0, isFuture: true };

    const lastSale = [...pdvSales].sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastConsigned = lastSale.items.reduce((sum, item) => sum + (item.newConsignedQuantity || 0), 0);
    const totalRevenue = pdvSales.reduce((sum, s) => sum + s.total, 0);
    const daysSince = Math.floor((Date.now() - lastSale.timestamp) / (1000 * 60 * 60 * 24));

    let totalSold = 0;
    let totalLeftOver = 0;
    pdvSales.forEach(sale => {
      sale.items.forEach(item => {
        totalSold += item.quantity || 0;
        totalLeftOver += item.leftOverQuantity || 0;
      });
    });

    const efficiency = (totalSold + totalLeftOver) > 0 ? (totalSold / (totalSold + totalLeftOver)) * 100 : 0;
    return { efficiency, lastConsigned, lastVisit: lastSale.date, daysSince, totalRevenue, isFuture: false };
  };

  // Processamento da Lista Completa com Filtros
  const processedPdvs = useMemo(() => {
    let list = pdvs.map(p => ({ ...p, stats: getPDVStats(p) }));

    // Filtro de Status (PDVs Futuros vs Ativos)
    if (filterStatus === 'no_sales') {
      list = list.filter(p => p.stats.isFuture);
    }

    // Filtro de busca
    if (search) {
      list = list.filter(p => 
        p.companyName.toLowerCase().includes(search.toLowerCase()) || 
        p.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Ordenação (Tempo e Quantidade)
    list.sort((a, b) => {
      switch (sortBy) {
        case 'time_desc': return a.stats.daysSince - b.stats.daysSince;
        case 'time_asc': return b.stats.daysSince - a.stats.daysSince;
        case 'qty_desc': return b.stats.totalRevenue - a.stats.totalRevenue;
        case 'qty_asc': return a.stats.totalRevenue - b.stats.totalRevenue;
        default: return 0;
      }
    });

    return list;
  }, [pdvs, sales, search, sortBy, filterStatus]);

  // Agrupamento por Cidades
  const cityAnalysis = useMemo(() => {
    const cities = Array.from(new Set(processedPdvs.map(p => p.city)));
    return cities.map(cityName => {
      const cityPdvs = processedPdvs.filter(p => p.city === cityName);
      const cityRevenue = cityPdvs.reduce((acc, p) => acc + p.stats.totalRevenue, 0);
      return { name: cityName, pdvs: cityPdvs, revenue: cityRevenue };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [processedPdvs]);

  const handleDelete = (e: React.MouseEvent, pdv: PDV) => {
    e.stopPropagation();
    if (onDeletePDV) {
      const isFuture = getPDVStats(pdv).isFuture;
      const msg = isFuture 
        ? `Deseja remover o PDV FUTURO "${pdv.companyName.toUpperCase()}"?\n\nEste ponto ainda não possui vendas registradas.` 
        : `Deseja remover o PDV ATIVO "${pdv.companyName.toUpperCase()}"?\n\nTodo o histórico de faturamento será perdido.`;
      
      if (window.confirm(`⚠️ CONFIRMAR EXCLUSÃO\n\n${msg}`)) {
        onDeletePDV(pdv.id);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-background-light dark:bg-background-dark min-h-screen pb-44">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main-light dark:text-text-main-dark italic uppercase leading-none">Logística Master</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 italic">Gestão de Rota e PDVs</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsManageMode(!isManageMode)}
              className={`size-11 rounded-2xl flex items-center justify-center transition-all ${isManageMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white dark:bg-white/5 text-gray-400 shadow-sm border border-gray-100 dark:border-white/10'}`}
            >
              <span className="material-symbols-outlined">{isManageMode ? 'close' : 'delete_sweep'}</span>
            </button>
            <button 
              onClick={() => onNavigate(View.REGISTER_PDV)}
              className="size-11 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined font-bold">add_business</span>
            </button>
          </div>
        </div>

        {/* CONTROLES DE BUSCA E FILTRO */}
        <div className="px-6 pb-6 space-y-4">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold shadow-sm focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300"
              placeholder="Localizar PDV ou Cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
               <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${filterStatus === 'all' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>Todos</button>
               <button onClick={() => setFilterStatus('no_sales')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-2 ${filterStatus === 'no_sales' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                 <span className="material-symbols-outlined !text-xs">new_releases</span> Futuros (Sem Venda)
               </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
               <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
                  <button onClick={() => setSortBy('time_desc')} className={`px-3 py-1.5 text-[8px] font-black rounded-lg transition-all flex items-center gap-1 ${sortBy === 'time_desc' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}>
                    RECENTES
                  </button>
                  <button onClick={() => setSortBy('time_asc')} className={`px-3 py-1.5 text-[8px] font-black rounded-lg transition-all flex items-center gap-1 ${sortBy === 'time_asc' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}>
                    ESQUECIDOS
                  </button>
               </div>
               <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
                  <button onClick={() => setSortBy('qty_desc')} className={`px-3 py-1.5 text-[8px] font-black rounded-lg transition-all flex items-center gap-1 ${sortBy === 'qty_desc' ? 'bg-white dark:bg-surface-dark text-blue-500 shadow-sm' : 'text-gray-400'}`}>
                    + GIRO
                  </button>
                  <button onClick={() => setSortBy('qty_asc')} className={`px-3 py-1.5 text-[8px] font-black rounded-lg transition-all flex items-center gap-1 ${sortBy === 'qty_asc' ? 'bg-white dark:bg-surface-dark text-blue-500 shadow-sm' : 'text-gray-400'}`}>
                    - GIRO
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* SELETOR DE TAB (QUADRADOS) */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => setActiveTab('cities')}
              className={`p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border-2 ${activeTab === 'cities' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-white dark:bg-surface-dark border-transparent text-gray-400 shadow-sm'}`}
             >
               <span className="material-symbols-outlined text-2xl">location_city</span>
               <span className="text-[10px] font-black uppercase tracking-tighter">Por Cidades</span>
             </button>
             <button 
              onClick={() => setActiveTab('all')}
              className={`p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border-2 ${activeTab === 'all' ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-surface-dark border-transparent text-gray-400 shadow-sm'}`}
             >
               <span className="material-symbols-outlined text-2xl">storefront</span>
               <span className="text-[10px] font-black uppercase tracking-tighter">Todos os PDVs</span>
             </button>
          </div>
        </div>
      </header>

      <main className="px-6">
        {activeTab === 'cities' ? (
          <div className="space-y-10">
            {cityAnalysis.length === 0 ? (
              <EmptyState icon="map_search" message="Nenhuma cidade nos filtros atuais." />
            ) : (
              cityAnalysis.map(city => (
                <section key={city.name} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-blue-500"></div>
                      <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">{city.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{city.pdvs.length} PDVs</p>
                      <p className="text-[10px] font-black text-blue-500 italic">R$ {city.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {city.pdvs.map(pdv => <PDVCard key={pdv.id} pdv={pdv} isManageMode={isManageMode} onDelete={handleDelete} onSelect={onSelectPDVForSale} />)}
                  </div>
                </section>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Listagem Individual</h3>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{processedPdvs.length} PDVs filtrados</span>
            </div>
            {processedPdvs.length === 0 ? (
              <EmptyState icon="manage_search" message="Nada encontrado para os filtros ativos." />
            ) : (
              processedPdvs.map(pdv => <PDVCard key={pdv.id} pdv={pdv} isManageMode={isManageMode} onDelete={handleDelete} onSelect={onSelectPDVForSale} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const PDVCard: React.FC<{ pdv: any, isManageMode: boolean, onDelete: any, onSelect: any }> = ({ pdv, isManageMode, onDelete, onSelect }) => (
  <div 
    onClick={() => !isManageMode && onSelect(pdv)}
    className={`group relative flex flex-col p-5 bg-white dark:bg-surface-dark rounded-[2.2rem] border transition-all shadow-sm ${isManageMode ? 'border-red-500/50 ring-4 ring-red-500/5 scale-[0.98]' : 'border-gray-100 dark:border-white/5 active:scale-[0.98] cursor-pointer'}`}
  >
    {isManageMode && (
      <button 
        onClick={(e) => onDelete(e, pdv)}
        className="absolute -top-2 -right-2 size-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center animate-in zoom-in duration-200 z-10 shadow-red-500/30"
      >
        <span className="material-symbols-outlined !text-lg">delete</span>
      </button>
    )}

    {pdv.stats.isFuture && (
      <div className="absolute top-4 right-14 bg-orange-500 text-[7px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
        PDV Futuro
      </div>
    )}

    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 min-w-0 pr-2">
        <h4 className={`text-sm font-black uppercase italic leading-none truncate ${isManageMode ? 'text-red-500' : 'text-text-main-light dark:text-white'}`}>{pdv.companyName}</h4>
        <p className="text-[9px] font-bold text-gray-400 mt-1.5 uppercase truncate tracking-widest">{pdv.city} • {pdv.contactName}</p>
      </div>
      <div className="text-right">
        <div className={`text-base font-black italic ${pdv.stats.efficiency >= 75 ? 'text-green-500' : pdv.stats.efficiency >= 40 ? 'text-primary' : 'text-red-400'}`}>
          {pdv.stats.isFuture ? '0%' : `${Math.round(pdv.stats.efficiency)}%`}
        </div>
        <p className="text-[7px] font-black text-gray-300 uppercase tracking-tighter italic">GIRO</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined !text-[12px] ${pdv.stats.isFuture ? 'text-orange-300' : pdv.stats.daysSince > 15 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
          {pdv.stats.isFuture ? 'new_releases' : 'calendar_month'}
        </span>
        <span className={`text-[8px] font-black uppercase tracking-widest ${pdv.stats.isFuture ? 'text-orange-500' : pdv.stats.daysSince > 15 ? 'text-red-500' : 'text-gray-400'}`}>
          {pdv.stats.isFuture ? 'Aguardando 1ª Visita' : `${pdv.stats.daysSince} dias s/ visita`}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${pdv.stats.isFuture ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
          R$ {pdv.stats.totalRevenue.toFixed(0)}
        </span>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: string, message: string }> = ({ icon, message }) => (
  <div className="py-20 flex flex-col items-center opacity-20 text-center italic">
     <span className="material-symbols-outlined text-6xl mb-4">{icon}</span>
     <p className="text-sm font-black uppercase">{message}</p>
  </div>
);

export default PDVList;
