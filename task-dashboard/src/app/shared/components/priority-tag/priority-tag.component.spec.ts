import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriorityTagComponent } from './priority-tag.component';

describe('PriorityTagComponent', () => {
  let fixture: ComponentFixture<PriorityTagComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityTagComponent);
  });

  function textAndClass(): { text: string; hasClass: (c: string) => boolean } {
    const el: HTMLElement = fixture.nativeElement.querySelector('.priority-tag');
    return { text: el.textContent?.trim() ?? '', hasClass: (c) => el.classList.contains(c) };
  }

  it('renders the priority in uppercase with the matching class', () => {
    fixture.componentRef.setInput('priority', 'high');
    fixture.detectChanges();
    const { text, hasClass } = textAndClass();
    expect(text).toBe('HIGH');
    expect(hasClass('high')).toBe(true);
  });

  it('renders medium priority', () => {
    fixture.componentRef.setInput('priority', 'medium');
    fixture.detectChanges();
    const { text, hasClass } = textAndClass();
    expect(text).toBe('MEDIUM');
    expect(hasClass('medium')).toBe(true);
  });

  it('renders low priority', () => {
    fixture.componentRef.setInput('priority', 'low');
    fixture.detectChanges();
    const { text, hasClass } = textAndClass();
    expect(text).toBe('LOW');
    expect(hasClass('low')).toBe(true);
  });
});
