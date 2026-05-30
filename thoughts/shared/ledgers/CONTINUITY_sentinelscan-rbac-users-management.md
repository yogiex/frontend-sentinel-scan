# Session: SentinelScan Frontend - RBAC Users Management
Updated: 2026-05-01T00:00:00Z

## Goal
Implement multi-role RBAC system with super-admin exclusive access to users management page in SentinelScan dashboard.

## Constraints
- Permission-based RBAC (not just role-based checking)
- 4 roles: super-admin, admin, user, viewer
- Super-admin has EXCLUSIVE access to user management
- Single dashboard with conditional rendering (not separate pages per role)
- Mock authentication (no real backend yet)

## Progress
### Done
- [x] Created 14-task todo list organized by phase (Foundation, Permission System, Users Page, State Management, Polish)

### In Progress
- [ ] Task #1: Add super-admin role to `src/types/auth.ts`

### Blocked
- None currently

## Key Decisions
- **Permission-based RBAC**: Using permissions array rather than just checking roles - more flexible and granular
- **4-role hierarchy**: super-admin > admin > user > viewer
- **Super-admin exclusivity**: Only super-admin can access /dashboard/users - enforced via both routing and UI
- **Single dashboard approach**: One dashboard layout with conditional rendering based on permissions - simpler than role-specific dashboards
- **Mock users for testing**: super-admin/super-admin, admin/admin, user/user, viewer/viewer credentials for development

## Next Steps
1. Execute Task #1: Add super-admin role to `src/types/auth.ts`
2. Task #2: Create `src/hooks/usePermission.ts` hook
3. Task #3: Update `src/store/slices/authSlice.ts` with mock super-admin account
4. Task #4: Create `src/components/auth/ProtectedRoute.tsx`
5. Task #5: Create `src/components/auth/RoleGuard.tsx`
6. Continue with remaining tasks in order

## File Operations
### Read
- (none yet - tasks not started)

### Modified
- (none yet - tasks not started)

## Critical Context
### Architecture
- **Roles**: super-admin (full system access), admin (organization management), user (standard access), viewer (read-only)
- **Permissions approach**: Each role has associated permissions array; UI and routing check permissions not roles directly

### Mock Credentials for Testing
| Role | Username | Password |
|------|----------|----------|
| super-admin | super-admin | super-admin |
| admin | admin | admin |
| user | user | user |
| viewer | viewer | viewer |

### Files to Modify
- `src/types/auth.ts` - Add super-admin to UserRole type
- `src/store/slices/authSlice.ts` - Add mock super-admin account
- `src/components/layout/Sidebar.tsx` - Add Users navigation item (super-admin only)
- `src/App.tsx` - Add /dashboard/users route with protection

### Files to Create
- `src/hooks/usePermission.ts` - Permission checking hook
- `src/components/auth/ProtectedRoute.tsx` - Route guard component
- `src/components/auth/RoleGuard.tsx` - Conditional rendering component
- `src/pages/dashboard/Users.tsx` - Users management page
- `src/components/users/UserForm.tsx` - User create/edit form
- `src/components/users/UserDeleteDialog.tsx` - Delete confirmation dialog
- `src/store/slices/usersSlice.ts` - Users state management

## Working Set
- Branch: `main` (UNCONFIRMED - please verify)
- Key files: `src/types/auth.ts`, `src/store/slices/authSlice.ts`, `src/components/layout/Sidebar.tsx`, `src/App.tsx`
