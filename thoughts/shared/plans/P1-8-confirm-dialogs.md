# P1-8: Confirmation Dialogs Implementation Plan

**Goal:** Standardize on a single ConfirmDialog component and add confirmation dialogs to all destructive/important actions across the app.

**Architecture:** Keep `confirm-dialog.tsx` (kebab-case) which uses shadcn Dialog primitives with variant support (default/destructive/warning). Delete the inferior `ConfirmDialog.tsx` (PascalCase). Add confirmation dialogs to all 6 action areas identified.

**Design:** Based on code analysis - `confirm-dialog.tsx` already supports the required `variant` prop with 'destructive' (red/Trash2) and 'warning' (amber/AlertTriangle) options needed for the task.

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3  [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2, 2.3, 2.4, 2.5, 2.6  [components - depends on batch 1]
Batch 3 (parallel): 3.1, 3.2  [verification - depends on batch 2]
```

---

## Batch 1: Foundation (parallel - 3 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Delete ConfirmDialog.tsx (PascalCase)
**File:** `src/components/ui/ConfirmDialog.tsx` (DELETE)
**Test:** `src/components/ui/ConfirmDialog.test.tsx` (DELETE)
**Depends:** none

**Action:** Delete both files. The PascalCase version is inferior (custom modal, no variant support, no loading state).

```bash
rm src/components/ui/ConfirmDialog.tsx
rm src/components/ui/ConfirmDialog.test.tsx
```

**Verify:** `ls src/components/ui/ConfirmDialog.tsx` should fail (file doesn't exist)
**Commit:** `refactor(ui): remove duplicate ConfirmDialog.tsx (PascalCase)`

---

### Task 1.2: Create ConfirmDialog Test for confirm-dialog.tsx
**File:** `src/components/ui/confirm-dialog.test.tsx`
**Test:** same file
**Depends:** none

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('renders when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={() => {}}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when cancel button clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Test"
        description="Test"
        onConfirm={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows destructive variant with Trash2 icon', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete"
        description="Sure?"
        variant="destructive"
        onConfirm={() => {}}
      />
    );
    // Check for destructive styling - confirm button should have red styling
    const confirmButton = screen.getByText('Delete');
    expect(confirmButton).toBeInTheDocument();
  });

  it('shows warning variant with AlertTriangle icon', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Warning"
        description="Sure?"
        variant="warning"
        onConfirm={() => {}}
        confirmLabel="Proceed"
      />
    );
    const confirmButton = screen.getByText('Proceed');
    expect(confirmButton).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Test"
        description="Test"
        onConfirm={() => {}}
        loading={true}
      />
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('uses custom labels', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Custom"
        description="Test"
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('No, Keep')).toBeInTheDocument();
  });
});
```

**Verify:** `bun test src/components/ui/confirm-dialog.test.tsx`
**Commit:** `test(ui): add tests for confirm-dialog component`

---

### Task 1.3: Verify confirm-dialog.tsx Component (No Changes Needed)
**File:** `src/components/ui/confirm-dialog.tsx`
**Test:** `src/components/ui/confirm-dialog.test.tsx` (created in 1.2)
**Depends:** none

**Analysis:** The existing `confirm-dialog.tsx` already has everything needed:
- `variant` prop: 'default' | 'destructive' | 'warning'
- `open` / `onOpenChange` (standard Dialog pattern)
- `loading` state support
- Proper shadcn Dialog components
- CSS variables for theming

**No code changes required.** The component is ready to use.

**Verify:** `bun test src/components/ui/confirm-dialog.test.tsx`
**Commit:** none (no changes)

---

## Batch 2: Add Confirmation Dialogs (parallel - 6 implementers)

All tasks depend on Batch 1 completing (ConfirmDialog.tsx deleted, test created).

### Task 2.1: Add Delete Confirmation to AllScans.tsx
**File:** `src/pages/Dashboard/Scans/AllScans.tsx`
**Test:** `src/pages/Dashboard/Scans/AllScans.test.tsx`
**Depends:** 1.1, 1.2 (ConfirmDialog deleted, new test ready)

**Dialog Content:**
- **Single Delete:**
  - Title: "Delete Scan"
  - Description: "Are you sure you want to delete the scan for {target}? This action cannot be undone."
  - Confirm Label: "Delete"
  - Variant: "destructive"

- **Bulk Delete:**
  - Title: "Delete Multiple Scans"
  - Description: "Are you sure you want to delete {count} scans? This action cannot be undone."
  - Confirm Label: "Delete All"
  - Variant: "destructive"

```tsx
// Add to imports:
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Add to component state:
const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; scanId: string | null; target: string }>({ open: false, scanId: null, target: '' });
const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{ open: boolean; scanIds: string[] }>({ open: false, scanIds: [] });
const [selectedScans, setSelectedScans] = useState<string[]>([]);

// Add handler functions:
const handleDeleteClick = (scan: Scan) => {
  setDeleteDialog({ open: true, scanId: scan.id, target: scan.target });
};

const confirmDelete = () => {
  if (deleteDialog.scanId) {
    scanStore.deleteScan(deleteDialog.scanId);
    setDeleteDialog({ open: false, scanId: null, target: '' });
  }
};

const confirmBulkDelete = () => {
  bulkDeleteDialog.scanIds.forEach(id => scanStore.deleteScan(id));
  setSelectedScans([]);
  setBulkDeleteDialog({ open: false, scanIds: [] });
};

// Add to table row actions (inside <tbody> map):
<td className="py-3 px-4">
  <button
    className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
    style={{ color: 'var(--text-muted)' }}
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteClick(scan);
    }}
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
</td>

// Add bulk actions bar above table (after filter tabs, before table):
{selectedScans.length > 0 && (
  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
      {selectedScans.length} scan(s) selected
    </span>
    <Button
      variant="outline"
      className="border-red-500 text-red-600 hover:bg-red-50"
      onClick={() => setBulkDeleteDialog({ open: true, scanIds: selectedScans })}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete Selected
    </Button>
  </div>
)}

// Add checkbox column to table header and rows for bulk select:
// In <thead>:
<th className="text-left py-3 px-4 w-10">
  <input
    type="checkbox"
    checked={selectedScans.length === filteredScans.length && filteredScans.length > 0}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedScans(filteredScans.map(s => s.id));
      } else {
        setSelectedScans([]);
      }
    }}
    style={{ accentColor: 'var(--primary)' }}
  />
</th>

// In <tbody> row:
<td className="py-3 px-4">
  <input
    type="checkbox"
    checked={selectedScans.includes(scan.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedScans([...selectedScans, scan.id]);
      } else {
        setSelectedScans(selectedScans.filter(id => id !== scan.id));
      }
    }}
    onClick={(e) => e.stopPropagation()}
    style={{ accentColor: 'var(--primary)' }}
  />
</td>

// Add dialogs before closing </div>:
<ConfirmDialog
  open={deleteDialog.open}
  onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
  title="Delete Scan"
  description={`Are you sure you want to delete the scan for ${deleteDialog.target}? This action cannot be undone.`}
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={confirmDelete}
/>

<ConfirmDialog
  open={bulkDeleteDialog.open}
  onOpenChange={(open) => setBulkDeleteDialog({ ...bulkDeleteDialog, open })}
  title="Delete Multiple Scans"
  description={`Are you sure you want to delete ${bulkDeleteDialog.scanIds.length} scan(s)? This action cannot be undone.`}
  confirmLabel="Delete All"
  variant="destructive"
  onConfirm={confirmBulkDelete}
/>
```

**Also add Trash2 import:**
```tsx
import { Scan as ScanIcon, Trash2 } from 'lucide-react';
```

**Verify:** `bun test src/pages/Dashboard/Scans/AllScans.test.tsx`
**Commit:** `feat(scans): add confirmation dialogs for delete actions`

---

### Task 2.2: Add Delete Confirmation to Templates.tsx
**File:** `src/pages/Dashboard/Templates/Templates.tsx`
**Test:** `src/pages/Dashboard/Templates/Templates.test.tsx` (create if not exists)
**Depends:** 1.1, 1.2

**Dialog Content:**
- Title: "Delete Template"
- Description: "Are you sure you want to delete the template '{name}'? This action cannot be undone."
- Confirm Label: "Delete"
- Variant: "destructive"

```tsx
// Add to imports:
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Replace the window.confirm in handleDeleteTemplate (line ~386):
const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; templateId: string; templateName: string }>({ open: false, templateId: '', templateName: '' });

const handleDeleteTemplate = (id: string, name: string) => {
  setDeleteDialog({ open: true, templateId: id, templateName: name });
};

const confirmDelete = () => {
  setTemplates(templates.filter(t => t.id !== deleteDialog.templateId));
  setDeleteDialog({ open: false, templateId: '', templateName: '' });
};

// Update the onClick for delete button (line ~615):
onClick={() => handleDeleteTemplate(template.id, template.name)}

// Add dialog before closing </div>:
<ConfirmDialog
  open={deleteDialog.open}
  onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
  title="Delete Template"
  description={`Are you sure you want to delete the template '${deleteDialog.templateName}'? This action cannot be undone.`}
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={confirmDelete}
/>
```

**Verify:** `bun test src/pages/Dashboard/Templates/Templates.test.tsx`
**Commit:** `feat(templates): replace window.confirm with ConfirmDialog`

---

### Task 2.3: Add Delete Confirmation to TicketList.tsx and TicketDetail.tsx
**File:** `src/pages/Dashboard/Tickets/TicketList.tsx`
**Test:** `src/pages/Dashboard/Tickets/TicketList.test.tsx`
**Depends:** 1.1, 1.2

**Dialog Content (TicketList):**
- Title: "Delete Ticket"
- Description: "Are you sure you want to delete ticket {id}? This action cannot be undone."
- Confirm Label: "Delete"
- Variant: "destructive"

**Dialog Content (TicketDetail):**
- Title: "Delete Ticket"
- Description: "Are you sure you want to delete this ticket? This action cannot be undone."
- Confirm Label: "Delete"
- Variant: "destructive"

```tsx
// === TicketList.tsx changes ===
// Add to imports:
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2 } from 'lucide-react';

// Add state:
const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ticketId: string }>({ open: false, ticketId: '' });

// Add handler:
const handleDeleteClick = (ticketId: string) => {
  setDeleteDialog({ open: true, ticketId });
};

const confirmDelete = () => {
  // TODO: Implement actual delete logic via useTicket hook
  console.log('Delete ticket:', deleteDialog.ticketId);
  setDeleteDialog({ open: false, ticketId: '' });
};

// Add delete button to TicketCard or list actions (in the map function):
<button
  className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
  style={{ color: 'var(--text-muted)' }}
  onClick={() => handleDeleteClick(ticket.id)}
>
  <Trash2 className="w-3.5 h-3.5" />
</button>

// Add dialog:
<ConfirmDialog
  open={deleteDialog.open}
  onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
  title="Delete Ticket"
  description={`Are you sure you want to delete ticket ${deleteDialog.ticketId}? This action cannot be undone.`}
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={confirmDelete}
/>

// === TicketDetail.tsx changes ===
// Add to imports:
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, ArrowLeft } from 'lucide-react';

// Add state:
const [deleteDialog, setDeleteDialog] = useState(false);

// Add handler:
const handleDelete = () => {
  // TODO: Implement actual delete logic
  console.log('Delete ticket:', id);
  navigate('/dashboard/tickets');
};

// Add delete button in the actions div (after existing buttons, around line 67-71):
<Button 
  variant="outline"
  onClick={() => setDeleteDialog(true)}
  style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
>
  <Trash2 className="w-4 h-4 mr-2" />
  Delete Ticket
</Button>

// Add dialog before closing </div>:
<ConfirmDialog
  open={deleteDialog}
  onOpenChange={setDeleteDialog}
  title="Delete Ticket"
  description="Are you sure you want to delete this ticket? This action cannot be undone."
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

**Verify:** `bun test src/pages/Dashboard/Tickets/`
**Commit:** `feat(tickets): add confirmation dialogs for delete actions`

---

### Task 2.4: Add Logout Confirmation to Header.tsx
**File:** `src/components/layout/Header.tsx`
**Test:** `src/components/layout/Header.test.tsx`
**Depends:** 1.1, 1.2

**Dialog Content:**
- Title: "Confirm Logout"
- Description: "Are you sure you want to logout? You will need to login again to access the dashboard."
- Confirm Label: "Logout"
- Cancel Label: "Stay Logged In"
- Variant: "warning"

```tsx
// Add to imports:
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Add state after other useState calls (around line 44):
const [logoutDialog, setLogoutDialog] = useState(false);

// Add logout handler:
const handleLogout = () => {
  // TODO: Implement actual logout logic (clear tokens, redirect to login)
  console.log('Logout confirmed');
  setLogoutDialog(false);
};

// Update the Logout menu item (around line 209-212):
// Change from:
<a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150" style={{ color: 'var(--danger)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#f87171'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--danger)'; }}>
  <LogOut className="w-4 h-4" />
  Logout
</a>

// Change to:
<button
  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
  style={{ color: 'var(--danger)' }}
  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#f87171'; }}
  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--danger)'; }}
  onClick={() => setLogoutDialog(true)}
