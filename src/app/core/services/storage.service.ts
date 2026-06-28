import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from './storage-keys';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  readonly keys = STORAGE_KEYS;

  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }
}
