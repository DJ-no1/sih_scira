import { useState, useCallback, useEffect } from 'react';

// Get the initial value synchronously during initialization
function getStoredValue<T>(key: string, defaultValue: T): T {
  // Always return defaultValue on server-side
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    // Handle special case for undefined
    if (item === 'undefined') return defaultValue;

    return JSON.parse(item);
  } catch {
    // If error, return default value
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Always start with defaultValue to prevent hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage after hydration
  useEffect(() => {
    const initialValue = getStoredValue(key, defaultValue);
    setStoredValue(initialValue);
    setIsInitialized(true);
  }, [key, defaultValue]);

  // Listen for storage changes from other components/tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch {
          // If parsing fails, use the raw value
          setStoredValue(e.newValue as unknown as T);
        }
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage-change', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage-change', handleCustomStorageChange as EventListener);
    };
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const nextValue = value instanceof Function ? value(storedValue) : value;
        // Update React state
        setStoredValue(nextValue);
        // Update localStorage only after initialization
        if (typeof window !== 'undefined' && isInitialized) {
          if (nextValue === undefined) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, JSON.stringify(nextValue));
          }

          // Dispatch custom event for same-tab synchronization
          const customEvent = new CustomEvent('localStorage-change', {
            detail: { key, value: nextValue },
          });
          window.dispatchEvent(customEvent);
        }
      } catch (error) {
        console.warn(`Error saving to localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isInitialized],
  );

  return [storedValue, setValue];
}
