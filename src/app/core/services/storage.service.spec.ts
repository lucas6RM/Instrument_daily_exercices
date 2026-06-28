import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';

import { StorageService } from './storage.service';
import { STORAGE_KEYS } from './storage-keys';

function setupMockLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    },
    writable: true,
  });

  return store;
}

describe('StorageService', () => {
  let service: StorageService;
  let store: Record<string, string>;

  beforeEach(() => {
    store = setupMockLocalStorage();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('keys', () => {
    it('should expose named storage keys', () => {
      expect(service.keys.EXERCISES).toBe('instrument_daily_exercises');
      expect(service.keys.PROGRESS).toBe('instrument_daily_progress');
    });
  });

  describe('get', () => {
    it('should return null when key does not exist', () => {
      const result = service.get<string>('nonexistent');
      expect(result).toBeNull();
    });

    it('should parse and return a JSON value', () => {
      store['test'] = JSON.stringify({ name: 'test', value: 42 });
      const result = service.get<{ name: string; value: number }>('test');
      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('should return null when JSON parsing fails', () => {
      store['invalid'] = 'not-valid-json';
      const result = service.get<string>('invalid');
      expect(result).toBeNull();
    });

    it('should return null when localStorage throws', () => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Unavailable');
      });
      const result = service.get<string>('test');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should serialize and store a value', () => {
      service.set('test', { name: 'test', value: 42 });
      expect(store['test']).toBe('{"name":"test","value":42}');
    });

    it('should not throw when localStorage is unavailable', () => {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Unavailable');
      });
      expect(() => service.set('test', { foo: 'bar' })).not.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a key from localStorage', () => {
      store['test'] = 'value';
      service.remove('test');
      expect(store['test']).toBeUndefined();
    });

    it('should not throw when localStorage is unavailable', () => {
      vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Unavailable');
      });
      expect(() => service.remove('test')).not.toThrow();
    });
  });
});

describe('STORAGE_KEYS', () => {
  it('should have the expected keys', () => {
    expect(STORAGE_KEYS.EXERCISES).toBe('instrument_daily_exercises');
    expect(STORAGE_KEYS.PROGRESS).toBe('instrument_daily_progress');
  });
});
