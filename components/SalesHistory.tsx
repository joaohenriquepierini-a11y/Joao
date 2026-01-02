
import React, { useState, useMemo } from 'react';
import { Sale, Truffle } from '../types';

interface Props {
  sales: Sale[];
  truffles: Truffle[];
  onDeleteSale: (id: string) => void;
  onUpdateSale: (sale: Sale) => void;
  onRegisterStreetSale: () => void;
  onEditSale: (sale: Sale) => void;
}

const SalesHistory: React.FC<Props> = ({ sales, truffles, onDeleteSale, onUpdateSale, onRegisterStreetSale, onEditSale }) => {
  const [filter, setFilter] = useState<'Todos' | 'Rua' | 'PDV'>('Todos');

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const todaySales = sales.filter(s => s.timestamp >= todayStart);
  const todayTotal = todaySales.reduce((acc, curr) => acc + curr.total, 0);

  const lastThreeSales = [...sales].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
  const filteredSales = (filter === 'Todos' ? sales : sales.filter(s => s.type === filter)).sort((a,b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-main-light dark:text-white uppercase italic leading-none">Vendas</h1>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Gestão de Faturamento</p>
        </div>
        <button 
          onClick={onRegisterStreetSale}
          className="bg-primary/15 text-primary border border-black/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-transform flex items-center gap-2"
        >
          <span className="material-symbols-outlined !text-sm">pedal_bike</span>
          Nova Venda
        </button>
      </header>

      <div className="px-6 py-6 flex flex-col gap-8">
        <section>
          <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-lg shadow-primary/20 relative overflow-hidden border border-black/10">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <span className="material-symbols-outlined text-7xl">payments</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Vendido Hoje</p>
            <h2 className="text-4xl font-black italic tracking-tighter">R$ {todayTotal.toFixed(2)}</h2>
            <div className="flex items-center justify-between mt-4">
               <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest italic">{todaySales.length} atendimentos</p>
               <span className="text-[8px] bg-white/20 px-2 py-1 rounded-full font-black uppercase tracking-widest">Tempo Real</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Últimas 3 Vendas</h3>
            <span className="material-symbols-outlined text-sm text-text-sub-light">history</span>
          </div>
          <div className="flex flex-col gap-3">
            {lastThreeSales.length === 0 ? (
              <div className="py-6 text-center opacity-20 italic text-sm">Nenhuma venda registrada ainda.</div>
            ) : (
              lastThreeSales.map(sale => (
                <div key={sale.id} onClick={() => onEditSale(sale)} className="bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark p-4 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-sm flex justify-between items-center active:scale-95 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${sale.type === 'PDV' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/20 text-primary'}`}>
                      <span className="material-symbols-outlined text-xl">{sale.type === 'PDV' ? 'store' : 'pedal_bike'}</span>
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-black uppercase italic leading-none truncate">{sale.location}</h4>
                      <p className="text-[8px] font-bold text-text-sub-light mt-1 uppercase">{sale.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-black text-primary italic shrink-0">R$ {sale.total.toFixed(2)}</p>
                    <span className="material-symbols-outlined text-gray-400 text-sm">edit</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-2">
          <div className="flex justify-between items-center mb-5">
             <h2 className="text-[10px] font-black text-text-sub-light uppercase tracking-widest italic">Histórico Completo</h2>
             <div className="flex bg-surface-light/50 backdrop-blur-sm dark:bg-white/5 p-1 rounded-xl border border-black/5">
                {['Todos', 'Rua', 'PDV'].map(f => (
                  <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-surface-dark text-primary shadow-sm border border-black/5' : 'text-text-sub-light'}`}>{f}</button>
                ))}
             </div>
          </div>
          <div className="flex flex-col gap-3">
            {filteredSales.map(sale => (
              <SaleHistoryItem 
                key={sale.id} 
                sale={sale} 
                onEdit={() => onEditSale(sale)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const SaleHistoryItem: React.FC<{ sale: Sale, onEdit: () => void }> = ({ sale, onEdit }) => {
  return (
    <div onClick={onEdit} className="flex items-center justify-between p-4 bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark rounded-[1.8rem] border border-black/10 dark:border-white/10 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${sale.type === 'PDV' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/20 text-primary'}`}>
          <span className="material-symbols-outlined text-xl">{sale.type === 'PDV' ? 'store' : 'pedal_bike'}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black truncate italic leading-none uppercase tracking-tighter">{sale.location}</p>
          <p className="text-[9px] font-bold text-text-sub-light mt-1 uppercase truncate">{sale.city} • {sale.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-2">
        <div className="text-right">
          <p className="text-primary font-black text-sm">R$ {sale.total.toFixed(2)}</p>
          <span className="text-[7px] font-black text-text-sub-light/50 uppercase">{sale.date}</span>
        </div>
        <span className="material-symbols-outlined text-gray-400 text-sm">edit</span>
      </div>
    </div>
  );
};

export default SalesHistory;
