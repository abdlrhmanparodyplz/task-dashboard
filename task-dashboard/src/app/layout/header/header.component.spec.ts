import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('renders the search input with the given searchQuery', fakeAsync(() => {
    fixture.componentRef.setInput('searchQuery', 'bug');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.search input');
    expect(input.value).toBe('bug');
  }));

  it('renders the given user initials in the avatar', () => {
    fixture.componentRef.setInput('userInitials', 'AB');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.avatar').textContent.trim()).toBe('AB');
  });

  it('emits searchQueryChange when the input value changes', () => {
    let emitted: string | undefined;
    fixture.componentInstance.searchQueryChange.subscribe((v) => (emitted = v));

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.search input');
    input.value = 'design';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toBe('design');
  });

  it('emits menuToggle when the hamburger button is clicked', () => {
    let toggled = false;
    fixture.componentInstance.menuToggle.subscribe(() => (toggled = true));

    fixture.nativeElement.querySelector('.menu-btn').click();

    expect(toggled).toBe(true);
  });
});
