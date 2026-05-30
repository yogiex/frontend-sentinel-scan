export interface User {
  id: string;
  username: string;
  email: string;
  role: 'super-admin' | 'admin' | 'user' | 'viewer';
  permissions?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
