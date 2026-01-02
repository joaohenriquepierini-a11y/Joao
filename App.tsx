import React, { useState, useEffect } from 'react';
import { View, Sale, Truffle, PDV } from './types';
import Dashboard from './components/Dashboard';
import SalesHistory from './components/SalesHistory';
import Catalog from './components/Catalog';
import PDVList from './components/PDVList';
import PDVDetails from './components/PDVDetails';
import CityDetails from './components/CityDetails';
import RegisterSale from './components/RegisterSale';
import Settings from './components/Settings';

const MOCK_TRUFFLES: Truffle[] = [
  { id: '1', flavor: 'Tradicional', priceStreet: 3.0, pricePDV: 3.5, icon: 'cookie' },
  { id: '2', flavor: 'Maracujá', priceStreet: 3.5, pricePDV: 4.0, icon: 'nutrition' },
  { id: '3', flavor: 'Ninho com Nutella', priceStreet: 5.0, pricePDV: 6.0, icon: 'cake' },
  { id: '4', flavor: 'Morango', priceStreet: 3.5, pricePDV: 4.0, icon: 'favorite' },
  { id: '5', flavor: 'Limão Siciliano', priceStreet: 3.5, pricePDV: 4.0, icon: 'eco' },
  { id: '6', flavor: 'Brigadeiro Belga', priceStreet: 4.5, pricePDV: 5.5, icon: 'circle' },
];

const MOCK_PDVS: PDV[] = [
  { id: '1', name: 'Padaria do João', city: 'São Paulo' },
  { id: '2', name: 'Mercearia Central', city: 'Campinas' },
  { id: '3', name: 'Sorocaba Express', city: 'Sorocaba' },
];

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('tp_sales') || '[]'));
  const [truffles, setTruffles] = useState<Truffle[]>(() => JSON.parse(localStorage.getItem('tp_truffles') || JSON.stringify(MOCK_TRUFFLES)));
  const [userName, setUserName] = useState(() => localStorage.getItem('tp_name') || 'Mariana');
  const [userImage, setUserImage] = useState(() => localStorage.getItem('tp_image') || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('tp_theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('tp_sales', JSON.stringify(sales));
    localStorage.setItem('tp_truffles', JSON.stringify(truffles));
    localStorage.setItem('tp_name', userName);
    localStorage.setItem('tp_image', userImage);
    localStorage.setItem('tp_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [sales, truffles, userName, userImage, isDarkMode]);

  const handleAddSale = (sale: Sale) => {
    setSales([sale, ...sales]);
    setView(View.HISTORY);
  };

  const handleSaveTruffle = (truffle: Truffle) => {
    setTruffles(prev => {
      const idx = prev.findIndex(t => t.id === truffle.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = truffle;
        return next;
      }
      return [truffle, ...prev];
    });
  };

  const renderContent = () => {
    switch (view) {
      case View.DASHBOARD:
        return <Dashboard sales={sales} userName={userName} userImage={userImage} onUpdateName={setUserName} onUpdateImage={setUserImage} />;
      case View.HISTORY:
        return <SalesHistory sales={sales} truffles={truffles} onDeleteSale={id => setSales(sales.filter(s => s.id !== id))} onUpdateSale={s => setSales(sales.map(x => x.id === s.id ? s : x))} />;
      case View.CATALOG:
        return <Catalog truffles={truffles} onSave={handleSaveTruffle} onDelete={id => setTruffles(truffles.filter(t => t.id !== id))} />;
      case View.LOGISTICS:
        return <PDVList pdvs={MOCK_PDVS} sales={sales} onNavigate={setView} />;
      case View.PDV_DETAILS:
        return <PDVDetails pdvs={MOCK_PDVS} sales={sales} onBack={() => setView(View.LOGISTICS)} />;
      case View.CITY_DETAILS:
        return <CityDetails pdvs={MOCK_PDVS} sales={sales} onBack={() => setView(View.LOGISTICS)} />;
      case View.REGISTER_SALE:
        return <RegisterSale truffles={truffles} type="Rua" onAddSale={handleAddSale} onCancel={() => setView(View.DASHBOARD)} />;
      case View.SETTINGS:
        return <Settings isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />;
      default:
        return <Dashboard sales={sales} userName={userName} userImage={userImage} onUpdateName={setUserName} onUpdateImage={setUserImage} />;
    }
  };

  const isMainView = [View.DASHBOARD, View.HISTORY, View.CATALOG, View.LOGISTICS, View.SETTINGS].includes(view);

  return (
    <div className="max-w-md mx-auto min-h-screen relative flex flex-col bg-background-light dark:bg-background-dark transition-colors">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      {isMainView && (
        <>
          <button 
            onClick={() => setView(view === View.LOGISTICS ? View.REGISTER_SALE : View.REGISTER_SALE)}
            className="fixed bottom-24 right-6 size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce-short z-[40] active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>

          <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 flex items-center justify-around z-50 px-2">
            <button onClick={() => setView(View.DASHBOARD)} className={`flex flex-col items-center gap-1 w-full ${view === View.DASHBOARD ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`material-symbols-outlined ${view === View.DASHBOARD ? 'material-symbols-filled' : ''}`}>dashboard</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Início</span>
            </button>
            <button onClick={() => setView(View.HISTORY)} className={`flex flex-col items-center gap-1 w-full ${view === View.HISTORY ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`material-symbols-outlined ${view === View.HISTORY ? 'material-symbols-filled' : ''}`}>receipt_long</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Vendas</span>
            </button>
            <button onClick={() => setView(View.CATALOG)} className={`flex flex-col items-center gap-1 w-full ${view === View.CATALOG ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`material-symbols-outlined ${view === View.CATALOG ? 'material-symbols-filled' : ''}`}>inventory_2</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Menu</span>
            </button>
            <button onClick={() => setView(View.LOGISTICS)} className={`flex flex-col items-center gap-1 w-full ${[View.LOGISTICS, View.PDV_DETAILS, View.CITY_DETAILS].includes(view) ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`material-symbols-outlined ${[View.LOGISTICS, View.PDV_DETAILS, View.CITY_DETAILS].includes(view) ? 'material-symbols-filled' : ''}`}>map</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Rotas</span>
            </button>
            <button onClick={() => setView(View.SETTINGS)} className={`flex flex-col items-center gap-1 w-full ${view === View.SETTINGS ? 'text-primary' : 'text-gray-400'}`}>
              <span className={`material-symbols-outlined ${view === View.SETTINGS ? 'material-symbols-filled' : ''}`}>settings</span>
              <span className="text-[8px] font-bold uppercase tracking-widest">Ajustes</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

export default App;