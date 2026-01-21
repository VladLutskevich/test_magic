import { Injectable, signal, computed } from '@angular/core';
import { Potion } from '../models/potion.model';

@Injectable({
  providedIn: 'root'
})
export class PotionService {
  private potionsSignal = signal<Potion[]>([]);
  
  potions = this.potionsSignal.asReadonly();
  potionsCount = computed(() => this.potionsSignal().length);

  addPotion(potion: Potion): void {
    this.potionsSignal.update(potions => [...potions, potion]);
  }

  updatePotion(id: string, updatedPotion: Potion): void {
    this.potionsSignal.update(potions => 
      potions.map(p => p.id === id ? updatedPotion : p)
    );
  }

  deletePotion(id: string): void {
    this.potionsSignal.update(potions => 
      potions.filter(p => p.id !== id)
    );
  }

  getPotionById(id: string): Potion | undefined {
    return this.potionsSignal().find(p => p.id === id);
  }

  generatePotionNumber(): string {
    const count = this.potionsCount() + 1;
    const year = new Date().getFullYear();
    return `POT-${year}-${count.toString().padStart(4, '0')}`;
  }
}
