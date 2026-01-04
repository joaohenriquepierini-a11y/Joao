
import React, { useMemo } from 'react';
import { PDV, Sale, Truffle } from '../types';

interface Props {
  pdv: PDV | null;
  sales: Sale[];
  truffles: Truffle[];
  onBack: () => void;
  onSelectPDVForSale: (pdv: PDV) => void;
  onEditSale: (sale: Sale) => void;
}

const PDVDetails: React.FC<Props> = ({ pdv, sales, truffles, onBack, onSelectPDVForSale, onEditSale }) => {
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

  // Função para formatar o link do WhatsApp
  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Se não tiver o DDI 55, adiciona automaticamente
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}`;
  };

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
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Métricas Acumuladas</p>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <span className="text-[8px] font-black text-text-sub-light uppercase tracking-widest">Faturamento Total</span>
                    <p className="text-2xl font-black italic text-text-main-light dark:text-white mt-0.5">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-text-sub-light uppercase tracking-widest">Visitas</span>
                    <p className="text-xl font-black italic text-text-main-light dark:text-white mt-0.5">{pdvSales.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Botão de Contato WhatsApp */}
              {pdv.phone && (
                <a 
                  href={getWhatsAppLink(pdv.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center size-16 bg-[#25D366] text-white rounded-2xl shadow-lg shadow-[#25D366]/20 active:scale-90 transition-all border border-white/20"
                >
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="text-[7px] font-black uppercase tracking-tighter mt-1">CHAT</span>
                </a>
              )}
            </div>
            
            {pdv.phone && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                <a 
                  href={getWhatsAppLink(pdv.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-sub-light active:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">call</span>
                  <span className="text-[10px] font-bold">{pdv.phone}</span>
                  <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase ml-auto">Falar agora</span>
                </a>
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
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-text-main-light dark:text-white uppercase italic">{visit.date}</span>
                           <button onClick={() => onEditSale(visit)} className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/10 active:scale-90 transition-transform">
                              <span className="material-symbols-outlined !text-sm">edit</span>
                           </button>
                        </div>
                        <span className="text-sm font-black text-primary italic">R$ {visit.total.toFixed(2)}</span>
                      </div>

                      {/* Detalhes dos Itens Vendidos */}
                      <div className="grid grid-cols-2 gap-2">
                        {visit.items.map(item => {
                          const truffle = truffles.find(t => t.id === item.truffleId);
                          if (!truffle) return null;
                          if (item.quantity === 0 && (item.leftOverQuantity || 0) === 0 && (item.newConsignedQuantity || 0) === 0) return null;
                          
                          return (
                            <div key={item.truffleId} className="bg-background-light/30 dark:bg-white/5 p-2 rounded-xl border border-black/5 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[10px] text-primary">{truffle.icon}</span>
                                <p className="text-[8px] font-black uppercase truncate leading-none">{truffle.flavor}</p>
                              </div>
                              <div className="flex flex-wrap justify-between text-[7px] font-bold text-text-sub-light uppercase px-0.5 gap-x-2">
                                 <span className="text-green-500">V: {item.quantity}</span>
                                 <span>S: {item.leftOverQuantity || 0}</span>
                                 <span className="text-primary">D: {item.newConsignedQuantity || 0}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Observações */}
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
