import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngredientTableComponent } from './ingredient-table.component';
import { Ingredient } from '../../models/potion.model';

describe('IngredientTableComponent', () => {
  let component: IngredientTableComponent;
  let fixture: ComponentFixture<IngredientTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty ingredients', () => {
    expect(component.ingredients()).toEqual([]);
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should implement writeValue', () => {
      const testIngredients: Ingredient[] = [
        {
          id: 'ing1',
          name: 'Dragon Scale',
          quantity: 2,
          unit: 'g',
          pricePerUnit: 50,
          totalPrice: 100
        }
      ];

      component.writeValue(testIngredients);
      expect(component.ingredients()).toEqual(testIngredients);
    });

    it('should call onChange when ingredients are updated', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.addIngredient();

      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('should call onTouched when ingredients are updated', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.addIngredient();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled()).toBe(true);

      component.setDisabledState(false);
      expect(component.disabled()).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should return error when less than 3 ingredients', () => {
      const errors = component.validate(null as any);
      
      expect(errors).toBeTruthy();
      expect(errors?.['minIngredients']).toBeDefined();
      expect(errors?.['minIngredients'].min).toBe(3);
    });

    it('should return null when 3 or more valid ingredients', () => {
      const ingredients: Ingredient[] = [
        { id: 'ing1', name: 'Dragon Scale', quantity: 2, unit: 'g', pricePerUnit: 50, totalPrice: 100 },
        { id: 'ing2', name: 'Phoenix Feather', quantity: 1, unit: 'pcs', pricePerUnit: 100, totalPrice: 100 },
        { id: 'ing3', name: 'Unicorn Hair', quantity: 3, unit: 'g', pricePerUnit: 75, totalPrice: 225 }
      ];

      component.writeValue(ingredients);
      const errors = component.validate(null as any);

      expect(errors).toBeNull();
    });

    it('should return error when ingredient has invalid data', () => {
      const ingredients: Ingredient[] = [
        { id: 'ing1', name: '', quantity: 0, unit: 'g', pricePerUnit: 50, totalPrice: 0 },
        { id: 'ing2', name: 'Phoenix Feather', quantity: 1, unit: 'pcs', pricePerUnit: 100, totalPrice: 100 },
        { id: 'ing3', name: 'Unicorn Hair', quantity: 3, unit: 'g', pricePerUnit: 75, totalPrice: 225 }
      ];

      component.writeValue(ingredients);
      const errors = component.validate(null as any);

      expect(errors).toBeTruthy();
      expect(errors?.['invalidIngredient']).toBe(true);
    });
  });

  describe('addIngredient', () => {
    it('should add a new ingredient with default values', () => {
      component.addIngredient();

      expect(component.ingredients().length).toBe(1);
      expect(component.ingredients()[0].name).toBe('');
      expect(component.ingredients()[0].quantity).toBe(0);
      expect(component.ingredients()[0].unit).toBe('g');
    });

    it('should generate unique IDs for each ingredient', () => {
      component.addIngredient();
      component.addIngredient();

      const ids = component.ingredients().map(ing => ing.id);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  describe('removeIngredient', () => {
    it('should remove ingredient by id', () => {
      component.addIngredient();
      const ingredientId = component.ingredients()[0].id;

      component.removeIngredient(ingredientId);

      expect(component.ingredients().length).toBe(0);
    });

    it('should only remove the specified ingredient', () => {
      component.addIngredient();
      component.addIngredient();
      const firstId = component.ingredients()[0].id;

      component.removeIngredient(firstId);

      expect(component.ingredients().length).toBe(1);
      expect(component.ingredients()[0].id).not.toBe(firstId);
    });
  });

  describe('updateIngredient', () => {
    beforeEach(() => {
      component.addIngredient();
    });

    it('should update ingredient name', () => {
      const ingredientId = component.ingredients()[0].id;
      
      component.updateIngredient(ingredientId, 'name', 'Dragon Scale');

      expect(component.ingredients()[0].name).toBe('Dragon Scale');
    });

    it('should recalculate total price when quantity changes', () => {
      const ingredientId = component.ingredients()[0].id;
      
      component.updateIngredient(ingredientId, 'pricePerUnit', 50);
      component.updateIngredient(ingredientId, 'quantity', 2);

      expect(component.ingredients()[0].totalPrice).toBe(100);
    });

    it('should recalculate total price when pricePerUnit changes', () => {
      const ingredientId = component.ingredients()[0].id;
      
      component.updateIngredient(ingredientId, 'quantity', 3);
      component.updateIngredient(ingredientId, 'pricePerUnit', 25);

      expect(component.ingredients()[0].totalPrice).toBe(75);
    });
  });

  describe('getTotalCost', () => {
    it('should return 0 for empty ingredients', () => {
      expect(component.getTotalCost()).toBe(0);
    });

    it('should calculate total cost correctly', () => {
      const ingredients: Ingredient[] = [
        { id: 'ing1', name: 'Dragon Scale', quantity: 2, unit: 'g', pricePerUnit: 50, totalPrice: 100 },
        { id: 'ing2', name: 'Phoenix Feather', quantity: 1, unit: 'pcs', pricePerUnit: 100, totalPrice: 100 }
      ];

      component.writeValue(ingredients);

      expect(component.getTotalCost()).toBe(200);
    });
  });
});
