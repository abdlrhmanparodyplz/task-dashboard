import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Statistic } from '../../../core/models';
import { StatCardComponent } from './stat-card.component';

function makeStatistic(overrides: Partial<Statistic> = {}): Statistic {
  return {
    id: 'stat-001',
    title: 'Total Tasks',
    icon: '📊',
    value: 156,
    change: '+12',
    changeLabel: 'this week',
    changeType: 'positive',
    color: '#1976D2',
    ...overrides,
  };
}

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatCardComponent);
  });

  it('renders the title, value, and change text', () => {
    fixture.componentRef.setInput('statistic', makeStatistic());
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')?.textContent).toBe('Total Tasks');
    expect(el.querySelector('.value')?.textContent).toBe('156');
    expect(el.querySelector('.change')?.textContent).toContain('+12');
    expect(el.querySelector('.change')?.textContent).toContain('this week');
  });

  it('applies the positive/negative/neutral class based on changeType', () => {
    fixture.componentRef.setInput('statistic', makeStatistic({ changeType: 'negative' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.change').classList.contains('negative')).toBe(
      true,
    );
  });

  it('picks a known icon for a recognized statistic id', () => {
    fixture.componentRef.setInput('statistic', makeStatistic({ id: 'stat-004' }));
    fixture.detectChanges();
    const icon: HTMLElement = fixture.nativeElement.querySelector('.icon i');
    expect(icon.classList.contains('pi-exclamation-triangle')).toBe(true);
  });

  it('falls back to a generic icon for an unrecognized statistic id', () => {
    fixture.componentRef.setInput('statistic', makeStatistic({ id: 'unknown-id' }));
    fixture.detectChanges();
    const icon: HTMLElement = fixture.nativeElement.querySelector('.icon i');
    expect(icon.classList.contains('pi-circle')).toBe(true);
  });
});
