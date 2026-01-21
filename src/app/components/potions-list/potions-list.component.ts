import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PotionService } from '../../services/potion.service';
import { Potion, Ingredient } from '../../models/potion.model';
import { Table, TableModule } from 'primeng/table';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-potions-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    Card,
    Button,
    Tag,
    Dialog,
    Toast,
    ConfirmDialog
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './potions-list.component.html',
  styleUrls: ['./potions-list.component.css']
})
export class PotionsListComponent {
  private potionService = inject(PotionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  potions = this.potionService.potions;
  potionsCount = this.potionService.potionsCount;
  
  selectedPotion = signal<Potion | null>(null);
  displayDialog = signal(false);

  viewDetails(potion: Potion): void {
    this.selectedPotion.set(potion);
    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
    this.selectedPotion.set(null);
  }

  deletePotion(potion: Potion, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete potion ${potion.potionNumber}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.potionService.deletePotion(potion.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Potion ${potion.potionNumber} has been removed`,
          life: 3000
        });
      }
    });
  }

  getStatusSeverity(status?: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (status) {
      case 'brewing': return 'warn';
      case 'ready': return 'success';
      case 'delivered': return 'info';
      default: return 'secondary';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'brewing': return '⚗️';
      case 'ready': return '✅';
      case 'delivered': return '🚚';
      default: return '📦';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getDeliveryIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'Owl Post': '🦉',
      'Dragon Express': '🐲',
      'Magical Teleport': '✨',
      'Wizard Courier': '🧙',
      'Shop Pickup': '🏪'
    };
    return icons[method] || '📦';
  }

  getPaymentIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'Gold Coins': '💰',
      'Silver Coins': '🥈',
      'Magical Transfer': '✨',
      'Credit Spell': '🔮',
      'Barter': '🤝'
    };
    return icons[method] || '💳';
  }
}
