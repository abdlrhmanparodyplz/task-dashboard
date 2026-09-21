import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
  });

  it('renders all six nav items', () => {
    const items = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(items.length).toBe(6);
    expect(items[0].textContent).toContain('Dashboard');
    expect(items[1].textContent).toContain('Tasks');
  });

  it('does not render a backdrop when closed', () => {
    expect(fixture.nativeElement.querySelector('.backdrop')).toBeNull();
  });

  it('renders a backdrop and marks the sidebar open when open() is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.backdrop')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.sidebar').classList.contains('open')).toBe(true);
  });

  it('emits closeRequested when the backdrop is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closeRequested.subscribe(() => (closed = true));
    fixture.nativeElement.querySelector('.backdrop').click();

    expect(closed).toBe(true);
  });

  it('emits both newTask and closeRequested when "New Task" is clicked', () => {
    let newTaskEmitted = false;
    let closed = false;
    fixture.componentInstance.newTask.subscribe(() => (newTaskEmitted = true));
    fixture.componentInstance.closeRequested.subscribe(() => (closed = true));

    fixture.nativeElement.querySelector('.new-task-btn').click();

    expect(newTaskEmitted).toBe(true);
    expect(closed).toBe(true);
  });

  it('emits closeRequested when a nav item is clicked (auto-closes on mobile)', () => {
    let closed = false;
    fixture.componentInstance.closeRequested.subscribe(() => (closed = true));

    fixture.nativeElement.querySelector('.nav-item').click();

    expect(closed).toBe(true);
  });
});
