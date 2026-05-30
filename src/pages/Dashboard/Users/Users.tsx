/**
 * SentinelScan User Management Page
 * Path: src/pages/Dashboard/Users/Users.tsx
 *
 * Slate & Indigo Theme - Clean Professional Design
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Users,
  Search,
  Plus,
  Edit,
  Shield,
  Activity,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Eye,
  Trash2,
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { UserForm } from '@/components/users/UserForm';
import { Role, ROLE_CONFIG, PERMISSIONS } from '@/types/permissions';

// ─── Types ─────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  scansCreated: number;
  avatar: string;
  permissions: string[];
  twoFactor: boolean;
  lastLoginIP: string;
  loginAttempts: number;
  accountCreated: string;
  sessionTimeout: string;
  accessLevel: string;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  securityScore: number;
}

// ─── Mock Users Data (in real app, this comes from API/Redux) ───
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@sentinelscan.com',
    role: 'super-admin',
    status: 'active',
    lastLogin: '2026-05-03 10:15',
    scansCreated: 245,
    avatar: 'S',
    permissions: PERMISSIONS['super-admin'],
    twoFactor: true,
    lastLoginIP: '192.168.1.100',
    loginAttempts: 0,
    accountCreated: '2024-01-01',
    sessionTimeout: '60 min',
    accessLevel: 'Super Administrator',
    complianceStatus: 'compliant',
    securityScore: 98,
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@sentinelscan.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-05-02 09:15',
    scansCreated: 156,
    avatar: 'A',
    permissions: PERMISSIONS['admin'],
    twoFactor: true,
    lastLoginIP: '192.168.1.101',
    loginAttempts: 2,
    accountCreated: '2025-01-15',
    sessionTimeout: '30 min',
    accessLevel: 'Administrator',
    complianceStatus: 'compliant',
    securityScore: 95,
  },
  {
    id: '3',
    name: 'John Analyst',
    email: 'john@sentinelscan.com',
    role: 'user',
    status: 'active',
    lastLogin: '2026-05-01 14:30',
    scansCreated: 42,
    avatar: 'J',
    permissions: PERMISSIONS['user'],
    twoFactor: false,
    lastLoginIP: '192.168.1.102',
    loginAttempts: 0,
    accountCreated: '2025-03-20',
    sessionTimeout: '15 min',
    accessLevel: 'Security Analyst',
    complianceStatus: 'compliant',
    securityScore: 78,
  },
  {
    id: '4',
    name: 'Mike Viewer',
    email: 'mike@sentinelscan.com',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2026-04-20 11:45',
    scansCreated: 3,
    avatar: 'M',
    permissions: PERMISSIONS['viewer'],
    twoFactor: false,
    lastLoginIP: '192.168.1.103',
    loginAttempts: 0,
    accountCreated: '2025-04-05',
    sessionTimeout: '5 min',
    accessLevel: 'Read-only Viewer',
    complianceStatus: 'compliant',
    securityScore: 45,
  },
  {
    id: '5',
    name: 'Lisa Admin',
    email: 'lisa@sentinelscan.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-05-01 16:20',
    scansCreated: 201,
    avatar: 'L',
    permissions: PERMISSIONS['admin'],
    twoFactor: true,
    lastLoginIP: '192.168.1.104',
    loginAttempts: 0,
    accountCreated: '2024-12-01',
    sessionTimeout: '45 min',
    accessLevel: 'Administrator',
    complianceStatus: 'compliant',
    securityScore: 98,
  },
];

// ─── Status Configuration ────────────────────────────────────────
const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    description: 'User has full access',
    color: 'var(--success)',
  },
  inactive: {
    label: 'Inactive',
    icon: Clock,
    description: 'User access disabled',
    color: 'var(--text-secondary)',
  },
  suspended: {
    label: 'Suspended',
    icon: AlertTriangle,
    description: 'User temporarily blocked',
    color: 'var(--danger)',
  },
};

// ─── Icon Map (since we can't use dynamic component names easily) ─
const ICON_MAP: Record<string, typeof Shield> = {
  Shield,
  User: Users,
  Eye,
  BarChart3,
  Activity,
};

function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
  const Icon = ICON_MAP[config.icon] || Shield;
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 border font-mono text-xs tracking-wider"
      style={{
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderColor: 'rgba(79, 70, 229, 0.2)',
        borderRadius: 'var(--radius)',
        color: 'var(--text-primary)',
        fontWeight: 500,
      }}
    >
      <Icon className="w-3 h-3" style={{ color: 'var(--primary)' }} />
      <span>{config.label.toUpperCase()}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;
  const Icon = config.icon;
  const color = config.color;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-0.5 border font-mono text-[0.65rem] tracking-wider font-medium"
      style={{
        backgroundColor: `${color}14`,
        color: color,
        borderColor: `${color}30`,
        borderRadius: 'var(--radius)',
      }}
    >
      <Icon className="w-2.5 h-2.5" />
      <span>{config.label.toUpperCase()}</span>
    </div>
  );
}

function SecurityScore({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--primary)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };
  const color = getColor(score);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center border"
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}08)`,
          borderColor: `${color}30`,
        }}
      >
        <span className="text-xs font-bold font-mono" style={{ color: color }}>{score}</span>
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>SEC</span>
    </div>
  );
}

function ComplianceBadge({ status }: { status: string }) {
  const colorMap: Record<string, {bg: string, text: string, label: string}> = {
    compliant: { bg: 'rgba(16, 185, 129, 0.08)', text: 'var(--success)', label: 'PASS' },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', text: 'var(--warning)', label: 'WARN' },
    non_compliant: { bg: 'rgba(239, 68, 68, 0.08)', text: 'var(--danger)', label: 'FAIL' },
  };
  const colors = colorMap[status] || colorMap.compliant;
  return (
    <div
      className="px-2 py-0.5 border font-mono text-[0.65rem] tracking-wider font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: `${colors.text}25`,
        borderRadius: 'var(--radius)',
      }}
    >
      {colors.label}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

  // In real app, this would come from Redux store
  const users = MOCK_USERS;

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Security statistics
  const securityStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    twoFactorEnabled: users.filter(u => u.twoFactor).length,
    avgSecurityScore: Math.round(users.reduce((acc, u) => acc + u.securityScore, 0) / users.length),
  };

  // Role options derived from ROLE_CONFIG
  const roleOptions = [
    { value: 'all' as const, label: 'All Roles' },
    ...Object.entries(ROLE_CONFIG).map(([role, config]) => ({
      value: role as Role,
      label: config.label,
    })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-[var(--primary)] opacity-30"></div>
          <h1
            className="text-3xl font-bold tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            User Management
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage system users, roles, and access control
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-xs"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius)',
            }}
          >
            <BarChart3 className="w-3.5 h-3.5 mr-2" />
            Export
          </Button>
          <Button
            className="text-xs font-medium hover:bg-[var(--primary-dark)] transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
            onClick={() => setAddUserDialog(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Add User
          </Button>
        </div>
      </div>

{/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard icon={Users} label="Total" value={securityStats.totalUsers} color="var(--primary)" />
          <StatsCard icon={CheckCircle} label="Active" value={securityStats.activeUsers} color="var(--success)" />
          <StatsCard icon={Shield} label="Admin" value={securityStats.adminUsers} color="var(--primary)" />
          <StatsCard icon={AlertTriangle} label="Suspended" value={securityStats.suspendedUsers} color="var(--danger)" />
          <StatsCard icon={UserCheck} label="2FA" value={securityStats.twoFactorEnabled} color="var(--success)" />
          <StatsCard icon={BarChart3} label="Avg Sec" value={securityStats.avgSecurityScore} color="var(--primary)" />
        </div>

      {/* Search + Filters */}
      <Card className="animate-fade-in" style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <Input
                type="text"
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                }}
              />
            </div>
            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | 'all')}>
                <SelectTrigger
                  className="w-[160px]"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} style={{ color: 'var(--text-primary)' }}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-[160px]"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} style={{ color: 'var(--text-primary)' }}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center animate-fade-in">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No users found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                  }}>
                    <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>User</th>
                    <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</th>
                    <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>SEC</th>
                    <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Comp</th>
                    <th className="text-left py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Activity</th>
                    <th className="text-right py-3 px-6 font-medium text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      className="transition-colors hover:bg-[var(--bg-hover)]"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-9 h-9 rounded-md flex items-center justify-center font-bold shadow-sm"
                              style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                color: 'var(--primary-foreground)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.8rem',
                              }}
                            >
                              {user.avatar}
                            </div>
                            {user.twoFactor && (
                              <div
                                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: 'var(--success)', borderColor: 'var(--bg-card)' }}
                              >
                                <CheckCircle className="w-2 h-2" style={{ color: 'var(--primary-foreground)' }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-[0.7rem]" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-4 px-6">
                        <SecurityScore score={user.securityScore} />
                      </td>
                      <td className="py-4 px-6">
                        <ComplianceBadge status={user.complianceStatus} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[0.7rem]" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                            {user.lastLogin}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                            {user.lastLoginIP}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="p-1.5 border rounded-md hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[rgba(79,70,229,0.05)]"
                            style={{
                              color: 'var(--text-muted)',
                              borderColor: 'transparent',
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 border rounded-md hover:text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[rgba(239,68,68,0.05)]"
                            style={{
                              color: 'var(--text-muted)',
                              borderColor: 'transparent',
                            }}
                            onClick={() => setSuspendDialog({ open: true, user })}
                          >
                            {user.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            className="p-1.5 border rounded-md hover:text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[rgba(239,68,68,0.05)]"
                            style={{
                              color: 'var(--text-muted)',
                              borderColor: 'transparent',
                            }}
                            onClick={() => setDeleteDialog({ open: true, user })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {users.length} users
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-[0.7rem]"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius)',
            }}
          >
            <Settings className="w-3.5 h-3.5 mr-2" />
            Role Management
          </Button>
          <Button
            variant="outline"
            className="text-[0.7rem]"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius)',
            }}
          >
            <BarChart3 className="w-3.5 h-3.5 mr-2" />
            User Analytics
          </Button>
        </div>
      </div>

      {/* Suspend/Activate Confirmation Dialog */}
      <ConfirmDialog
        open={suspendDialog.open}
        onOpenChange={(open) => setSuspendDialog({ open, user: null })}
        title={suspendDialog.user?.status === 'active' ? 'Suspend User' : 'Activate User'}
        description={
          suspendDialog.user
            ? suspendDialog.user.status === 'active'
              ? `Are you sure you want to suspend ${suspendDialog.user.name}? They will lose access to the system.`
              : `Are you sure you want to activate ${suspendDialog.user.name}? They will regain access to the system.`
            : ''
        }
        confirmLabel={suspendDialog.user?.status === 'active' ? 'Suspend' : 'Activate'}
        variant={suspendDialog.user?.status === 'active' ? 'warning' : 'default'}
        onConfirm={() => {
          // TODO: Implement suspend/activate logic
          console.log('Toggle status for user:', suspendDialog.user?.id);
          setSuspendDialog({ open: false, user: null });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
        title="Delete User"
        description={
          deleteDialog.user
            ? `Are you sure you want to permanently delete ${deleteDialog.user.name}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          // TODO: Implement delete logic
          console.log('Delete user:', deleteDialog.user?.id);
          setDeleteDialog({ open: false, user: null });
        }}
      />

      {/* Add User Dialog */}
      <UserForm
        open={addUserDialog}
        onOpenChange={setAddUserDialog}
        onSubmit={(data) => {
          // TODO: Implement actual API call
          console.log('Create user:', data);
          // In real app: dispatch(createUser(data)) or API call
          alert(`User ${data.name} created successfully! (Mock)`);
        }}
        mode="add"
      />
    </div>
  );
}