>
  <LogOut className="w-4 h-4" />
  Logout
</button>

// Add dialog before closing </header> (around line 217):
<ConfirmDialog
  open={logoutDialog}
  onOpenChange={setLogoutDialog}
  title="Confirm Logout"
  description="Are you sure you want to logout? You will need to login again to access the dashboard."
  confirmLabel="Logout"
  cancelLabel="Stay Logged In"
  variant="warning"
  onConfirm={handleLogout}
/>
```

**Verify:** `bun test src/components/layout/Header.test.tsx`
**Commit:** `feat(header): add confirmation dialog for logout action`

---

### Task 2.5: Add Clear Notifications Confirmation to Header.tsx
**File:** `src/components/layout/Header.tsx` (same file as 2.4)
**Test:** `src/components/layout/Header.test.tsx`
**Depends:** 2.4 (modifies same file)

**Dialog Content:**
- Title: "Clear All Notifications"
- Description: "Are you sure you want to clear all notifications? This action cannot be undone."
- Confirm Label: "Clear All"
- Cancel Label: "Cancel"
- Variant: "warning"

```tsx
// Add state (after logoutDialog state):
const [clearNotifDialog, setClearNotifDialog] = useState(false);

// Update the "Clear all" button (around line 127-135):
// Change from:
<button
  onClick={() => dispatch(clearNotifications())}
  className="text-xs transition-colors"
  style={{ color: 'var(--text-muted)' }}
  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
