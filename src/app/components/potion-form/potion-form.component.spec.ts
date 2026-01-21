import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PotionFormComponent } from './potion-form.component';
import { PotionService } from '../../services/potion.service';
import { MessageService } from 'primeng/api';
import { DeliveryMethod, PaymentMethod } from '../../models/potion.model';

describe('PotionFormComponent', () => {
  let component: PotionFormComponent;
  let fixture: ComponentFixture<PotionFormComponent>;
  let potionService: jasmine.SpyObj<PotionService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const potionServiceSpy = jasmine.createSpyObj('PotionService', [
      'addPotion',
      'generatePotionNumber'
    ]);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    potionServiceSpy.generatePotionNumber.and.returnValue('POT-2026-0001');

    await TestBed.configureTestingModule({
      imports: [PotionFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PotionService, useValue: potionServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PotionFormComponent);
    component = fixture.componentInstance;
    potionService = TestBed.inject(PotionService) as jasmine.SpyObj<PotionService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.potionForm).toBeDefined();
      expect(component.potionForm.get('potionNumber')?.value).toBe('POT-2026-0001');
      expect(component.potionForm.get('orderDate')?.value).toBeInstanceOf(Date);
      expect(component.potionForm.get('deliveryMethod')?.value).toBe(DeliveryMethod.OWL);
      expect(component.potionForm.get('paymentMethod')?.value).toBe(PaymentMethod.GOLD_COINS);
    });

    it('should disable potionNumber and orderDate fields', () => {
      expect(component.potionForm.get('potionNumber')?.disabled).toBe(true);
      expect(component.potionForm.get('orderDate')?.disabled).toBe(true);
    });

    it('should set readyDate to tomorrow by default', () => {
      const readyDate = component.potionForm.get('readyDate')?.value as Date;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(readyDate.getDate()).toBe(tomorrow.getDate());
    });
  });

  describe('Form Validation', () => {
    it('should mark orderedBy as required', () => {
      const orderedBy = component.potionForm.get('orderedBy');
      orderedBy?.setValue('');
      
      expect(orderedBy?.hasError('required')).toBe(true);
    });

    it('should validate orderedBy minimum length', () => {
      const orderedBy = component.potionForm.get('orderedBy');
      orderedBy?.setValue('A');
      
      expect(orderedBy?.hasError('minlength')).toBe(true);
    });

    it('should validate deliveryAddress as required', () => {
      const deliveryAddress = component.potionForm.get('deliveryAddress');
      deliveryAddress?.setValue('');
      
      expect(deliveryAddress?.hasError('required')).toBe(true);
    });

    it('should validate ingredients as required', () => {
      const ingredients = component.potionForm.get('ingredients');
      ingredients?.setValue([]);
      
      expect(ingredients?.hasError('required')).toBe(true);
    });

    it('should validate readyDate is in future', () => {
      const readyDate = component.potionForm.get('readyDate');
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      readyDate?.setValue(pastDate);
      readyDate?.updateValueAndValidity();
      
      expect(readyDate?.hasError('pastDate')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.potionForm.patchValue({
        orderedBy: 'Merlin the Wise',
        readyDate: new Date(Date.now() + 86400000),
        deliveryAddress: 'Tower of Magic, Enchanted Forest',
        deliveryMethod: DeliveryMethod.DRAGON,
        paymentMethod: PaymentMethod.GOLD_COINS,
        ingredients: [
          { id: 'ing1', name: 'Dragon Scale', quantity: 2, unit: 'g', pricePerUnit: 50, totalPrice: 100 },
          { id: 'ing2', name: 'Phoenix Feather', quantity: 1, unit: 'pcs', pricePerUnit: 100, totalPrice: 100 },
          { id: 'ing3', name: 'Unicorn Hair', quantity: 3, unit: 'g', pricePerUnit: 75, totalPrice: 225 }
        ]
      });
    });

    it('should submit form when valid', () => {
      component.onSubmit();

      expect(potionService.addPotion).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success'
        })
      );
    });

    it('should not submit form when invalid', () => {
      component.potionForm.patchValue({
        orderedBy: ''
      });

      component.onSubmit();

      expect(potionService.addPotion).not.toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error'
        })
      );
    });

    it('should reset form after successful submission', () => {
      const initialPotionNumber = component.potionForm.get('potionNumber')?.value;
      
      component.onSubmit();

      expect(component.submitted()).toBe(false);
      expect(component.potionForm.get('orderedBy')?.value).toBe('');
    });

    it('should calculate total cost correctly', () => {
      component.onSubmit();

      const addedPotion = potionService.addPotion.calls.mostRecent().args[0];
      expect(addedPotion.totalCost).toBe(425);
    });
  });

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      component.potionForm.patchValue({
        orderedBy: 'Test Wizard'
      });
      component.submitted.set(true);

      component.resetForm();

      expect(component.submitted()).toBe(false);
      expect(component.potionForm.get('orderedBy')?.value).toBe('');
    });
  });

  describe('Field Validation Helpers', () => {
    it('should correctly identify invalid fields', () => {
      const orderedBy = component.potionForm.get('orderedBy');
      orderedBy?.setValue('');
      orderedBy?.markAsTouched();

      expect(component.isFieldInvalid('orderedBy')).toBe(true);
    });

    it('should return appropriate error messages', () => {
      const orderedBy = component.potionForm.get('orderedBy');
      orderedBy?.setValue('');
      orderedBy?.markAsTouched();

      const error = component.getFieldError('orderedBy');
      expect(error).toContain('required');
    });
  });

  describe('Delivery and Payment Methods', () => {
    it('should have all delivery methods available', () => {
      expect(component.deliveryMethods.length).toBe(5);
      expect(component.deliveryMethods.some(m => m.value === DeliveryMethod.OWL)).toBe(true);
      expect(component.deliveryMethods.some(m => m.value === DeliveryMethod.DRAGON)).toBe(true);
    });

    it('should have all payment methods available', () => {
      expect(component.paymentMethods.length).toBe(5);
      expect(component.paymentMethods.some(m => m.value === PaymentMethod.GOLD_COINS)).toBe(true);
      expect(component.paymentMethods.some(m => m.value === PaymentMethod.MAGICAL_TRANSFER)).toBe(true);
    });
  });
});
