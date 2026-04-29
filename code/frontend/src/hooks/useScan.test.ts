import { describe, it, expect } from 'vitest';

describe('useScan', () => {
  it('exists as a module', () => {
    const module = require('./useScan');
    expect(module.useScan).toBeDefined();
  });
});
