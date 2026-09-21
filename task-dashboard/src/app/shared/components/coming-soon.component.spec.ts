import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ComingSoonComponent } from './coming-soon.component';

describe('ComingSoonComponent', () => {
  let fixture: ComponentFixture<ComingSoonComponent>;

  function setup(data: Record<string, unknown>) {
    TestBed.configureTestingModule({
      imports: [ComingSoonComponent],
      providers: [{ provide: ActivatedRoute, useValue: { data: of(data) } }],
    });
    fixture = TestBed.createComponent(ComingSoonComponent);
    fixture.detectChanges();
  }

  it('renders the title from route data', () => {
    setup({ title: 'Calendar' });
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Calendar');
  });

  it('falls back to a default title when route data has none', () => {
    setup({});
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Coming soon');
  });
});
