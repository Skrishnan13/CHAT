"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This part runs only on the client initially or if isBrowser is false during SSR.
    // We'll ensure it fully initializes client-side in useEffect.
    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  useEffect(() => {
    // This effect runs only on the client after hydration.
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // If no item, set the initial value to localStorage and state
        const resolvedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;
        window.localStorage.setItem(key, JSON.stringify(resolvedInitialValue));
        setStoredValue(resolvedInitialValue); // Ensure state matches if it wasn't set correctly initially
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // If error, ensure state is set to initialValue resolved on client
      const resolvedInitialValue = initialValue instanceof Function ? initialValue() : initialValue;
      setStoredValue(resolvedInitialValue);
    }
  }, [key, initialValue]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
