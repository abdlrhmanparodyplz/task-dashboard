import { FormControl } from '@angular/forms';
import { notBlankValidator, notInPastValidator } from './task-validators';

describe('notBlankValidator', () => {
  const validator = notBlankValidator();

  it('rejects an empty string', () => {
    expect(validator(new FormControl(''))).toEqual({ blank: true });
  });

  it('rejects a whitespace-only string', () => {
    expect(validator(new FormControl('   '))).toEqual({ blank: true });
  });

  it('rejects null', () => {
    expect(validator(new FormControl(null))).toEqual({ blank: true });
  });

  it('accepts a non-blank string', () => {
    expect(validator(new FormControl('Fix the bug'))).toBeNull();
  });

  it('accepts a string with meaningful surrounding whitespace', () => {
    expect(validator(new FormControl('  Fix the bug  '))).toBeNull();
  });
});

describe('notInPastValidator', () => {
  const validator = notInPastValidator();

  it('accepts an empty value (leaves required checks to Validators.required)', () => {
    expect(validator(new FormControl(null))).toBeNull();
  });

  it('accepts today', () => {
    expect(validator(new FormControl(new Date()))).toBeNull();
  });

  it('accepts a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(validator(new FormControl(future))).toBeNull();
  });

  it('rejects a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(validator(new FormControl(past))).toEqual({ pastDate: true });
  });

  it('accepts a past date-time on the same calendar day (ignores time-of-day)', () => {
    const earlierToday = new Date();
    earlierToday.setHours(0, 0, 1, 0);
    expect(validator(new FormControl(earlierToday))).toBeNull();
  });
});
