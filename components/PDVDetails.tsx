
import React, { useMemo } from 'react';
import { PDV, Sale, Truffle } from '../types';

interface Props {
  pdv: PDV | null;
  sales: Sale[];
  truffles: Truffle[];
  onBack: () => void;
  onSelectPDVForSale: (pdv: PDV) => void;
}

const PDVDetails: React.FC<Props> = ({ pdv, sales, truffles, onBack, onSelectPDVForSale }) => {
  if (!pdv) return null;

  const pdvSales = useMemo(() => {
    return sales
      .filter(s => s.location.toLowerCase() === pdv.companyName.toLowerCase() && s.type === 'PDV')
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, pdv]);

  const monthlyHistory = useMemo(() => {
    const months: Record<string, { label: string, sales: Sale[], total: number }> = {};
    
    pdvSales.forEach(sale => {
      const date = new Date(sale.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
      
      if (!months[monthKey]) {
        months[monthKey] = { label: monthLabel, sales: [], total: 0 };
      }
      months[monthKey].sales.push(sale);
      months[monthKey].total += sale.total;
    });

    return Object.values(months);
  }, [pdvSales]);

  const totalRevenue = pdvSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 h-20 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <button onClick={onBack} className="size-11 flex items-center justify-center rounded-2xl bg-surface-light/40 dark:bg-surface-dark shadow-sm text-text-sub-light border border-black/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center flex-1 truncate px-4">
          <h2 className="text-sm font-black text-text-main-light dark:text-white uppercase italic truncate max-w-full">{pdv.companyName}</h2>
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-0.5 italic">Histórico de Visitas</span>
        </div>
        <button 
          onClick={() => onSelectPDVForSale(pdv)}
          className="size-11 flex items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 border border-black/10"
        >
          <span className="material-symbols-outlined font-black">receipt_long</span>
        </button>
      </header>

      <main className="p-6 space-y-8">
        {/* Sumário do Parceiro */}
        <section className="bg-surface-light/30 backdrop-blur-xl dark:bg-surface-dark p-6 rounded-[2.5rem] border border-black/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.05]">
            <span className="material-symbols-outlined text-7xl text-primary">analytics</span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Métricas Acumuladas</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] font-black text-text-sub-light uppercase tracking-widest">Faturamento Total</span>
                <p className="text-xl font-black italic text-text-main-light dark:text-white mt-0.5">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[8px] font-black text-text-sub-light uppercase tracking-widest">Visitas</span>
                <p className="text-xl font-black italic text-text-main-light dark:text-white mt-0.5">{pdvSales.length}</p>
              </div>
            </div>
            {pdv.phone && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-text-sub-light">call</span>
                <span className="text-[10px] font-bold text-text-sub-light">{pdv.phone}</span>
              </div>
            )}
          </div>
        </section>

        {/* Linha do Tempo Mensal */}
        {monthlyHistory.length === 0 ? (
          <div className="py-20 flex flex-col items-center opacity-30 text-center gap-4 italic">
            <span className="material-symbols-outlined text-5xl">manage_search</span>
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma visita registrada para este PDV ainda.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {monthlyHistory.map((month) => (
              <section key={month.label} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-[0.2em] italic border-b border-primary/20 pb-1">{month.label}</h3>
                  <span className="text-[10px] font-black text-primary italic">R$ {month.total.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  {month.sales.map((visit) => (
                    <div key={visit.id} className="bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark p-5 rounded-[2.2rem] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-text-main-light dark:text-white uppercase italic">{visit.date}</span>
                        <span className="text-sm font-black text-primary italic">R$ {visit.total.toFixed(2)}</span>
                      </div>

                      {/* Detalhes dos Itens Vendidos */}
                      <div className="grid grid-cols-2 gap-2">
                        {visit.items.map(item => {
                          const truffle = truffles.find(t => t.id === item.truffleId);
                          if (!truffle || item.quantity === 0) return null;
                          return (
                            <div key={item.truffleId} className="bg-background-light/30 dark:bg-white/5 p-2 rounded-xl border border-black/5 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[10px] text-primary">{truffle.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black uppercase truncate leading-none">{truffle.flavor}</p>
                                <p className="text-[9px] font-bold text-primary mt-0.5">{item.quantity} un</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Observações - Campo que o usuário sentiu falta */}
                      {visit.observation && (
                        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10 relative">
                          <span className="material-symbols-outlined absolute -top-2 -left-2 size-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">comment</span>
                          <p className="text-[10px] font-medium text-text-main-light dark:text-gray-300 leading-relaxed italic">"{visit.observation}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PDVDetails;
