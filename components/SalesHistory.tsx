
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
  const [activeTab, setActiveTab] = useState<'vendas' | 'financeiro'>('vendas');
  const [filter, setFilter] = useState<'Todos' | 'Rua' | 'PDV'>('Todos');

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const todaySales = sales.filter(s => s.timestamp >= todayStart);
  const todayTotal = todaySales.reduce((acc, curr) => acc + curr.total, 0);

  const filteredSales = (filter === 'Todos' ? sales : sales.filter(s => s.type === filter)).sort((a,b) => b.timestamp - a.timestamp);

  // Lógica de Agrupamento Financeiro Mensal com Conversão de Estoque
  const financialStats = useMemo(() => {
    const months: Record<string, { 
      month: string, 
      year: number, 
      total: number, 
      street: number, 
      pdv: number, 
      count: number, 
      timestamp: number,
      pdvItemsSold: number,
      pdvItemsLeft: number
    }> = {};
    
    sales.forEach(sale => {
      const d = new Date(sale.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) {
        months[key] = {
          month: d.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase(),
          year: d.getFullYear(),
          total: 0,
          street: 0,
          pdv: 0,
          count: 0,
          timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
          pdvItemsSold: 0,
          pdvItemsLeft: 0
        };
      }
      months[key].total += sale.total;
      months[key].count += 1;
      
      if (sale.type === 'Rua') {
        months[key].street += sale.total;
      } else if (sale.type === 'PDV') {
        months[key].pdv += sale.total;
        // Soma volumes para conversão
        sale.items.forEach(item => {
          months[key].pdvItemsSold += item.quantity;
          months[key].pdvItemsLeft += (item.leftOverQuantity || 0);
        });
      }
    });

    return Object.values(months).sort((a, b) => b.timestamp - a.timestamp);
  }, [sales]);

  const annualTotal = financialStats.reduce((acc, curr) => acc + curr.total, 0);
  const annualSold = financialStats.reduce((acc, curr) => acc + curr.pdvItemsSold, 0);
  const annualLeft = financialStats.reduce((acc, curr) => acc + curr.pdvItemsLeft, 0);
  const annualPotential = annualSold + annualLeft;
  const annualConversion = annualPotential > 0 ? (annualSold / annualPotential) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-6 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-text-main-light dark:text-white uppercase italic leading-none">Histórico</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Gestão de Faturamento</p>
          </div>
          
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5">
             <button 
               onClick={() => setActiveTab('vendas')}
               className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'vendas' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-sub-light'}`}
             >
               Vendas
             </button>
             <button 
               onClick={() => setActiveTab('financeiro')}
               className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'financeiro' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-sub-light'}`}
             >
               Financeiro
             </button>
          </div>
        </div>

        {activeTab === 'vendas' && (
           <div className="flex bg-surface-light/50 backdrop-blur-sm dark:bg-white/5 p-1 rounded-xl border border-black/5">
              {['Todos', 'Rua', 'PDV'].map(f => (
                <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 py-2 text-[8px] font-black rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-surface-dark text-primary shadow-sm border border-black/5' : 'text-text-sub-light'}`}>{f}</button>
              ))}
           </div>
        )}
      </header>

      <div className="px-6 py-6 flex flex-col gap-8">
        {activeTab === 'vendas' ? (
          <>
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
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Últimas Vendas</h3>
                <button onClick={onRegisterStreetSale} className="text-[9px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/10">Nova Venda +</button>
              </div>
              <div className="flex flex-col gap-3">
                {filteredSales.length === 0 ? (
                  <div className="py-20 text-center opacity-20 italic text-sm">Nenhuma venda encontrada para o filtro.</div>
                ) : (
                  filteredSales.map(sale => (
                    <SaleHistoryItem 
                      key={sale.id} 
                      sale={sale} 
                      onEdit={() => onEditSale(sale)}
                    />
                  ))
                )}
              </div>
            </section>
          </>
        ) : (
          /* ABA FINANCEIRA (DETALHAMENTO MENSAL E CONVERSÃO) */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <div className="bg-surface-light dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-sm border border-black/10 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                  <span className="material-symbols-outlined text-9xl text-primary">analytics</span>
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 italic">Faturamento Anual Total</p>
                  <h2 className="text-4xl font-black italic tracking-tighter text-text-main-light dark:text-white">
                    R$ {annualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
                  
                  {/* Métrica de Conversão Anual */}
                  <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-black text-text-sub-light uppercase tracking-widest mb-3 italic">Conversão Global PDVs</span>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-primary italic leading-none">{Math.round(annualConversion)}%</span>
                        <span className="text-[7px] font-bold text-gray-400 uppercase mt-1">Convertido</span>
                      </div>
                      <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10"></div>
                      <div className="flex flex-col items-start text-left">
                        <p className="text-[8px] font-black text-text-main-light dark:text-gray-400 uppercase leading-tight">
                          Vendidas: <span className="text-primary">{annualSold} unid.</span>
                        </p>
                        <p className="text-[8px] font-black text-text-main-light dark:text-gray-400 uppercase leading-tight mt-1">
                          Sobras: <span className="text-gray-400">{annualLeft} unid.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-text-sub-light uppercase tracking-[0.25em] px-2 italic">Histórico Mês a Mês</h3>
               <div className="flex flex-col gap-6">
                  {financialStats.length === 0 ? (
                    <div className="py-20 text-center opacity-20 italic">Ainda não há dados suficientes para análise.</div>
                  ) : (
                    financialStats.map(stat => {
                      const monthPotential = stat.pdvItemsSold + stat.pdvItemsLeft;
                      const monthConversion = monthPotential > 0 ? (stat.pdvItemsSold / monthPotential) * 100 : 0;
                      
                      return (
                        <div key={`${stat.month}-${stat.year}`} className="bg-white/40 backdrop-blur-md dark:bg-surface-dark p-6 rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-sm transition-all active:scale-[0.98]">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <h4 className="text-lg font-black text-text-main-light dark:text-white uppercase italic leading-none">{stat.month}</h4>
                                <p className="text-[9px] font-black text-primary mt-1">{stat.year}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-xl font-black text-primary italic leading-none">R$ {stat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                <p className="text-[8px] font-bold text-text-sub-light uppercase mt-1">{stat.count} Operações</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6">
                             <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-3xl border border-primary/10">
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="material-symbols-outlined text-primary !text-sm">pedal_bike</span>
                                   <span className="text-[8px] font-black text-text-sub-light uppercase">Rua</span>
                                </div>
                                <p className="text-sm font-black text-text-main-light dark:text-white italic">R$ {stat.street.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                             </div>

                             <div className="bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-3xl border border-blue-500/10">
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="material-symbols-outlined text-blue-500 !text-sm">store</span>
                                   <span className="text-[8px] font-black text-text-sub-light uppercase">PDV</span>
                                </div>
                                <p className="text-sm font-black text-text-main-light dark:text-white italic">R$ {stat.pdv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                             </div>
                          </div>
                          
                          {/* Métrica de Conversão Mensal */}
                          <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                             <div>
                                <div className="flex justify-between text-[8px] font-black text-text-sub-light uppercase mb-2 px-1">
                                   <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary"></span> Conversão Consignado</span>
                                   <span className="text-primary italic">{Math.round(monthConversion)}% EFICIÊNCIA</span>
                                </div>
                                <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex">
                                   <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${monthConversion}%` }}></div>
                                   <div className="h-full bg-gray-200 dark:bg-white/10 transition-all duration-1000" style={{ width: `${100 - monthConversion}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 px-1">
                                   <span className="text-[7px] font-bold text-gray-400 uppercase">Vendidas: {stat.pdvItemsSold}u</span>
                                   <span className="text-[7px] font-bold text-gray-400 uppercase">Sobras: {stat.pdvItemsLeft}u</span>
                                </div>
                             </div>

                             <div>
                                <div className="flex justify-between text-[8px] font-black text-text-sub-light uppercase mb-2 px-1">
                                   <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500"></span> Balanço Financeiro</span>
                                   <span>{Math.round((stat.pdv / stat.total) * 100)}% PDV</span>
                                </div>
                                <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex">
                                   <div className="h-full bg-primary" style={{ width: `${(stat.street / stat.total) * 100}%` }}></div>
                                   <div className="h-full bg-blue-500" style={{ width: `${(stat.pdv / stat.total) * 100}%` }}></div>
                                </div>
                             </div>
                          </div>
                        </div>
                      );
                    })
                  )}
               </div>
            </section>
          </div>
        )}
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
