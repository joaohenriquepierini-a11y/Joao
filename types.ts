
// Tipagem atualizada para Trufa Pro - Consignação Master

export type PaymentMethod = 'PIX' | 'DINHEIRO';

export interface SaleItem {
  truffleId: string;
  quantity: number; // Quantidade Vendida/Paga no dia
  leftOverQuantity?: number; // O que sobrou do estoque anterior
  newConsignedQuantity?: number; // O novo estoque deixado hoje
}

export interface Sale {
  id: string;
  date: string;
  timestamp: number;
  city: string;
  location: string;
  type: 'Rua' | 'PDV';
  paymentMethod: PaymentMethod;
  items: SaleItem[];
  total: number;
  ownerName?: string;
  observation?: string;
}

export interface Truffle {
  id: string;
  name: string;
  flavor: string;
  priceStreet: number;
  pricePDV: number;
  icon: string;
  imageUrl?: string;
}

export interface PDV {
  id: string;
  companyName: string;
  contactName: string;
  city: string;
  phone?: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  CATALOG = 'CATALOG',
  REGISTER_SALE = 'REGISTER_SALE',
  HISTORY = 'HISTORY',
  LOGISTICS = 'LOGISTICS', 
  SETTINGS = 'SETTINGS',
  PDV_DETAILS = 'PDV_DETAILS',
  CITY_DETAILS = 'CITY_DETAILS',
  REGISTER_PDV = 'REGISTER_PDV'
}
