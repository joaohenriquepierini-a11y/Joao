
import React from 'react';
import { PDV, Sale } from '../types';

interface Props {
  pdvs: PDV[];
  sales: Sale[];
  onBack: () => void;
}

const CityDetails: React.FC<Props> = ({ pdvs, sales, onBack }) => {
  const cities = Array.from(new Set(pdvs.map(p => p.city)));
  
  const cityMetrics = cities.map(city => {
    const cityPdvs = pdvs.filter(p => p.city === city);
    const citySales = sales.filter(s => s.city === city);
    const totalRevenue = citySales.reduce((acc, curr) => acc + curr.total, 0);
    
    return {
      name: city,
      pdvCount: cityPdvs.length,
      revenue: totalRevenue,
      salesCount: citySales.length
    };
  }).sort((a, b) => b.pdvCount - a.pdvCount);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 h-20 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark shadow-sm text-gray-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Métricas por Cidade</h2>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Densidade de PDVs</span>
        </div>
        <div className="size-11"></div>
      </header>

      <div className="p-6 flex flex-col gap-4">
        {cityMetrics.map(city => (
          <div key={city.name} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">location_city</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white italic tracking-tighter">{city.name}</h3>
              </div>
              <div className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl">
                 <p className="text-[10px] font-black text-gray-400 uppercase leading-none">PDVs</p>
                 <p className="text-xl font-black text-gray-900 dark:text-white">{city.pdvCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vendas Totais</p>
                <p className="text-lg font-black text-primary">R$ {city.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Visitas Realizadas</p>
                <p className="text-lg font-black text-gray-700 dark:text-gray-300">{city.salesCount}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
                <span>Concentração da Rota</span>
                <span>{Math.round((city.pdvCount / pdvs.length) * 100)}% do total</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(city.pdvCount / pdvs.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityDetails;
