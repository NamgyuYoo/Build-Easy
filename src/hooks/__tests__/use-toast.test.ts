import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reducer } from '../use-toast';

describe('use-toast reducer', () => {
  const initialState = { toasts: [] };

  beforeEach(() => {
    // Clear any timeouts before each test
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add a new toast', () => {
    const action = {
      type: 'ADD_TOAST' as const,
      toast: { id: '1', title: 'Test Toast', open: true },
    };
    const result = reducer(initialState, action);
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].title).toBe('Test Toast');
  });

  it('should limit toasts to TOAST_LIMIT (1)', () => {
    const action1 = {
      type: 'ADD_TOAST' as const,
      toast: { id: '1', title: 'First', open: true },
    };
    const action2 = {
      type: 'ADD_TOAST' as const,
      toast: { id: '2', title: 'Second', open: true },
    };

    let result = reducer(initialState, action1);
    result = reducer(result, action2);

    // Should only have 1 toast due to TOAST_LIMIT = 1
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe('2');
  });

  it('should update existing toast', () => {
    const state = {
      toasts: [{ id: '1', title: 'Original', open: true }],
    };
    const action = {
      type: 'UPDATE_TOAST' as const,
      toast: { id: '1', title: 'Updated' },
    };
    const result = reducer(state, action);
    expect(result.toasts[0].title).toBe('Updated');
  });

  it('should not update non-existent toast', () => {
    const state = {
      toasts: [{ id: '1', title: 'Original', open: true }],
    };
    const action = {
      type: 'UPDATE_TOAST' as const,
      toast: { id: '999', title: 'Updated' },
    };
    const result = reducer(state, action);
    expect(result.toasts[0].title).toBe('Original');
  });

  it('should dismiss specific toast', () => {
    const state = {
      toasts: [
        { id: '1', title: 'First', open: true },
        { id: '2', title: 'Second', open: true },
      ],
    };
    const action = {
      type: 'DISMISS_TOAST' as const,
      toastId: '1',
    };
    const result = reducer(state, action);
    expect(result.toasts[0].open).toBe(false);
    expect(result.toasts[1].open).toBe(true);
  });

  it('should dismiss all toasts when no toastId provided', () => {
    const state = {
      toasts: [
        { id: '1', title: 'First', open: true },
        { id: '2', title: 'Second', open: true },
      ],
    };
    const action = {
      type: 'DISMISS_TOAST' as const,
    };
    const result = reducer(state, action);
    expect(result.toasts[0].open).toBe(false);
    expect(result.toasts[1].open).toBe(false);
  });

  it('should remove specific toast', () => {
    const state = {
      toasts: [
        { id: '1', title: 'First', open: true },
        { id: '2', title: 'Second', open: true },
      ],
    };
    const action = {
      type: 'REMOVE_TOAST' as const,
      toastId: '1',
    };
    const result = reducer(state, action);
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe('2');
  });

  it('should remove all toasts when no toastId provided', () => {
    const state = {
      toasts: [
        { id: '1', title: 'First', open: true },
        { id: '2', title: 'Second', open: true },
      ],
    };
    const action = {
      type: 'REMOVE_TOAST' as const,
    };
    const result = reducer(state, action);
    expect(result.toasts).toHaveLength(0);
  });

  it('should handle unknown action type', () => {
    const state = {
      toasts: [{ id: '1', title: 'First', open: true }],
    };
    // @ts-expect-error - Testing unknown action type
    const result = reducer(state, { type: 'UNKNOWN_ACTION' });
    // Reducer doesn't handle unknown actions, returns undefined
    expect(result).toBeUndefined();
  });
});
