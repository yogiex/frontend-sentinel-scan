/**
 * UserForm Component - Add/Edit User Dialog
 * Path: src/components/users/UserForm.tsx
 *
 * Slate & Indigo Theme - Clean Professional Design
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Role, ROLE_CONFIG } from '@/types/permissions';
import { Users, Shield, Mail, Key, AlertCircle } from 'lucide-react';

interface UserFormData {
  name: string;
  email: string;
  role: Role;
  password: string;
  confirmPassword: string;
  twoFactor: boolean;
}

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  defaultValues?: Partial<UserFormData>;
  mode: 'add' | 'edit';
}

const INITIAL_FORM_DATA: UserFormData = {
  name: '',
  email: '',
  role: 'user',
  password: '',
  confirmPassword: '',
  twoFactor: false,
};

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    ...INITIAL_FORM_DATA,
    ...defaultValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (mode === 'add') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    onOpenChange(false);
  };

  const roleOptions = Object.entries(ROLE_CONFIG).map(([role, config]) => ({
    value: role as Role,
    label: config.label,
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[525px]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <Shield className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-secondary)' }}>
            {mode === 'add'
              ? 'Create a new user account with specific role and permissions.'
              : 'Update user information and settings.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Full Name
            </Label>
            <div className="relative">
              <Users
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className="pl-10"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.name ? 'var(--danger)' : 'var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                }}
              />
            </div>
            {errors.name && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Email Address
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <Input
                id="email"
                type="email"
                placeholder="user@sentinelscan.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className="pl-10"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.email ? 'var(--danger)' : 'var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
            >
              <SelectTrigger
                id="role"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                }}
              >
                {roleOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password Fields (Add Mode Only) */}
          {mode === 'add' && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className="pl-10"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: errors.password ? 'var(--danger)' : 'var(--border)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    className="pl-10"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: errors.confirmPassword ? 'var(--danger)' : 'var(--border)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Two-Factor Authentication */}
          <div
            className="flex items-center space-x-2 p-4 border rounded-md"
            style={{
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <Checkbox
              id="twoFactor"
              checked={formData.twoFactor}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, twoFactor: checked as boolean })
              }
            />
            <Label
              htmlFor="twoFactor"
              className="text-sm font-medium cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              Enable Two-Factor Authentication (2FA)
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
              }}
            >
              {mode === 'add' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
