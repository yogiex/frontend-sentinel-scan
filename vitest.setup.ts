import { expect } from 'vitest';
global.expect = expect;

// Dynamic import to ensure global.expect is set before loading jest-dom
await import('@testing-library/jest-dom');
