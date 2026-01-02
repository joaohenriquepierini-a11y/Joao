
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCreated, setLastCreated] = useState<PDV | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !city) return;
    
    const newPdv: PDV = {
      id: Math.random().toString(36).substr(2, 9),
      companyName,
      contactName,
      city,
      phone
    };
    
    setLastCreated(newPdv);
    setShowSuccess(true);
  };

  const confirmAndGo = () => {
    if (lastCreated) {
      onAdd(lastCreated);
    }
  };

  if (showSuccess && lastCreated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-8 animate-in zoom-in-95 duration-300">
        <div className="size-24 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-green-500/20 mb-6">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h2 className="text-xl font-black text-text-main-light dark:text-white uppercase italic text-center leading-tight">
          PDV Cadastrado com Sucesso!
        </h2>
        <p className="text-xs font-bold text-text-sub-light mt-2 mb-10 text-center">
          Deseja registrar a primeira entrega/estoque para <br/>
          <span className="text-primary font-black">"{lastCreated.companyName.toUpperCase()}"</span> agora?
        </p>
        
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={confirmAndGo}
            className="w-full h-16 bg-primary text-white rounded-3xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            SIM, REGISTRAR AGORA
            <span className="material-symbols-outlined">receipt_long</span>
          </button>
          <button 
            onClick={() => onAdd(lastCreated)}
            className="w-full h-14 text-text-sub-light font-black text-[10px] uppercase tracking-widest active:scale-95"
          >
            NÃO, APENAS SALVAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6 pb-32">
      <header className="mb-10 pt-4">
        <h1 className="text-2xl font-black text-text-main-light dark:text-white uppercase italic leading-none">Novo Ponto de Venda</h1>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">Expansão da Rota Master</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Nome Fantasia / Empresa</label>
            <input 
              className="w-full bg-white/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold italic text-text-main-light dark:text-white"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Ex: Mercearia Central"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Responsável pelo Acerto</label>
            <input 
              className="w-full bg-white/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 px-5 text-base shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main-light dark:text-white"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Ex: Carlos Oliveira"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Telefone de Contato</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-sub-light text-sm">call</span>
                <input 
                  type="tel"
                  className="w-full bg-white/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 pl-12 pr-5 text-base shadow-sm font-bold text-text-main-light dark:text-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest ml-1">Cidade da Rota</label>
              <input 
                className="w-full bg-white/40 backdrop-blur-md dark:bg-surface-dark border border-black/10 rounded-2xl py-4 px-5 text-base shadow-sm font-bold text-text-main-light dark:text-white"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full h-16 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mt-4 active:scale-95 transition-all border border-black/10"
        >
          Salvar Parceiro
          <span className="material-symbols-outlined">add_business</span>
        </button>
      </form>
    </div>
  );
};

export default RegisterPDV;
