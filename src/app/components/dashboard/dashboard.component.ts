import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PotionFormComponent } from '../potion-form/potion-form.component';
import { PotionsListComponent } from '../potions-list/potions-list.component';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PotionFormComponent,
    PotionsListComponent,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  activeIndex: string = '0';
}