>
  Clear all
</button>

// Change to:
<button
  onClick={() => setClearNotifDialog(true)}
  className="text-xs transition-colors"
  style={{ color: 'var(--text-muted)' }}
  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
>
  Clear all
</button>

// Add handler:
const handleClearNotifications = () => {
  dispatch(clearNotifications());
  setClearNotifDialog(false);
};

// Add dialog (after logout ConfirmDialog):
<ConfirmDialog
  open={clearNotifDialog}
  onOpenChange={setClearNotifDialog}
  title="Clear All Notifications"
  description="Are you sure you want to clear all notifications? This action cannot be undone."
  confirmLabel="Clear All"
  variant="warning"
  onConfirm={handleClearNotifications}
/>
```

**Verify:** `bun test src/components/layout/Header.test.tsx`
**Commit:** `feat(header): add confirmation dialog for clearing notifications`

---

### Task 2.6: Verify TrashScans.tsx ConfirmDialog (Already Implemented)
**File:** `src/pages/Dashboard/Scans/TrashScans.tsx`
**Test:** `src/pages/Dashboard/Scans/TrashScans.test.tsx` (create)
**Depends:** 1.1, 1.2

**Analysis:** TrashScans.tsx already uses ConfirmDialog correctly:
- Imports from `@/components/ui/confirm-dialog` ✓
- Uses `variant="destructive"` ✓
- Has proper `open` / `onOpenChange` pattern ✓
- Has title, description, confirmLabel ✓

**Action:** Create test file to verify it works.

```tsx
// src/pages/Dashboard/Scans/TrashScans.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TrashScans } from './TrashScans';

