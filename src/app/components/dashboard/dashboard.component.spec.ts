import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { PotionService } from '../../services/potion.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [PotionService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with activeIndex 0', () => {
    expect(component.activeIndex.toString()).toBe('0');
  });

  it('should contain header with title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.header-title');
    
    expect(header?.textContent).toContain("Wizard's Potion Shop");
  });

  it('should contain two tabs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('p-tabPanel');
    
    expect(tabs.length).toBe(2);
  });

  it('should contain potion form component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('app-potion-form');
    
    expect(form).toBeTruthy();
  });

  it('should contain potions list component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const list = compiled.querySelector('app-potions-list');
    
    expect(list).toBeTruthy();
  });

  it('should contain footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('.dashboard-footer');
    
    expect(footer).toBeTruthy();
  });

  it('should switch between tabs', () => {
    const initialIndex = component.activeIndex;
    component.activeIndex = '1';
    
    expect(component.activeIndex).not.toBe(initialIndex);
    expect(component.activeIndex).toBe('1');
  });
});
