
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
import RegisterPDV from './components/RegisterPDV';
import InstallPrompt from './components/InstallPrompt';
import LoginScreen from './components/LoginScreen';

const MOCK_TRUFFLES: Truffle[] = [
  { id: '1', name: 'Trufa Tradicional', flavor: 'Chocolate ao Leite', priceStreet: 3.0, pricePDV: 3.5, icon: 'cookie' },
  { id: '2', name: 'Trufa Gourmet', flavor: 'Ninho com Nutella', priceStreet: 5.0, pricePDV: 6.0, icon: 'cake' },
  { id: '3', name: 'Trufa Frutada', flavor: 'Maracujá', priceStreet: 3.5, pricePDV: 4.0, icon: 'nutrition' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('tp_auth') === 'true');
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('tp_sales') || '[]'));
  const [truffles, setTruffles] = useState<Truffle[]>(() => JSON.parse(localStorage.getItem('tp_truffles') || JSON.stringify(MOCK_TRUFFLES)));
  const [pdvs, setPdvs] = useState<PDV[]>(() => JSON.parse(localStorage.getItem('tp_pdvs') || '[]'));
  
  const [userName, setUserName] = useState(() => localStorage.getItem('tp_name') || 'Usuário');
  const [userImage, setUserImage] = useState(() => localStorage.getItem('tp_image') || '');
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('tp_theme') === 'dark');
  const [activePDVForSale, setActivePDVForSale] = useState<PDV | null>(null);
  const [selectedPDVForDetails, setSelectedPDVForDetails] = useState<PDV | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  useEffect(() => {
    localStorage.setItem('tp_sales', JSON.stringify(sales));
    localStorage.setItem('tp_truffles', JSON.stringify(truffles));
    localStorage.setItem('tp_pdvs', JSON.stringify(pdvs));
    localStorage.setItem('tp_name', userName);
    localStorage.setItem('tp_image', userImage);
    localStorage.setItem('tp_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [sales, truffles, pdvs, userName, userImage, isDarkMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('tp_auth', 'true');
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente encerrar sua sessão?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('tp_auth');
      setView(View.DASHBOARD);
    }
  };

  const handleAddSale = (sale: Sale) => {
    setSales([sale, ...sales]);
    setActivePDVForSale(null);
    setView(View.HISTORY);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    setEditingSale(null);
    setView(View.HISTORY);
  };

  const handleAddPDV = (pdv: PDV) => {
    setPdvs([pdv, ...pdvs]);
    // Navega direto para os detalhes do PDV recém-criado para dar a "opção" solicitada
    setSelectedPDVForDetails(pdv);
    setView(View.PDV_DETAILS);
  };

  const handleDeletePDV = (id: string) => {
    setPdvs(prev => prev.filter(p => p.id !== id));
    if (activePDVForSale?.id === id) setActivePDVForSale(null);
    if (selectedPDVForDetails?.id === id) setSelectedPDVForDetails(null);
    return true;
  };

  const handleStartStreetSale = () => {
    setActivePDVForSale(null);
    setView(View.REGISTER_SALE);
  };

  const startEditingSale = (sale: Sale) => {
    setEditingSale(sale);
    setView(View.EDIT_SALE);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
      case View.DASHBOARD:
        return (
          <Dashboard 
            sales={sales} 
            pdvs={pdvs} 
            userName={userName} 
            userImage={userImage} 
            onUpdateName={setUserName} 
            onUpdateImage={setUserImage} 
            onStartStreetSale={handleStartStreetSale}
          />
        );
      case View.HISTORY:
        return (
          <SalesHistory 
            sales={sales} 
            truffles={truffles} 
            onDeleteSale={id => setSales(sales.filter(s => s.id !== id))} 
            onUpdateSale={handleUpdateSale} 
            onRegisterStreetSale={handleStartStreetSale}
            onEditSale={startEditingSale}
          />
        );
      case View.CATALOG:
        return <Catalog truffles={truffles} onSave={t => setTruffles(prev => prev.some(x => x.id === t.id) ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev])} onDelete={id => setTruffles(truffles.filter(t => t.id !== id))} onBack={() => setView(View.SETTINGS)} />;
      case View.LOGISTICS:
        return <PDVList pdvs={pdvs} sales={sales} onNavigate={setView} onSelectPDVForSale={(pdv) => { setActivePDVForSale(pdv); setView(View.REGISTER_SALE); }} onShowPDVHistory={(pdv) => { setSelectedPDVForDetails(pdv); setView(View.PDV_DETAILS); }} onDeletePDV={handleDeletePDV} />;
      case View.REGISTER_PDV:
        return <RegisterPDV onAdd={handleAddPDV} onCancel={() => setView(View.LOGISTICS)} />;
      case View.REGISTER_SALE:
        return <RegisterSale sales={sales} truffles={truffles} type={activePDVForSale ? 'PDV' : 'Rua'} preSelectedPDV={activePDVForSale} onAddSale={handleAddSale} onDeletePDV={handleDeletePDV} onCancel={() => { setActivePDVForSale(null); setView(activePDVForSale ? View.LOGISTICS : View.HISTORY); }} />;
      case View.EDIT_SALE:
        return (
          <RegisterSale 
            sales={sales} 
            truffles={truffles} 
            type={editingSale?.type || 'Rua'} 
            initialSale={editingSale}
            onAddSale={handleUpdateSale} 
            onCancel={() => { setEditingSale(null); setView(View.HISTORY); }} 
          />
        );
      case View.PDV_DETAILS:
        return (
          <PDVDetails 
            pdv={selectedPDVForDetails} 
            truffles={truffles} 
            sales={sales} 
            onBack={() => { setSelectedPDVForDetails(null); setView(View.LOGISTICS); }} 
            onSelectPDVForSale={(pdv) => { setActivePDVForSale(pdv); setView(View.REGISTER_SALE); }} 
            onEditSale={startEditingSale}
          />
        );
      case View.CITY_DETAILS:
        return <CityDetails pdvs={pdvs} sales={sales} onBack={() => setView(View.LOGISTICS)} />;
      case View.SETTINGS:
        return <Settings isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} userName={userName} userImage={userImage} onUpdateName={setUserName} onUpdateImage={setUserImage} onLogout={handleLogout} onNavigateCatalog={() => setView(View.CATALOG)} />;
      default:
        return <Dashboard sales={sales} pdvs={pdvs} userName={userName} userImage={userImage} onUpdateName={setUserName} onUpdateImage={setUserImage} onStartStreetSale={handleStartStreetSale} />;
    }
  };

  const isMainView = [View.DASHBOARD, View.HISTORY, View.LOGISTICS, View.REGISTER_PDV, View.SETTINGS].includes(view);

  return (
    <div className="mx-auto min-h-screen relative flex flex-col bg-background-light dark:bg-background-dark transition-colors w-full max-w-md">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      <InstallPrompt />

      {isMainView && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-surface-light/40 dark:bg-surface-dark/80 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 flex items-center justify-around z-50 px-2 pb-[env(safe-area-inset-bottom)]">
          <button onClick={() => setView(View.DASHBOARD)} className={`flex flex-col items-center gap-1 w-full ${view === View.DASHBOARD ? 'text-primary' : 'text-text-sub-light'}`}>
            <span className={`material-symbols-outlined ${view === View.DASHBOARD ? 'material-symbols-filled' : ''}`}>dashboard</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">Início</span>
          </button>
          
          <button onClick={() => setView(View.LOGISTICS)} className={`flex flex-col items-center gap-1 w-full ${view === View.LOGISTICS ? 'text-primary' : 'text-text-sub-light'}`}>
            <span className={`material-symbols-outlined ${view === View.LOGISTICS ? 'material-symbols-filled' : ''}`}>storefront</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">PDVs</span>
          </button>

          <button onClick={() => setView(View.REGISTER_PDV)} className={`flex flex-col items-center gap-1 w-full ${view === View.REGISTER_PDV ? 'text-primary' : 'text-text-sub-light'}`}>
            <span className={`material-symbols-outlined ${view === View.REGISTER_PDV ? 'material-symbols-filled' : ''}`}>add_business</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">Cadastrar</span>
          </button>

          <button onClick={() => setView(View.HISTORY)} className={`flex flex-col items-center gap-1 w-full ${view === View.HISTORY ? 'text-primary' : 'text-text-sub-light'}`}>
            <span className={`material-symbols-outlined ${view === View.HISTORY ? 'material-symbols-filled' : ''}`}>receipt_long</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">Histórico</span>
          </button>

          <button onClick={() => setView(View.SETTINGS)} className={`flex flex-col items-center gap-1 w-full ${view === View.SETTINGS ? 'text-primary' : 'text-text-sub-light'}`}>
            <span className={`material-symbols-outlined ${view === View.SETTINGS ? 'material-symbols-filled' : ''}`}>settings</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">Ajustes</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
