import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Assignee } from '../../../core/models';
import { AssigneeAvatarComponent } from './assignee-avatar.component';

const ASSIGNEE: Assignee = { id: 'u1', name: 'John Doe', avatar: 'JD', email: 'john@doe.com' };

describe('AssigneeAvatarComponent', () => {
  let fixture: ComponentFixture<AssigneeAvatarComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigneeAvatarComponent);
    fixture.componentRef.setInput('assignee', ASSIGNEE);
  });

  it('renders the avatar initials', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.avatar-circle')?.textContent?.trim()).toBe('JD');
  });

  it('shows the first name by default', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.name')?.textContent).toContain('John');
  });

  it('hides the name when showName is false', () => {
    fixture.componentRef.setInput('showName', false);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.name')).toBeNull();
  });
});
