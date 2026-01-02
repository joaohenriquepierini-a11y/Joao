import React, { useState } from 'react';
import { Truffle, Sale, PaymentMethod, SaleItem } from '../types';

interface Props {
  truffles: Truffle[];
  onAddSale: (sale: Sale) => void;
  onCancel: () => void;
  type: 'Rua' | 'PDV';
}

const RegisterSale: React.FC<Props> = ({ truffles, onAddSale, onCancel, type }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({}); 
  const [consigned, setConsigned] = useState<Record<string, number>>({}); 
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ownerName, setOwnerName] = useState('');

  const calculateTotal = () => {
    return (Object.entries(quantities) as [string, number][]).reduce((acc, [id, qty]) => {
      const truffle = truffles.find(t => t.id === id);
      const price = type === 'Rua' ? truffle?.priceStreet : truffle?.pricePDV;
      return acc + (price || 0) * qty;
    }, 0);
  };

  const handleConfirm = () => {
    if (!city || !location) { alert("Preencha a cidade e o local!"); return; }
    const items: SaleItem[] = truffles
      .filter(t => (quantities[t.id] || 0) > 0 || (consigned[t.id] || 0) > 0)
      .map(t => ({
        truffleId: t.id,
        quantity: quantities[t.id] || 0,
        consignedQuantity: consigned[t.id] || 0
      }));

    if (items.length === 0) { alert("Adicione pelo menos uma trufa!"); return; }

    const dateObj = new Date(selectedDate + "T12:00:00");
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }).toUpperCase(),
      timestamp: dateObj.getTime(),
      city, location, type, paymentMethod, items,
      total: calculateTotal(),
      ownerName: type === 'PDV' ? ownerName : undefined
    };
    onAddSale(newSale);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 h-16 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <button onClick={onCancel} className="material-symbols-outlined text-gray-500">arrow_back</button>
        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase italic">Registrar {type}</h2>
        <div className="w-6"></div>
      </header>

      <main className="p-6 space-y-6">
        <section className="space-y-3">
          <input className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl p-4 text-sm font-bold shadow-sm" placeholder="Cidade (Ex: Campinas)" value={city} onChange={e => setCity(e.target.value)} />
          <input className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl p-4 text-sm font-bold shadow-sm" placeholder={type === 'PDV' ? "Nome da Loja" : "Ponto de Referência"} value={location} onChange={e => setLocation(e.target.value)} />
          <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <input type="date" className="bg-transparent border-none text-xs font-black uppercase flex-1 focus:ring-0" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Produtos e Volumes</h3>
          {truffles.map(t => (
            <div key={t.id} className="bg-white dark:bg-surface-dark p-4 rounded-[1.8rem] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{t.icon}</span>
                <span className="text-xs font-black uppercase italic">{t.flavor}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-2">
                  <button onClick={() => setQuantities({...quantities, [t.id]: Math.max(0, (quantities[t.id] || 0) - 1)})} className="p-1 text-primary">-</button>
                  <span className="w-6 text-center text-xs font-black">{quantities[t.id] || 0}</span>
                  <button onClick={() => setQuantities({...quantities, [t.id]: (quantities[t.id] || 0) + 1})} className="p-1 text-primary">+</button>
                </div>
                {type === 'PDV' && (
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/10 rounded-xl px-2">
                    <button onClick={() => setConsigned({...consigned, [t.id]: Math.max(0, (consigned[t.id] || 0) - 1)})} className="p-1 text-blue-500">-</button>
                    <span className="w-6 text-center text-xs font-black text-blue-500">{consigned[t.id] || 0}</span>
                    <button onClick={() => setConsigned({...consigned, [t.id]: (consigned[t.id] || 0) + 1})} className="p-1 text-blue-500">+</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 z-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Total Final</p>
            <p className="text-2xl font-black text-primary">R$ {calculateTotal().toFixed(2)}</p>
          </div>
          <div className="flex gap-1">
             {['PIX', 'DIN'].map(pm => (
               <button key={pm} onClick={() => setPaymentMethod(pm === 'PIX' ? 'PIX' : 'DINHEIRO')} className={`px-3 py-2 text-[10px] font-black rounded-xl transition-all ${paymentMethod === (pm === 'PIX' ? 'PIX' : 'DINHEIRO') ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>{pm}</button>
             ))}
          </div>
        </div>
        <button onClick={handleConfirm} className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all">Confirmar Lançamento</button>
      </div>
    </div>
  );
};

export default RegisterSale;