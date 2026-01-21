import { Component, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, Validator, AbstractControl, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/potion.model';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-ingredient-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Button,
    InputText,
    InputNumber,
    Select
  ],
  templateUrl: './ingredient-table.component.html',
  styleUrls: ['./ingredient-table.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IngredientTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IngredientTableComponent),
      multi: true
    }
  ]
})
export class IngredientTableComponent implements ControlValueAccessor, Validator {
  ingredients = signal<Ingredient[]>([]);
  disabled = signal(false);

  availableUnits = [
    { label: 'grams (g)', value: 'g' },
    { label: 'milliliters (ml)', value: 'ml' },
    { label: 'pieces (pcs)', value: 'pcs' },
    { label: 'drops', value: 'drops' },
    { label: 'pinch', value: 'pinch' }
  ];

  private onChange: (value: Ingredient[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: Ingredient[]): void {
    if (value) {
      this.ingredients.set(value);
    }
  }

  registerOnChange(fn: (value: Ingredient[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const ingredients = this.ingredients();
    
    if (!ingredients || ingredients.length < 3) {
      return { minIngredients: { min: 3, actual: ingredients?.length || 0 } };
    }

    const hasInvalidIngredient = ingredients.some(ing => 
      !ing.name || 
      !ing.quantity || 
      ing.quantity <= 0 || 
      !ing.pricePerUnit || 
      ing.pricePerUnit <= 0 ||
      !ing.unit
    );

    if (hasInvalidIngredient) {
      return { invalidIngredient: true };
    }

    return null;
  }

  addIngredient(): void {
    const newIngredient: Ingredient = {
      id: this.generateId(),
      name: '',
      quantity: 0,
      unit: 'g',
      pricePerUnit: 0,
      totalPrice: 0
    };

    const updated = [...this.ingredients(), newIngredient];
    this.ingredients.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  removeIngredient(id: string): void {
    const updated = this.ingredients().filter(ing => ing.id !== id);
    this.ingredients.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  updateIngredient(id: string, field: keyof Ingredient, value: any): void {
    const updated = this.ingredients().map(ing => {
      if (ing.id === id) {
        const updatedIng = { ...ing, [field]: value };
        
        if (field === 'quantity' || field === 'pricePerUnit') {
          updatedIng.totalPrice = updatedIng.quantity * updatedIng.pricePerUnit;
        }
        
        return updatedIng;
      }
      return ing;
    });

    this.ingredients.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  onIngredientChange(): void {
    const current = this.ingredients();
    this.onChange(current);
    this.onTouched();
  }

  getTotalCost(): number {
    return this.ingredients().reduce((sum, ing) => sum + ing.totalPrice, 0);
  }

  trackByIngredientId(index: number, ingredient: Ingredient): string {
    return ingredient.id;
  }

  private generateId(): string {
    return `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
