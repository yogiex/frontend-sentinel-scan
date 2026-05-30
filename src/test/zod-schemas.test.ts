import { z } from 'zod';

// Recreate schemas from existing forms (NewScan, UserManagement, etc.)
const newScanSchema = z.object({
  target: z.string().url('Must be a valid URL').or(z.string().ip({ version: 'v4' }).or(z.string().regex(/^\d+\.\d+\.\d+\.\d+\/\d+$/, 'Must be valid CIDR'))),
  scanType: z.enum(['basic', 'web', 'discovery', 'credentialed', 'compliance', 'advanced']),
  stealthMode: z.boolean().optional(),
  timeout: z.number().min(1, 'Timeout must be at least 1 minute').max(1440, 'Timeout cannot exceed 24 hours'),
});

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email'),
  role: z.enum(['admin', 'analyst', 'viewer', 'auditor']),
});

describe('Zod Schema Validation', () => {
  describe('NewScan Schema', () => {
    it('validates correct scan data', () => {
      const validData = {
        target: 'https://example.com',
        scanType: 'web' as const,
        stealthMode: true,
        timeout: 60,
      };
      expect(() => newScanSchema.parse(validData)).not.toThrow();
    });

    it('rejects invalid URL/IP', () => {
      const invalidData = { target: 'invalid', scanType: 'web', timeout: 60 };
      expect(() => newScanSchema.parse(invalidData)).toThrow();
    });

    it('rejects invalid scan type', () => {
      const invalidData = { target: 'https://example.com', scanType: 'invalid', timeout: 60 };
      expect(() => newScanSchema.parse(invalidData)).toThrow();
    });
  });

  describe('User Schema', () => {
    it('validates correct user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin' as const,
      };
      expect(() => userSchema.parse(validData)).not.toThrow();
    });

    it('rejects invalid email', () => {
      const invalidData = { name: 'John', email: 'invalid', role: 'admin' };
      expect(() => userSchema.parse(invalidData)).toThrow();
    });
  });
});