describe('TrashScans', () => {
  it('renders trash scans page', () => {
    render(<TrashScans />);
    expect(screen.getByText('Trash')).toBeInTheDocument();
    expect(screen.getByText('Deleted Scans')).toBeInTheDocument();
  });

  it('shows permanent delete dialog when delete button clicked', () => {
    render(<TrashScans />);
    
    // Click "Delete Forever" button
    const deleteButton = screen.getByText('Delete Forever');
    fireEvent.click(deleteButton);
    
    // Dialog should appear
    expect(screen.getByText('Permanently Delete Scans')).toBeInTheDocument();
  });

  it('shows empty trash dialog when empty trash clicked', () => {
    render(<TrashScans />);
    
    // Click "Empty Trash" button
    const emptyButton = screen.getByText('Empty Trash');
    fireEvent.click(emptyButton);
    
    // Dialog should appear with correct count
    expect(screen.getByText(/Permanently Delete Scans/)).toBeInTheDocument();
  });
});
```

**Verify:** `bun test src/pages/Dashboard/Scans/TrashScans.test.tsx`
**Commit:** `test(scans): add tests for TrashScans confirmation dialogs`

---

## Batch 3: Verification (parallel - 2 implementers)

### Task 3.1: Run All ConfirmDialog-Related Tests
**Depends:** 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

```bash
bun test src/components/ui/confirm-dialog.test.tsx
bun test src/pages/Dashboard/Scans/AllScans.test.tsx
bun test src/pages/Dashboard/Templates/Templates.test.tsx
bun test src/pages/Dashboard/Tickets/
bun test src/components/layout/Header.test.tsx
bun test src/pages/Dashboard/Scans/TrashScans.test.tsx
```

**Expected:** All tests pass

---

### Task 3.2: Visual Verification Checklist
**Depends:** All previous tasks

Manual verification steps:
1. **confirm-dialog.tsx is the only ConfirmDialog file**
   - [ ] `ls src/components/ui/ConfirmDialog.tsx` fails (deleted)
   - [ ] `ls src/components/ui/confirm-dialog.tsx` succeeds (kept)

2. **AllScans.tsx** - Delete single scan shows destructive dialog
3. **AllScans.tsx** - Bulk delete shows destructive dialog with count
4. **Templates.tsx** - Delete template shows destructive dialog (no more window.confirm)
5. **TicketList.tsx** - Delete ticket shows destructive dialog
6. **TicketDetail.tsx** - Delete ticket shows destructive dialog
7. **Header.tsx** - Logout shows warning dialog (amber)
8. **Header.tsx** - Clear notifications shows warning dialog (amber)
9. **TrashScans.tsx** - Empty trash still works with destructive dialog

**Verify:** Visual inspection in browser at `http://localhost:5173`
**Commit:** `chore: verification complete for P1-8 confirmation dialogs`

---

## Summary

| Task | File | Action | Dialog Variant |
|------|------|--------|----------------|
| 1.1 | `ConfirmDialog.tsx` | DELETE | - |
| 1.2 | `confirm-dialog.test.tsx` | CREATE | - |
| 1.3 | `confirm-dialog.tsx` | NO CHANGE | - |
| 2.1 | `AllScans.tsx` | MODIFY | destructive |
| 2.2 | `Templates.tsx` | MODIFY | destructive |
| 2.3 | `TicketList.tsx`, `TicketDetail.tsx` | MODIFY | destructive |
| 2.4 | `Header.tsx` | MODIFY | warning |
| 2.5 | `Header.tsx` | MODIFY | warning |
| 2.6 | `TrashScans.test.tsx` | CREATE TEST | - |

**Total micro-tasks:** 10 (3 foundation + 6 implementation + 2 verification)
**Estimated parallel implementers:** 6-8 (batches of 3-6)
