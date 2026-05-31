export type AuthMethod = 'cookie' | 'header' | 'bearer' | 'basic';

export interface AuthCredential {
  id: string;
  name: string;
  method: AuthMethod;
  config: Record<string, unknown>;
  loginUrl?: string;
  verifyUrl?: string;
  verifyPattern?: string;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}
