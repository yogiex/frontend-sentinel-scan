import { useCallback, useEffect, useRef } from 'react';

interface UseFocusManagementOptions {
  initialFocus?: string; // CSS selector or element ID
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export function useFocusManagement({
  initialFocus,
  trapFocus = false,
  restoreFocus = true,
}: UseFocusManagementOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const setInitialFocus = useCallback(() => {
    if (initialFocus) {
      const element = document.querySelector(initialFocus) as HTMLElement;
      if (element) {
        element.focus();
      }
    }
  }, [initialFocus]);

  const trapFocusInContainer = useCallback((e: KeyboardEvent) => {
    if (!trapFocus || e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [trapFocus]);

  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement;
    }

    if (initialFocus) {
      setInitialFocus();
    }

    if (trapFocus) {
      document.addEventListener('keydown', trapFocusInContainer);
    }

    return () => {
      if (trapFocus) {
        document.removeEventListener('keydown', trapFocusInContainer);
      }
      if (restoreFocus && previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, []); // Only run on mount

  return {
    containerRef,
    setInitialFocus,
  };
}
