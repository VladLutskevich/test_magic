import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PotionService } from '../../services/potion.service';
import { Potion, DeliveryMethod, PaymentMethod, Ingredient } from '../../models/potion.model';
import { IngredientTableComponent } from '../ingredient-table/ingredient-table.component';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-potion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IngredientTableComponent,
    Card,
    InputText,
    DatePicker,
    Select,
    Button,
    Message,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './potion-form.component.html',
  styleUrls: ['./potion-form.component.css']
})
export class PotionFormComponent implements OnInit {
  potionForm!: FormGroup;
  submitted = signal(false);
  minDate = new Date();
  
  deliveryMethods = Object.entries(DeliveryMethod).map(([key, value]) => ({
    label: `${this.getDeliveryIcon(value)} ${value}`,
    value: value
  }));

  paymentMethods = Object.entries(PaymentMethod).map(([key, value]) => ({
    label: `${this.getPaymentIcon(value)} ${value}`,
    value: value
  }));

  constructor(
    private fb: FormBuilder,
    private potionService: PotionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.potionForm = this.fb.group({
      potionNumber: [
        { value: this.potionService.generatePotionNumber(), disabled: true },
        Validators.required
      ],
      orderedBy: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      orderDate: [{ value: new Date(), disabled: true }, Validators.required],
      readyDate: [tomorrow, [Validators.required, this.futureDateValidator.bind(this)]],
      deliveryAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      deliveryMethod: [DeliveryMethod.OWL, Validators.required],
      paymentMethod: [PaymentMethod.GOLD_COINS, Validators.required],
      ingredients: [[], [Validators.required]]
    });
  }

  private futureDateValidator(control: any): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const orderDate = this.potionForm?.get('orderDate')?.value || new Date();
    
    if (selectedDate <= orderDate) {
      return { pastDate: true };
    }
    
    return null;
  }

  onSubmit(): void {
    this.submitted.set(true);
    
    if (this.potionForm.valid) {
      const formValue = this.potionForm.getRawValue();
      const ingredients: Ingredient[] = formValue.ingredients;
      
      const potion: Potion = {
        id: this.generateId(),
        potionNumber: formValue.potionNumber,
        orderedBy: formValue.orderedBy,
        orderDate: formValue.orderDate,
        readyDate: formValue.readyDate,
        deliveryAddress: formValue.deliveryAddress,
        deliveryMethod: formValue.deliveryMethod,
        paymentMethod: formValue.paymentMethod,
        ingredients: ingredients,
        totalCost: ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0),
        status: 'brewing'
      };

      this.potionService.addPotion(potion);
      
      this.messageService.add({
        severity: 'success',
        summary: '✨ Potion Created!',
        detail: `Potion ${potion.potionNumber} is now brewing!`,
        life: 5000
      });

      this.resetForm();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: '❌ Invalid Form',
        detail: 'Please fill in all required fields correctly.',
        life: 5000
      });
      
      this.markFormGroupTouched(this.potionForm);
    }
  }

  resetForm(): void {
    this.submitted.set(false);
    this.initForm();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private generateId(): string {
    return `pot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getFieldError(fieldName: string): string {
    const control = this.potionForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['pastDate']) return 'Ready date must be in the future';
    if (errors['minIngredients']) return `At least ${errors['minIngredients'].min} ingredients required`;
    if (errors['invalidIngredient']) return 'All ingredients must be properly filled';
    
    return 'Invalid field';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      orderedBy: 'Customer name',
      readyDate: 'Ready date',
      deliveryAddress: 'Delivery address',
      deliveryMethod: 'Delivery method',
      paymentMethod: 'Payment method',
      ingredients: 'Ingredients'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.potionForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.submitted()));
  }

  private getDeliveryIcon(method: DeliveryMethod): string {
    const icons: { [key: string]: string } = {
      [DeliveryMethod.OWL]: '🦉',
      [DeliveryMethod.DRAGON]: '🐲',
      [DeliveryMethod.TELEPORT]: '✨',
      [DeliveryMethod.COURIER]: '🧙',
      [DeliveryMethod.PICKUP]: '🏪'
    };
    return icons[method] || '📦';
  }

  private getPaymentIcon(method: PaymentMethod): string {
    const icons: { [key: string]: string } = {
      [PaymentMethod.GOLD_COINS]: '💰',
      [PaymentMethod.SILVER_COINS]: '🥈',
      [PaymentMethod.MAGICAL_TRANSFER]: '✨',
      [PaymentMethod.CREDIT_SPELL]: '🔮',
      [PaymentMethod.BARTER]: '🤝'
    };
    return icons[method] || '💳';
  }
}
