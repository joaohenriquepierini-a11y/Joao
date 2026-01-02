
import React, { useState } from 'react';
import { PDV } from '../types';

interface Props {
  onAdd: (pdv: PDV) => void;
  onCancel: () => void;
}

const RegisterPDV: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !city) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      companyName,
      contactName,
      city,
      phone
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="size-11 flex items-center justify-center rounded-2xl bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark shadow-sm text-text-sub-light border border-black/10">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div>
          <h1 className="text-xl font-black text-text-main-light dark:text-text-main-dark uppercase italic">Novo PDV</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Cadastro de Parceiro</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Nome da Empresa</label>
            <input 
              autoFocus
              className="w-full bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold italic text-text-main-light dark:text-white"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Ex: Padaria do Sol"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Nome do Contato (Pessoa)</label>
            <input 
              className="w-full bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main-light dark:text-white"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Ex: Sr. João"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-sub-light text-sm">call</span>
                <input 
                  type="tel"
                  className="w-full bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 pl-12 pr-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main-light dark:text-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Cidade</label>
              <input 
                className="w-full bg-surface-light/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main-light dark:text-white"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: Sorocaba"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all border border-black/10"
        >
          Salvar PDV
          <span className="material-symbols-outlined font-bold">add_business</span>
        </button>
      </form>
    </div>
  );
};

export default RegisterPDV;
