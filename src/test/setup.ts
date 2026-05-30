import '@testing-library/jest-dom';

// Polyfill for IntersectionObserver in test environment
class IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe(target: Element) {
    // Immediately trigger the callback with the element as intersecting
    this.callback(
      [{
        isIntersecting: true,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        target,
        time: Date.now(),
      }],
      this as any  // MVP fix
    )
  }
  
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

globalThis.IntersectionObserver = IntersectionObserver as any
