import { TestBed } from '@angular/core/testing';
import { PotionService } from './potion.service';
import { Potion, DeliveryMethod, PaymentMethod, Ingredient } from '../models/potion.model';

describe('PotionService', () => {
  let service: PotionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PotionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty potions array', () => {
    expect(service.potions()).toEqual([]);
    expect(service.potionsCount()).toBe(0);
  });

  describe('addPotion', () => {
    it('should add a new potion to the list', () => {
      const ingredient: Ingredient = {
        id: 'ing1',
        name: 'Dragon Scale',
        quantity: 2,
        unit: 'g',
        pricePerUnit: 50,
        totalPrice: 100
      };

      const potion: Potion = {
        id: 'pot1',
        potionNumber: 'POT-2026-0001',
        orderedBy: 'Merlin',
        orderDate: new Date(),
        readyDate: new Date(),
        deliveryAddress: 'Tower of Magic',
        deliveryMethod: DeliveryMethod.OWL,
        paymentMethod: PaymentMethod.GOLD_COINS,
        ingredients: [ingredient],
        totalCost: 100,
        status: 'brewing'
      };

      service.addPotion(potion);

      expect(service.potions().length).toBe(1);
      expect(service.potionsCount()).toBe(1);
      expect(service.potions()[0]).toEqual(potion);
    });

    it('should add multiple potions', () => {
      const potion1: Potion = createTestPotion('pot1', 'POT-2026-0001');
      const potion2: Potion = createTestPotion('pot2', 'POT-2026-0002');

      service.addPotion(potion1);
      service.addPotion(potion2);

      expect(service.potionsCount()).toBe(2);
    });
  });

  describe('updatePotion', () => {
    it('should update an existing potion', () => {
      const potion = createTestPotion('pot1', 'POT-2026-0001');
      service.addPotion(potion);

      const updatedPotion = { ...potion, orderedBy: 'Gandalf' };
      service.updatePotion('pot1', updatedPotion);

      expect(service.potions()[0].orderedBy).toBe('Gandalf');
    });

    it('should not affect other potions when updating one', () => {
      const potion1 = createTestPotion('pot1', 'POT-2026-0001');
      const potion2 = createTestPotion('pot2', 'POT-2026-0002');
      
      service.addPotion(potion1);
      service.addPotion(potion2);

      const updatedPotion1 = { ...potion1, orderedBy: 'Gandalf' };
      service.updatePotion('pot1', updatedPotion1);

      expect(service.potions()[0].orderedBy).toBe('Gandalf');
      expect(service.potions()[1].orderedBy).toBe('Merlin');
    });
  });

  describe('deletePotion', () => {
    it('should remove a potion from the list', () => {
      const potion = createTestPotion('pot1', 'POT-2026-0001');
      service.addPotion(potion);

      expect(service.potionsCount()).toBe(1);

      service.deletePotion('pot1');

      expect(service.potionsCount()).toBe(0);
      expect(service.potions()).toEqual([]);
    });

    it('should only remove the specified potion', () => {
      const potion1 = createTestPotion('pot1', 'POT-2026-0001');
      const potion2 = createTestPotion('pot2', 'POT-2026-0002');
      
      service.addPotion(potion1);
      service.addPotion(potion2);

      service.deletePotion('pot1');

      expect(service.potionsCount()).toBe(1);
      expect(service.potions()[0].id).toBe('pot2');
    });
  });

  describe('getPotionById', () => {
    it('should return the correct potion by id', () => {
      const potion = createTestPotion('pot1', 'POT-2026-0001');
      service.addPotion(potion);

      const found = service.getPotionById('pot1');

      expect(found).toBeDefined();
      expect(found?.id).toBe('pot1');
    });

    it('should return undefined for non-existent id', () => {
      const found = service.getPotionById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('generatePotionNumber', () => {
    it('should generate potion number with correct format', () => {
      const potionNumber = service.generatePotionNumber();
      const year = new Date().getFullYear();
      
      expect(potionNumber).toMatch(new RegExp(`POT-${year}-\\d{4}`));
    });

    it('should increment potion number based on count', () => {
      const number1 = service.generatePotionNumber();
      expect(number1).toContain('0001');

      service.addPotion(createTestPotion('pot1', number1));
      
      const number2 = service.generatePotionNumber();
      expect(number2).toContain('0002');
    });
  });
});

function createTestPotion(id: string, potionNumber: string): Potion {
  const ingredient: Ingredient = {
    id: 'ing1',
    name: 'Dragon Scale',
    quantity: 2,
    unit: 'g',
    pricePerUnit: 50,
    totalPrice: 100
  };

  return {
    id,
    potionNumber,
    orderedBy: 'Merlin',
    orderDate: new Date(),
    readyDate: new Date(),
    deliveryAddress: 'Tower of Magic',
    deliveryMethod: DeliveryMethod.OWL,
    paymentMethod: PaymentMethod.GOLD_COINS,
    ingredients: [ingredient],
    totalCost: 100,
    status: 'brewing'
  };
}
