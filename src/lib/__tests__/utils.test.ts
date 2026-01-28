import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate } from '../utils';

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('should handle conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active', false && 'inactive')).toBe(
      'base-class active'
    );
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe(
      'class1 class2 class3'
    );
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(10000)).toBe('₩10,000');
  });

  it('should format large numbers', () => {
    expect(formatCurrency(1000000)).toBe('₩1,000,000');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('₩0');
  });

  it('should handle decimals by rounding', () => {
    expect(formatCurrency(12345.67)).toBe('₩12,346');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-5000)).toBe('-₩5,000');
  });
});

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2026-01-28');
    expect(formatDate(date)).toMatch(/2026/);
    expect(formatDate(date)).toMatch(/01/);
    expect(formatDate(date)).toMatch(/28/);
  });

  it('should format date string', () => {
    expect(formatDate('2026-01-28')).toMatch(/2026/);
  });

  it('should handle invalid date string', () => {
    // The function will throw on invalid date, which is expected behavior
    expect(() => formatDate('invalid-date')).toThrow(RangeError);
  });

  it('should format current date', () => {
    const result = formatDate(new Date());
    expect(result).toMatch(/\d{4}/); // Should have year
  });
});
