export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export enum DeliveryMethod {
  OWL = 'Owl Post',
  DRAGON = 'Dragon Express',
  TELEPORT = 'Magical Teleport',
  COURIER = 'Wizard Courier',
  PICKUP = 'Shop Pickup'
}

export enum PaymentMethod {
  GOLD_COINS = 'Gold Coins',
  SILVER_COINS = 'Silver Coins',
  MAGICAL_TRANSFER = 'Magical Transfer',
  CREDIT_SPELL = 'Credit Spell',
  BARTER = 'Barter'
}

export interface Potion {
  id: string;
  potionNumber: string;
  orderedBy: string;
  orderDate: Date;
  readyDate: Date;
  deliveryAddress: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  ingredients: Ingredient[];
  totalCost: number;
  status?: 'brewing' | 'ready' | 'delivered';
}
