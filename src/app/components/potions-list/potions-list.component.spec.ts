import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PotionsListComponent } from './potions-list.component';
import { PotionService } from '../../services/potion.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';
import { Potion, DeliveryMethod, PaymentMethod } from '../../models/potion.model';

describe('PotionsListComponent', () => {
  let component: PotionsListComponent;
  let fixture: ComponentFixture<PotionsListComponent>;
  let potionService: jasmine.SpyObj<PotionService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockPotions: Potion[] = [
    {
      id: 'pot1',
      potionNumber: 'POT-2026-0001',
      orderedBy: 'Merlin',
      orderDate: new Date('2026-01-15'),
      readyDate: new Date('2026-01-20'),
      deliveryAddress: 'Tower of Magic',
      deliveryMethod: DeliveryMethod.OWL,
      paymentMethod: PaymentMethod.GOLD_COINS,
      ingredients: [
        { id: 'ing1', name: 'Dragon Scale', quantity: 2, unit: 'g', pricePerUnit: 50, totalPrice: 100 }
      ],
      totalCost: 100,
      status: 'brewing'
    },
    {
      id: 'pot2',
      potionNumber: 'POT-2026-0002',
      orderedBy: 'Gandalf',
      orderDate: new Date('2026-01-16'),
      readyDate: new Date('2026-01-21'),
      deliveryAddress: 'Shire',
      deliveryMethod: DeliveryMethod.DRAGON,
      paymentMethod: PaymentMethod.SILVER_COINS,
      ingredients: [
        { id: 'ing2', name: 'Phoenix Feather', quantity: 1, unit: 'pcs', pricePerUnit: 100, totalPrice: 100 }
      ],
      totalCost: 100,
      status: 'ready'
    }
  ];

  beforeEach(async () => {
    const potionServiceSpy = jasmine.createSpyObj('PotionService', ['deletePotion'], {
      potions: signal(mockPotions),
      potionsCount: signal(mockPotions.length)
    });
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [PotionsListComponent],
      providers: [
        { provide: PotionService, useValue: potionServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PotionsListComponent);
    component = fixture.componentInstance;
    potionService = TestBed.inject(PotionService) as jasmine.SpyObj<PotionService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    confirmationService = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Display Potions', () => {
    it('should display potions from service', () => {
      expect(component.potions()).toEqual(mockPotions);
      expect(component.potionsCount()).toBe(2);
    });
  });

  describe('viewDetails', () => {
    it('should set selected potion and show dialog', () => {
      component.viewDetails(mockPotions[0]);

      expect(component.selectedPotion()).toEqual(mockPotions[0]);
      expect(component.displayDialog()).toBe(true);
    });
  });

  describe('closeDialog', () => {
    it('should clear selected potion and hide dialog', () => {
      component.selectedPotion.set(mockPotions[0]);
      component.displayDialog.set(true);

      component.closeDialog();

      expect(component.selectedPotion()).toBeNull();
      expect(component.displayDialog()).toBe(false);
    });
  });

  describe('deletePotion', () => {
    it('should show confirmation dialog', () => {
      const event = new Event('click');
      component.deletePotion(mockPotions[0], event);

      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('should delete potion when confirmed', () => {
      const event = new Event('click');
      confirmationService.confirm.and.callFake((options: any) => {
        options.accept();
        return confirmationService;
      });

      component.deletePotion(mockPotions[0], event);

      expect(potionService.deletePotion).toHaveBeenCalledWith('pot1');
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success'
        })
      );
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity for brewing status', () => {
      expect(component.getStatusSeverity('brewing')).toBe('warn');
    });

    it('should return correct severity for ready status', () => {
      expect(component.getStatusSeverity('ready')).toBe('success');
    });

    it('should return correct severity for delivered status', () => {
      expect(component.getStatusSeverity('delivered')).toBe('info');
    });

    it('should return secondary for unknown status', () => {
      expect(component.getStatusSeverity('unknown')).toBe('secondary');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icon for each status', () => {
      expect(component.getStatusIcon('brewing')).toBe('⚗️');
      expect(component.getStatusIcon('ready')).toBe('✅');
      expect(component.getStatusIcon('delivered')).toBe('🚚');
      expect(component.getStatusIcon('unknown')).toBe('📦');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-01-15');
      const formatted = component.formatDate(date);
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('getDeliveryIcon', () => {
    it('should return correct icon for delivery methods', () => {
      expect(component.getDeliveryIcon('Owl Post')).toBe('🦉');
      expect(component.getDeliveryIcon('Dragon Express')).toBe('🐲');
      expect(component.getDeliveryIcon('Magical Teleport')).toBe('✨');
      expect(component.getDeliveryIcon('Wizard Courier')).toBe('🧙');
      expect(component.getDeliveryIcon('Shop Pickup')).toBe('🏪');
    });
  });

  describe('getPaymentIcon', () => {
    it('should return correct icon for payment methods', () => {
      expect(component.getPaymentIcon('Gold Coins')).toBe('💰');
      expect(component.getPaymentIcon('Silver Coins')).toBe('🥈');
      expect(component.getPaymentIcon('Magical Transfer')).toBe('✨');
      expect(component.getPaymentIcon('Credit Spell')).toBe('🔮');
      expect(component.getPaymentIcon('Barter')).toBe('🤝');
    });
  });
});
