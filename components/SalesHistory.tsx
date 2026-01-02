import React, { useState, useMemo } from 'react';
import { Sale, Truffle, PaymentMethod, SaleItem } from '../types';

interface Props {
  sales: Sale[];
  truffles: Truffle[];
  onDeleteSale: (id: string) => void;
  onUpdateSale: (sale: Sale) => void;
}

const SalesHistory: React.FC<Props> = ({ sales, truffles, onDeleteSale, onUpdateSale }) => {
  const [filter, setFilter] = useState<'Todos' | 'Rua' | 'PDV'>('Todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const filteredSales = filter === 'Todos' ? sales : sales.filter(s => s.type === filter);

  const monthsData = useMemo(() => {
    const data: Record<string, { label: string, total: number, units: number, sales: Sale[] }> = {};
    const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

    sortedSales.forEach(sale => {
      const date = new Date(sale.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase();
      if (!data[key]) data[key] = { label, total: 0, units: 0, sales: [] };
      data[key].total += sale.total;
      data[key].units += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      data[key].sales.push(sale);
    });
    return Object.values(data);
  }, [sales]);

  const selectedMonth = monthsData[selectedMonthIndex] || monthsData[0];

  const monthInteligence = useMemo(() => {
    if (!selectedMonth) return null;
    const flavorCount: Record<string, number> = {};
    const cityCount: Record<string, number> = {};
    let totalConsigned = 0;

    selectedMonth.sales.forEach(s => {
      s.items.forEach(i => {
        flavorCount[i.truffleId] = (flavorCount[i.truffleId] || 0) + i.quantity;
        totalConsigned += (i.consignedQuantity || 0);
      });
      cityCount[s.city] = (cityCount[s.city] || 0) + s.total;
    });

    const topFlavorId = Object.entries(flavorCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topFlavor = truffles.find(t => t.id === topFlavorId);
    const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      topFlavor: topFlavor?.flavor || 'N/A',
      topFlavorIcon: topFlavor?.icon || 'cookie',
      topCity: topCity || 'N/A',
      avgSale: selectedMonth.total / selectedMonth.sales.length,
      totalConsigned
    };
  }, [selectedMonth, truffles]);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-6 border-b border-gray-100 dark:border-white/5">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">Relatórios</h1>
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Inteligência de Vendas</p>
      </header>

      <div className="px-6 py-6 flex flex-col gap-6">
        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Meses Anteriores</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {monthsData.map((m, idx) => (
              <button 
                key={m.label} 
                onClick={() => setSelectedMonthIndex(idx)}
                className={`min-w-[140px] p-4 rounded-[2rem] border transition-all text-left ${selectedMonthIndex === idx ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5'}`}
              >
                <span className={`text-[8px] font-black uppercase ${selectedMonthIndex === idx ? 'text-white/80' : 'text-primary'}`}>{m.label}</span>
                <p className="text-lg font-black leading-none mt-1">R$ {m.total.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </section>

        {monthInteligence && (
          <section className="bg-primary/5 dark:bg-primary/10 rounded-[2.2rem] p-5 border border-primary/10">
            <h3 className="text-[9px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined !text-[14px]">query_stats</span>
              Insights de {selectedMonth.label}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[7px] font-black text-gray-400 uppercase">Top Sabor</span>
                <p className="text-xs font-black text-gray-800 dark:text-white truncate">{monthInteligence.topFlavor}</p>
              </div>
              <div>
                <span className="text-[7px] font-black text-gray-400 uppercase">Top Cidade</span>
                <p className="text-xs font-black text-gray-800 dark:text-white truncate">{monthInteligence.topCity}</p>
              </div>
              <div>
                <span className="text-[7px] font-black text-gray-400 uppercase">Ticket Médio</span>
                <p className="text-xs font-black text-gray-800 dark:text-white">R$ {monthInteligence.avgSale.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[7px] font-black text-gray-400 uppercase">Remessas PDV</span>
                <p className="text-xs font-black text-blue-500">{monthInteligence.totalConsigned} un.</p>
              </div>
            </div>
          </section>
        )}

        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recentes</h2>
             <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                {['Todos', 'Rua', 'PDV'].map(f => (
                  <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-400'}`}>{f}</button>
                ))}
             </div>
          </div>
          <div className="flex flex-col gap-2">
            {filteredSales.map(sale => (
              <EditableSaleItem 
                key={sale.id} 
                sale={sale} 
                truffles={truffles} 
                onDelete={() => onDeleteSale(sale.id)} 
                onUpdate={onUpdateSale}
                isEditing={editingId === sale.id}
                onSetEditing={(v) => setEditingId(v ? sale.id : null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditableSaleItem: React.FC<{ sale: Sale, truffles: Truffle[], onDelete: () => void, onUpdate: (s: Sale) => void, isEditing: boolean, onSetEditing: (v: boolean) => void }> = ({ sale, truffles, onDelete, onUpdate, isEditing, onSetEditing }) => {
  const [edited, setEdited] = useState({...sale});
  if (isEditing) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border-2 border-primary shadow-xl">
        <div className="flex justify-between mb-4">
          <span className="text-[9px] font-black text-primary uppercase italic">Ajustar Registro</span>
          <button onClick={() => onSetEditing(false)} className="material-symbols-outlined text-gray-400">close</button>
        </div>
        <div className="space-y-3">
          <input className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 text-xs font-bold" value={edited.city} onChange={e => setEdited({...edited, city: e.target.value})} placeholder="Cidade" />
          <input className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 text-xs font-bold" value={edited.location} onChange={e => setEdited({...edited, location: e.target.value})} placeholder="Local" />
          <input className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 text-xs font-bold" type="number" value={edited.total} onChange={e => setEdited({...edited, total: parseFloat(e.target.value) || 0})} placeholder="Valor Total" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-6">
          <button onClick={onDelete} className="py-3 bg-red-50 text-red-500 rounded-xl font-black text-[9px] uppercase">Apagar</button>
          <button onClick={() => { onUpdate(edited); onSetEditing(false); }} className="py-3 bg-primary text-white rounded-xl font-black text-[9px] uppercase">Salvar</button>
        </div>
      </div>
    );
  }
  return (
    <div onClick={() => onSetEditing(true)} className="flex items-center justify-between p-3.5 bg-white dark:bg-surface-dark rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="size-10 rounded-xl bg-background-light dark:bg-white/5 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-xl">receipt</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate italic leading-none">{sale.city}</p>
          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase truncate">{sale.type} • {sale.location}</p>
        </div>
      </div>
      <div className="text-right pl-2">
        <p className="text-primary font-black text-sm">R$ {sale.total.toFixed(2)}</p>
        <span className="text-[7px] font-black text-gray-300 uppercase">{sale.date}</span>
      </div>
    </div>
  );
};

export default SalesHistory;