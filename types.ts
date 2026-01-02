
// Definindo os tipos básicos para o sistema Trufa Pro

export type PaymentMethod = 'PIX' | 'DINHEIRO';

export interface SaleItem {
  truffleId: string;
  quantity: number;
  consignedQuantity?: number;
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
}

export interface Truffle {
  id: string;
  flavor: string;
  priceStreet: number;
  pricePDV: number;
  icon: string;
  imageUrl?: string;
}

export interface PDV {
  id: string;
  name: string;
  city: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  CATALOG = 'CATALOG',
  REGISTER_SALE = 'REGISTER_SALE',
  HISTORY = 'HISTORY',
  LOGISTICS = 'LOGISTICS',
  SETTINGS = 'SETTINGS',
  PDV_DETAILS = 'PDV_DETAILS',
  CITY_DETAILS = 'CITY_DETAILS'
}
