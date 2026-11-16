import '@testing-library/jest-dom';

// Polyfill for IntersectionObserver in test environment
class MockIntersectionObserver {
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
      this as unknown as globalThis.IntersectionObserver
    )
  }
  
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof globalThis.IntersectionObserver
