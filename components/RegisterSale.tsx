
import React, { useState, useEffect } from 'react';
import { Truffle, Sale, SaleItem, PDV } from '../types';

interface Props {
  truffles: Truffle[];
  onAddSale: (sale: Sale) => void;
  onCancel: () => void;
  type: 'Rua' | 'PDV';
  preSelectedPDV?: PDV | null;
  initialSale?: Sale | null;
  onDeletePDV?: (id: string) => boolean;
  sales?: Sale[]; 
}

const RegisterSale: React.FC<Props> = ({ truffles, onAddSale, onCancel, type, preSelectedPDV, initialSale, onDeletePDV, sales = [] }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({}); 
  const [leftOver, setLeftOver] = useState<Record<string, number>>({}); 
  const [newConsigned, setNewConsigned] = useState<Record<string, number>>({}); 
  
  const [city, setCity] = useState(preSelectedPDV?.city || initialSale?.city || '');
  const [location, setLocation] = useState(preSelectedPDV?.companyName || initialSale?.location || '');
  const [ownerName, setOwnerName] = useState(preSelectedPDV?.contactName || initialSale?.ownerName || '');
  const [observation, setObservation] = useState(initialSale?.observation || '');
  const [selectedDate, setSelectedDate] = useState(initialSale ? new Date(initialSale.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialSale) {
      const q: Record<string, number> = {};
      const l: Record<string, number> = {};
      const n: Record<string, number> = {};
      
      initialSale.items.forEach(item => {
        q[item.truffleId] = item.quantity;
        l[item.truffleId] = item.leftOverQuantity || 0;
        n[item.truffleId] = item.newConsignedQuantity || 0;
      });
      
      setQuantities(q);
      setLeftOver(l);
      setNewConsigned(n);
    }
  }, [initialSale]);

  const isFuturePDV = preSelectedPDV ? !sales.some(s => s.location.toLowerCase() === preSelectedPDV.companyName.toLowerCase() && s.type === 'PDV') : false;

  const calculatedTotal = (Object.entries(quantities) as [string, number][]).reduce((acc, [id, qty]) => {
    const truffle = truffles.find(t => t.id === id);
    const price = type === 'Rua' ? truffle?.priceStreet : truffle?.pricePDV;
    return acc + (price || 0) * qty;
  }, 0);

  const handleConfirm = () => {
    if (type === 'PDV' && (!location || !city)) { alert("Preencha o nome da loja e cidade!"); return; }

    const items: SaleItem[] = truffles
      .filter(t => (quantities[t.id] || 0) > 0 || (leftOver[t.id] || 0) > 0 || (newConsigned[t.id] || 0) > 0)
      .map(t => ({
        truffleId: t.id,
        quantity: quantities[t.id] || 0,
        leftOverQuantity: leftOver[t.id] || 0,
        newConsignedQuantity: newConsigned[t.id] || 0
      }));

    if (items.length === 0) { alert("Adicione pelo menos uma trufa!"); return; }

    const dateObj = new Date(selectedDate + "T12:00:00");
    const newSale: Sale = {
      id: initialSale?.id || Math.random().toString(36).substr(2, 9),
      date: dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }).toUpperCase(),
      timestamp: dateObj.getTime(),
      city: type === 'Rua' ? 'Venda de Rua' : city,
      location: type === 'Rua' ? 'Ponto Móvel' : location,
      type,
      paymentMethod: 'PIX', 
      items,
      total: calculatedTotal,
      ownerName: type === 'PDV' ? ownerName : undefined,
      observation: observation.trim() || undefined
    };
    onAddSale(newSale);
  };

  const updateVal = (setter: any, current: any, id: string, val: string | number) => {
    const n = typeof val === 'string' ? parseInt(val) || 0 : val;
    setter({...current, [id]: Math.max(0, n)});
  };

  if (type === 'Rua') {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32">
        <header className="px-6 py-10 flex items-center justify-between">
          <button onClick={onCancel} className="material-symbols-outlined text-gray-400">close</button>
          <div className="text-center">
            <h1 className="text-xl font-black text-primary uppercase italic leading-none">{initialSale ? 'Editar Venda Rua' : 'Venda Rápida Rua'}</h1>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Ponto Móvel</p>
          </div>
          <div className="w-6"></div>
        </header>

        <div className="px-6 space-y-4">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 mb-6">
             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Data da Venda</label>
             <input type="date" className="w-full bg-transparent border-none p-2 text-xs font-black" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>

          {truffles.map(t => (
            <div key={t.id} className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{t.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase italic">{t.flavor}</h4>
                  <p className="text-[10px] font-bold text-primary">R$ {t.priceStreet.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-2xl p-1 px-2 gap-2">
                <button onClick={() => updateVal(setQuantities, quantities, t.id, (quantities[t.id] || 0) - 1)} className="size-8 flex items-center justify-center text-primary font-black text-2xl">-</button>
                <input 
                  type="number" 
                  className="w-12 bg-transparent border-none p-0 text-center text-lg font-black focus:ring-0" 
                  value={quantities[t.id] || 0}
                  onChange={e => updateVal(setQuantities, quantities, t.id, e.target.value)}
                />
                <button onClick={() => updateVal(setQuantities, quantities, t.id, (quantities[t.id] || 0) + 1)} className="size-8 flex items-center justify-center text-primary font-black text-2xl">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
            <span className="text-2xl font-black text-primary italic">R$ {calculatedTotal.toFixed(2)}</span>
          </div>
          <button onClick={handleConfirm} className="w-full h-14 bg-primary text-white rounded-[2rem] font-black shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase">
            {initialSale ? 'Atualizar Venda' : 'Salvar Venda'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-44">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <button onClick={onCancel} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark text-gray-400 shadow-sm active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-text-main-light dark:text-white uppercase italic leading-none">{initialSale ? 'Editar Visita PDV' : 'Acerto de PDV'}</h1>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Gestão de Consignação</p>
        </div>
        <div className="w-11"></div>
      </header>

      <main className="p-6 space-y-6">
        <section className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-primary uppercase tracking-widest px-1">Nome da Loja</label>
            <input 
              disabled={!!preSelectedPDV}
              className="w-full bg-background-light dark:bg-white/5 border-none rounded-2xl p-4 text-base font-black italic shadow-inner" 
              placeholder="Ex: Padaria do Sol" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Responsável</label>
               <input className="w-full bg-background-light dark:bg-white/5 border-none rounded-2xl p-4 text-xs font-bold" placeholder="Contato" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Data</label>
               <input type="date" className="w-full bg-background-light dark:bg-white/5 border-none rounded-2xl p-4 text-[10px] font-black h-[52px]" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 italic">Controle por Sabor</h3>
          {truffles.map(t => (
            <div key={t.id} className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{t.icon}</span>
                </div>
                <h4 className="text-sm font-black uppercase italic">{t.flavor}</h4>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 items-center">
                  <span className="text-[7px] font-black text-green-500 uppercase">Vendidas</span>
                  <div className="flex flex-col items-center bg-green-500/5 rounded-2xl border border-green-500/10 py-1 w-full">
                    <button onClick={() => updateVal(setQuantities, quantities, t.id, (quantities[t.id] || 0) + 1)} className="p-1 text-green-500"><span className="material-symbols-outlined text-sm">expand_less</span></button>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none p-0 text-center text-lg font-black text-green-600 focus:ring-0" 
                      value={quantities[t.id] || 0}
                      onChange={e => updateVal(setQuantities, quantities, t.id, e.target.value)}
                    />
                    <button onClick={() => updateVal(setQuantities, quantities, t.id, (quantities[t.id] || 0) - 1)} className="p-1 text-green-500"><span className="material-symbols-outlined text-sm">expand_more</span></button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 items-center">
                  <span className="text-[7px] font-black text-gray-400 uppercase">Sobra</span>
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 py-1 w-full">
                    <button onClick={() => updateVal(setLeftOver, leftOver, t.id, (leftOver[t.id] || 0) + 1)} className="p-1 text-gray-400"><span className="material-symbols-outlined text-sm">expand_less</span></button>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none p-0 text-center text-lg font-black focus:ring-0" 
                      value={leftOver[t.id] || 0}
                      onChange={e => updateVal(setLeftOver, leftOver, t.id, e.target.value)}
                    />
                    <button onClick={() => updateVal(setLeftOver, leftOver, t.id, (leftOver[t.id] || 0) - 1)} className="p-1 text-gray-400"><span className="material-symbols-outlined text-sm">expand_more</span></button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 items-center">
                  <span className="text-[7px] font-black text-primary uppercase">Deixadas</span>
                  <div className="flex flex-col items-center bg-primary/5 rounded-2xl border border-primary/10 py-1 w-full">
                    <button onClick={() => updateVal(setNewConsigned, newConsigned, t.id, (newConsigned[t.id] || 0) + 1)} className="p-1 text-primary"><span className="material-symbols-outlined text-sm">expand_less</span></button>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none p-0 text-center text-lg font-black text-primary focus:ring-0" 
                      value={newConsigned[t.id] || 0}
                      onChange={e => updateVal(setNewConsigned, newConsigned, t.id, e.target.value)}
                    />
                    <button onClick={() => updateVal(setNewConsigned, newConsigned, t.id, (newConsigned[t.id] || 0) - 1)} className="p-1 text-primary"><span className="material-symbols-outlined text-sm">expand_more</span></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-2">
           <label className="text-[10px] font-black text-primary uppercase tracking-widest px-2 italic">Observações desta Visita</label>
           <textarea 
            className="w-full bg-white dark:bg-surface-dark border-none rounded-[2rem] p-6 text-sm font-medium shadow-sm min-h-[140px] resize-none focus:ring-2 focus:ring-primary/20"
            placeholder="Feedback do cliente..."
            value={observation}
            onChange={e => setObservation(e.target.value)}
          />
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 z-[60]">
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Recebido</p>
            <p className="text-3xl font-black text-primary italic">R$ {calculatedTotal.toFixed(2)}</p>
          </div>
          <button onClick={handleConfirm} className="bg-primary text-white h-14 px-8 rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase">
            {initialSale ? 'Atualizar Registro' : 'Finalizar Acerto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSale;
