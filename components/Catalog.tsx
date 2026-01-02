import React, { useState } from 'react';
import { Truffle } from '../types';

interface Props {
  truffles: Truffle[];
  onSave: (truffle: Truffle) => void;
  onDelete: (id: string) => void;
}

const Catalog: React.FC<Props> = ({ truffles, onSave, onDelete }) => {
  const [search, setSearch] = useState('');
  const [editingTruffle, setEditingTruffle] = useState<Partial<Truffle> | null>(null);

  const filtered = truffles.filter(t => t.flavor.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTruffle?.flavor && editingTruffle.priceStreet !== undefined && editingTruffle.pricePDV !== undefined) {
      onSave({
        id: editingTruffle.id || Math.random().toString(36).substr(2, 9),
        flavor: editingTruffle.flavor,
        priceStreet: Number(editingTruffle.priceStreet),
        pricePDV: Number(editingTruffle.pricePDV),
        icon: editingTruffle.icon || 'cookie',
        imageUrl: editingTruffle.imageUrl
      });
      setEditingTruffle(null);
    }
  };

  if (editingTruffle) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6 pb-20">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setEditingTruffle(null)} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark shadow-sm text-text-sub-light dark:text-text-sub-dark">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-text-main-light dark:text-text-main-dark">{editingTruffle.id ? 'Editar Produto' : 'Novo Produto'}</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Configuração de Catálogo</p>
          </div>
        </header>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="relative size-32 rounded-[2rem] bg-white dark:bg-surface-dark shadow-lg border-2 border-primary/10 overflow-hidden flex items-center justify-center">
              {editingTruffle.imageUrl ? (
                <img src={editingTruffle.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-primary/30">{editingTruffle.icon || 'cookie'}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Nome do Sabor</label>
            <input 
              autoFocus
              className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl py-4 px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-text-main-light dark:text-text-main-dark font-bold"
              value={editingTruffle.flavor || ''}
              onChange={e => setEditingTruffle({...editingTruffle, flavor: e.target.value})}
              placeholder="Ex: Ninho com Nutella"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">URL da Imagem (Opcional)</label>
            <input 
              className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl py-4 px-5 text-xs shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-text-main-light dark:text-text-main-dark font-medium"
              value={editingTruffle.imageUrl || ''}
              onChange={e => setEditingTruffle({...editingTruffle, imageUrl: e.target.value})}
              placeholder="Cole o link de uma imagem aqui..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 italic">Preço na RUA</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark font-bold text-xs italic">R$</span>
                <input 
                  type="number" step="0.5"
                  className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl py-4 pl-10 pr-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-text-main-light dark:text-text-main-dark font-black"
                  value={editingTruffle.priceStreet || ''}
                  onChange={e => setEditingTruffle({...editingTruffle, priceStreet: Number(e.target.value)})}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 italic">Preço no PDV</label>
               <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark font-bold text-xs italic">R$</span>
                <input 
                  type="number" step="0.5"
                  className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl py-4 pl-10 pr-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-text-main-light dark:text-text-main-dark font-black"
                  value={editingTruffle.pricePDV || ''}
                  onChange={e => setEditingTruffle({...editingTruffle, pricePDV: Number(e.target.value)})}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Ícone de Identificação</label>
            <div className="grid grid-cols-5 gap-3">
              {['cookie', 'nutrition', 'cake', 'favorite', 'eco', 'circle', 'egg', 'bakery_dining', 'icecream', 'bubble_chart'].map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setEditingTruffle({...editingTruffle, icon})}
                  className={`size-12 rounded-xl flex items-center justify-center border-2 transition-all ${editingTruffle.icon === icon ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark border-transparent text-text-sub-light dark:text-text-sub-dark'}`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Salvar Produto
              <span className="material-symbols-outlined">save</span>
            </button>
            {editingTruffle.id && (
              <button 
                type="button"
                onClick={() => { if(confirm('Deseja excluir permanentemente este sabor?')) { onDelete(editingTruffle.id!); setEditingTruffle(null); } }}
                className="w-full h-14 text-red-400 font-black text-sm bg-red-400/5 dark:bg-red-400/10 rounded-2xl border border-red-400/20 active:scale-95 transition-all"
              >
                Excluir Sabor
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-background-light dark:bg-background-dark min-h-screen">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main-light dark:text-text-main-dark italic uppercase">Cardápio</h1>
          <p className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest mt-1">Configurações de Preço</p>
        </div>
        <button 
          onClick={() => setEditingTruffle({ icon: 'cookie' })}
          className="size-11 flex items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined font-bold">add</span>
        </button>
      </header>

      <div className="px-6 py-4">
        <div className="relative flex w-full items-center rounded-2xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden h-14 group transition-all focus-within:ring-primary/40">
          <div className="flex items-center justify-center pl-5 text-text-sub-light dark:text-text-sub-dark group-focus-within:text-primary">
            <span className="material-symbols-outlined text-2xl">search</span>
          </div>
          <input 
            className="flex-1 border-none bg-transparent h-full px-4 text-base focus:ring-0 text-text-main-light dark:text-text-main-dark placeholder:text-text-sub-light/50 font-bold" 
            placeholder="Qual sabor configurar?" 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 pb-32">
        <div className="flex items-baseline justify-between mb-5 mt-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-text-sub-light dark:text-text-sub-dark">Sabores em Linha</h2>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{filtered.length} ATIVOS</span>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 opacity-30 italic text-sm text-text-main-light dark:text-text-main-dark">Nenhum sabor encontrado...</div>
          ) : (
            filtered.map(truffle => (
              <TruffleConfigItem key={truffle.id} truffle={truffle} onEdit={() => setEditingTruffle(truffle)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TruffleConfigItem: React.FC<{ truffle: Truffle, onEdit: () => void }> = ({ truffle, onEdit }) => (
  <div 
    onClick={onEdit}
    className="group relative flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-[2.2rem] shadow-sm border border-gray-100 dark:border-white/5 transition-all active:scale-[0.97] cursor-pointer hover:border-primary/40"
  >
    <div className="flex items-center gap-4 overflow-hidden">
      <div className="flex shrink-0 size-20 items-center justify-center rounded-[1.8rem] bg-background-light dark:bg-primary/10 text-primary border border-gray-100 dark:border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300 overflow-hidden shadow-inner">
        {truffle.imageUrl ? (
          <img src={truffle.imageUrl} alt={truffle.flavor} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-4xl">{truffle.icon}</span>
        )}
      </div>
      <div className="flex flex-col min-w-0 text-left">
        <p className="text-lg font-black text-text-main-light dark:text-text-main-dark truncate leading-tight uppercase italic">{truffle.flavor}</p>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">RUA</span>
            <span className="font-black text-text-main-light dark:text-text-main-dark text-sm">R$ {truffle.priceStreet.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">PDV</span>
            <span className="text-text-sub-light dark:text-text-sub-dark font-bold text-sm italic">R$ {truffle.pricePDV.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="size-10 flex items-center justify-center rounded-full text-text-sub-light/30 group-hover:text-primary transition-colors">
      <span className="material-symbols-outlined">settings</span>
    </div>
  </div>
);

export default Catalog;