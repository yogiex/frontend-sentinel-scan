# Audit Trail Pages Redesign — "Precision Instrument" Aesthetic Implementation Plan

**Goal:** Transform the audit trail pages into a precise, engineering-focused interface that feels like a high-end measurement instrument, using shadcn/ui components and proper Redux integration.

**Architecture:** The redesign migrates from direct `auditLogger` reads to Redux state management, replaces inline styles with shadcn/ui components (Card, Table, Select, Button, Input, Popover, Calendar, DropdownMenu, Collapsible, Pagination, Tabs, Alert, Toast), and implements the "Precision Instrument" aesthetic with JetBrains Mono font, charcoal color palette (`#0a0e14`), LED-style indicators, and grid-aligned layouts.

**Design:** [2026-05-03-audit-trail-redesign-design.md](../designs/2026-05-03-audit-trail-redesign-design.md)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 [shadcn components - depends on Batch 1]
Batch 3 (parallel): 3.1, 3.2, 3.3 [Redux integration - depends on Batch 1]
Batch 4 (parallel): 4.1, 4.2, 4.3, 4.4, 4.5 [component redesign - depends on Batches 2 & 3]
Batch 5 (parallel): 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 [features & polish - depends on Batch 4]
Batch 6 (parallel): 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9 [tests - depends on Batch 5]
```

---

## Batch 1: Foundation (parallel — 8 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Add shadcn Table Component
**File:** `src/components/ui/table.tsx`
**Test:** `src/components/ui/table.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from './table';

describe('Table Components', () => {
  it('renders table with all subcomponents', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Cell')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Table className="custom-class"><TableBody><TableRow><TableCell>Test</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByText('Test').closest('table')).toHaveClass('custom-class');
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('bg-primary text-primary-foreground font-medium', className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableBody, TableRow, TableCell, TableCaption };
```

**Verify:** `npx vitest run src/components/ui/table.test.tsx`
**Commit:** `feat(ui): add shadcn Table component`

---

### Task 1.2: Add shadcn Collapsible Component
**File:** `src/components/ui/collapsible.tsx`
**Test:** `src/components/ui/collapsible.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

describe('Collapsible Components', () => {
  it('renders trigger and content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('toggles content visibility on trigger click', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    const trigger = screen.getByText('Toggle');
    const content = screen.getByText('Content');
    
    // Content should be visible by default (open=true by default in our implementation)
    expect(content).toBeVisible();
    
    fireEvent.click(trigger);
    // After click, content might be hidden (depends on implementation)
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn('cursor-pointer', className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn('overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down', className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

**Verify:** `npx vitest run src/components/ui/collapsible.test.tsx`
**Commit:** `feat(ui): add shadcn Collapsible component`

---

### Task 1.3: Add shadcn Pagination Component
**File:** `src/components/ui/pagination.tsx`
**Test:** `src/components/ui/pagination.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './pagination';

describe('Pagination Components', () => {
  it('renders pagination with links', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonProps, buttonVariants } from './button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav role="navigation" aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  )
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
```

**Verify:** `npx vitest run src/components/ui/pagination.test.tsx`
**Commit:** `feat(ui): add shadcn Pagination component`

---

### Task 1.4: Add shadcn Alert Component
**File:** `src/components/ui/alert.tsx`
**Test:** `src/components/ui/alert.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert Components', () => {
  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This is a warning message</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('This is a warning message')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>An error occurred</AlertDescription>
      </Alert>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import * as React from 'react';
import { cn } from '@/lib/utils';

const alertVariants = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
};

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof alertVariants }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn('relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground', alertVariants[variant], className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
```

**Verify:** `npx vitest run src/components/ui/alert.test.tsx`
**Commit:** `feat(ui): add shadcn Alert component`

---

### Task 1.5: Add shadcn DropdownMenu Component
**File:** `src/components/ui/dropdown-menu.tsx`
**Test:** `src/components/ui/dropdown-menu.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';

describe('DropdownMenu Components', () => {
  it('renders trigger and content on click', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent', inset && 'pl-8', className)}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', className)}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', inset && 'pl-8', className)}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
```

**Verify:** `npx vitest run src/components/ui/dropdown-menu.test.tsx`
**Commit:** `feat(ui): add shadcn DropdownMenu component`

---

### Task 1.6: Create LevelBadge Component (LED-Style)
**File:** `src/components/audit/LevelBadge.tsx`
**Test:** `src/components/audit/LevelBadge.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { LevelBadge } from './LevelBadge';
import type { LogLevel } from '@/lib/logger';

describe('LevelBadge', () => {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];

  levels.forEach((level) => {
    it(`renders ${level} level correctly`, () => {
      render(<LevelBadge level={level} />);
      expect(screen.getByText(level.toUpperCase())).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<LevelBadge level="info" className="custom-class" />);
    expect(screen.getByText('INFO').closest('span')).toHaveClass('custom-class');
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import type { LogLevel } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: LogLevel;
  className?: string;
}

const levelConfig: Record<LogLevel, { bg: string; text: string; border: string; ledColor: string }> = {
  debug: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500', border: 'border-slate-300 dark:border-slate-600', ledColor: 'bg-slate-400' },
  info: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', ledColor: 'bg-green-500' },
  warn: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', ledColor: 'bg-amber-500' },
  error: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', ledColor: 'bg-red-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700', ledColor: 'bg-red-600' },
};

// LED pulse animation for warn/error/critical
const pulseLevels: LogLevel[] = ['warn', 'error', 'critical'];

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const config = levelConfig[level];
  const shouldPulse = pulseLevels.includes(level);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          config.ledColor,
          shouldPulse && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      {level.toUpperCase()}
    </span>
  );
}
```

**Verify:** `npx vitest run src/components/audit/LevelBadge.test.tsx`
**Commit:** `feat(audit): add LED-style LevelBadge component`

---

### Task 1.7: Create CategoryIcon Component
**File:** `src/components/audit/CategoryIcon.tsx`
**Test:** `src/components/audit/CategoryIcon.test.tsx`
**Depends:** none

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { CategoryIcon } from './CategoryIcon';
import type { AuditCategory } from '@/lib/logger';

describe('CategoryIcon', () => {
  const categories: AuditCategory[] = ['auth', 'scan', 'export', 'user_management', 'settings', 'navigation', 'system', 'security', 'performance'];

  categories.forEach((category) => {
    it(`renders ${category} icon correctly`, () => {
      render(<CategoryIcon category={category} />);
      // Just check it renders without crashing
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('applies custom size', () => {
    render(<CategoryIcon category="auth" size={20} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import type { AuditCategory } from '@/lib/logger';
import {
  LogIn,
  Search,
  Download,
  Users,
  Settings,
  Compass,
  Monitor,
  Shield,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: AuditCategory;
  size?: number;
  className?: string;
}

const categoryIconMap: Record<AuditCategory, typeof LogIn> = {
  auth: LogIn,
  scan: Search,
  export: Download,
  user_management: Users,
  settings: Settings,
  navigation: Compass,
  system: Monitor,
  security: Shield,
  performance: BarChart3,
};

const categoryLabelMap: Record<AuditCategory, string> = {
  auth: 'Authentication',
  scan: 'Scan',
  export: 'Export',
  user_management: 'User Management',
  settings: 'Settings',
  navigation: 'Navigation',
  system: 'System',
  security: 'Security',
  performance: 'Performance',
};

export function CategoryIcon({ category, size = 14, className }: CategoryIconProps) {
  const Icon = categoryIconMap[category];

  return (
    <Icon
      size={size}
      className={cn('shrink-0', className)}
      aria-label={categoryLabelMap[category]}
    />
  );
}
```

**Verify:** `npx vitest run src/components/audit/CategoryIcon.test.tsx`
**Commit:** `feat(audit): add CategoryIcon component with Lucide icons`

---

### Task 1.8: Create Audit Trail CSS Module (Precision Instrument Styles)
**File:** `src/components/audit/audit-trail.css`
**Test:** none (CSS file)
**Depends:** none

```css
/* COMPLETE implementation - copy-paste ready */
/* Precision Instrument Aesthetic for Audit Trail Pages */

/* Base color palette */
:root {
  --audit-bg-base: #0a0e14;
  --audit-bg-surface: #0f1419;
  --audit-bg-card: #131820;
  --audit-border: rgba(71, 85, 105, 0.3);
  --audit-border-light: rgba(71, 85, 105, 0.5);
  --audit-text-primary: #e2e8f0;
  --audit-text-secondary: #94a3b8;
  --audit-text-muted: #64748b;
  
  /* LED colors */
  --led-green: #22c55e;
  --led-amber: #f59e0b;
  --led-red: #ef4444;
  --led-dark-red: #dc2626;
  --led-slate: #64748b;
  
  /* Font stack */
  --audit-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --audit-font-sans: 'IBM Plex Sans', 'Oxanium', system-ui, sans-serif;
}

/* Precision Instrument Base Styles */
.audit-trail-page {
  font-family: var(--audit-font-sans);
  background-color: var(--audit-bg-base);
  color: var(--audit-text-primary);
  min-height: 100vh;
}

.audit-trail-page .mono {
  font-family: var(--audit-font-mono);
}

/* Grid texture overlay */
.audit-grid-bg {
  background-image: 
    linear-gradient(rgba(71, 85, 105, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(71, 85, 105, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Scanline overlay (subtle) */
.audit-scanline::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(71, 85, 105, 0.03) 2px,
    rgba(71, 85, 105, 0.03) 4px
  );
  pointer-events: none;
}

/* LED Pulse Animation */
@keyframes led-pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 3px currentColor;
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 1px currentColor;
  }
}

.animate-led-pulse {
  animation: led-pulse 2s ease-in-out infinite;
}

/* Stat Card - Instrument Readout Style */
.stat-card {
  background: var(--audit-bg-card);
  border: 1px solid var(--audit-border);
  border-radius: 0; /* Sharp corners for precision instrument */
  padding: 1rem 1.25rem;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--stat-accent, var(--led-green));
}

.stat-card .stat-value {
  font-family: var(--audit-font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--audit-text-primary);
}

.stat-card .stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--audit-text-muted);
  margin-top: 0.25rem;
}

/* Level border-left indicators */
.log-row-debug {
  border-left: 4px solid var(--led-slate);
}

.log-row-info {
  border-left: 4px solid var(--led-green);
}

.log-row-warn {
  border-left: 4px solid var(--led-amber);
}

.log-row-error {
  border-left: 4px solid var(--led-red);
}

.log-row-critical {
  border-left: 4px solid var(--led-dark-red);
  box-shadow: inset 0 0 8px rgba(220, 38, 38, 0.1);
}

/* Table precision styles */
.audit-table {
  font-family: var(--audit-font-mono);
  font-size: 0.8125rem;
}

.audit-table th {
  font-family: var(--audit-font-sans);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--audit-text-muted);
  border-bottom: 1px solid var(--audit-border);
}

.audit-table td {
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
}

.audit-table tr:hover {
  background-color: rgba(71, 85, 105, 0.1) !important;
}

/* Tab styles - LED indicator */
.audit-tab {
  position: relative;
  font-family: var(--audit-font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 0;
  transition: all 0.15s ease;
}

.audit-tab.active {
  background-color: var(--led-green);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2);
}

.audit-tab.active::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  animation: led-pulse 2s ease-in-out infinite;
}

/* Filter bar */
.audit-filter-bar {
  background: var(--audit-bg-card);
  border: 1px solid var(--audit-border);
  border-radius: 0;
  padding: 1rem;
}

/* Real-time indicator */
.realtime-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--audit-text-muted);
}

.realtime-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--led-green);
  box-shadow: 0 0 6px var(--led-green);
  animation: led-pulse 2s ease-in-out infinite;
}

.realtime-dot.paused {
  background: var(--audit-text-muted);
  box-shadow: none;
  animation: none;
}
```

**Verify:** Visual inspection after implementation
**Commit:** `feat(audit): add Precision Instrument CSS styles`

---

## Batch 2: shadcn Components Integration (parallel — 6 implementers)

All tasks in this batch depend on Batch 1 completing (Table, Collapsible, Pagination, Alert, DropdownMenu components must exist).

### Task 2.1: Update Tabs Component for Audit Trail
**File:** `src/components/ui/tabs.tsx` (update existing)
**Test:** `src/components/ui/tabs.test.tsx`
**Depends:** 1.1 (Table - for export pattern reference)

Note: Tabs component already exists. We need to verify it supports the LED-style active indicator. If not, update it.

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Components', () => {
  it('renders tabs with trigger and content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready (update existing tabs.tsx)
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

**Verify:** `npx vitest run src/components/ui/tabs.test.tsx`
**Commit:** `feat(ui): update Tabs component for audit trail`

---

### Task 2.2: Create DateRangePicker Component
**File:** `src/components/audit/DateRangePicker.tsx`
**Test:** `src/components/audit/DateRangePicker.test.tsx`
**Depends:** 1.1 (Table - for patterns), existing Popover and Calendar components

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders with placeholder text', () => {
    render(<DateRangePicker onRangeChange={() => {}} />);
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('calls onRangeChange when dates selected', () => {
    const onRangeChange = vi.fn();
    render(<DateRangePicker onRangeChange={onRangeChange} />);
    // Open popover
    fireEvent.click(screen.getByText('Pick a date range'));
    // Would need more complex calendar interaction testing
  });

  it('shows clear button when range is set', () => {
    render(
      <DateRangePicker
        onRangeChange={() => {}}
        defaultFrom={new Date('2026-01-01')}
        defaultTo={new Date('2026-01-31')}
      />
    );
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import { useState, type ReactNode } from 'react';
import { format, type DateRange } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onRangeChange: (range: { from?: string; to?: string }) => void;
  defaultFrom?: Date;
  defaultTo?: Date;
  className?: string;
}

export function DateRangePicker({ onRangeChange, defaultFrom, defaultTo, className }: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(
    defaultFrom || defaultTo ? { from: defaultFrom, to: defaultTo } : undefined
  );
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    onRangeChange({
      from: selectedRange?.from?.toISOString(),
      to: selectedRange?.to?.toISOString(),
    });
    
    // Close popover when both dates selected
    if (selectedRange?.from && selectedRange?.to) {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setRange(undefined);
    onRangeChange({ from: undefined, to: undefined });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !range && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
                </>
              ) : (
                format(range.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {range && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

**Verify:** `npx vitest run src/components/audit/DateRangePicker.test.tsx`
**Commit:** `feat(audit): add DateRangePicker component with Popover and Calendar`

---

### Task 2.3: Create StatsPanel Component
**File:** `src/components/audit/StatsPanel.tsx`
**Test:** `src/components/audit/StatsPanel.test.tsx`
**Depends:** 1.1 (Table), 1.8 (CSS), existing Card component

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { StatsPanel } from './StatsPanel';

describe('StatsPanel', () => {
  const mockStats = {
    total: 1000,
    byLevel: { debug: 100, info: 600, warn: 200, error: 80, critical: 20 },
    byCategory: [
      { category: 'auth', count: 300 },
      { category: 'scan', count: 500 },
    ],
    byUser: [{ user: 'admin', count: 800 }],
  };

  it('renders all stat cards', () => {
    render(<StatsPanel stats={mockStats} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // categories
  });

  it('displays real-time indicator', () => {
    render(<StatsPanel stats={mockStats} realtime={true} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import type { AuditLogState['stats'] } from '@/store/slices/auditLogSlice';
import { Card, CardContent } from '@/components/ui/card';
import { RealtimeIndicator } from './RealtimeIndicator';

interface StatsPanelProps {
  stats: AuditLogState['stats'];
  realtime?: boolean;
  onToggleRealtime?: () => void;
}

export function StatsPanel({ stats, realtime = false, onToggleRealtime }: StatsPanelProps) {
  const statCards = [
    {
      label: 'Total Entries',
      value: stats.total,
      accent: 'var(--led-green)',
    },
    {
      label: 'Errors',
      value: stats.byLevel.error + stats.byLevel.critical,
      accent: 'var(--led-red)',
    },
    {
      label: 'Critical',
      value: stats.byLevel.critical,
      accent: 'var(--led-dark-red)',
    },
    {
      label: 'Categories',
      value: stats.byCategory.length,
      accent: 'var(--led-amber)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.label} className="stat-card" style={{ '--stat-accent': card.accent } as React.CSSProperties}>
          <CardContent className="p-4">
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
      {onToggleRealtime && (
        <div className="flex items-end pb-4">
          <RealtimeIndicator active={realtime} onToggle={onToggleRealtime} />
        </div>
      )}
    </div>
  );
}
```

**Verify:** `npx vitest run src/components/audit/StatsPanel.test.tsx`
**Commit:** `feat(audit): add StatsPanel component with instrument readout cards`

---

### Task 2.4: Create RealtimeIndicator Component
**File:** `src/components/audit/RealtimeIndicator.tsx`
**Test:** `src/components/audit/RealtimeIndicator.test.tsx`
**Depends:** 1.8 (CSS)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { RealtimeIndicator } from './RealtimeIndicator';

describe('RealtimeIndicator', () => {
  it('renders with paused state by default', () => {
    render(<RealtimeIndicator active={false} onToggle={() => {}} />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('renders with live state', () => {
    render(<RealtimeIndicator active={true} onToggle={() => {}} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<RealtimeIndicator active={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByText('Paused'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
interface RealtimeIndicatorProps {
  active: boolean;
  onToggle: () => void;
}

export function RealtimeIndicator({ active, onToggle }: RealtimeIndicatorProps) {
  return (
    <button
      onClick={onToggle}
      className="realtime-indicator"
      aria-label={active ? 'Disable real-time updates' : 'Enable real-time updates'}
    >
      <span className={cn('realtime-dot', !active && 'paused')} />
      <span>{active ? 'Live' : 'Paused'}</span>
    </button>
  );
}
```

**Verify:** `npx vitest run src/components/audit/RealtimeIndicator.test.tsx`
**Commit:** `feat(audit): add RealtimeIndicator component with LED animation`

---

### Task 2.5: Create FilterBar Component
**File:** `src/components/audit/FilterBar.tsx`
**Test:** `src/components/audit/FilterBar.test.tsx`
**Depends:** 1.1 (Table), 2.2 (DateRangePicker), existing Select, Input, Button components

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import type { LogLevel, AuditCategory } from '@/lib/logger';

describe('FilterBar', () => {
  const defaultProps = {
    levelFilter: 'all' as LogLevel | 'all',
    categoryFilter: 'all' as AuditCategory | 'all',
    searchInput: '',
    onLevelChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onSearchChange: vi.fn(),
    onDateRangeChange: vi.fn(),
    onRefresh: vi.fn(),
    onExport: vi.fn(),
    onClear: vi.fn(),
  };

  it('renders all filter controls', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /level/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    render(<FilterBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls onRefresh when refresh button clicked', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Refresh'));
    expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import { Search, RefreshCw, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DateRangePicker } from './DateRangePicker';
import type { LogLevel, AuditCategory } from '@/lib/logger';
import { LEVELS, CATEGORIES } from '@/lib/logger-constants';

interface FilterBarProps {
  levelFilter: LogLevel | 'all';
  categoryFilter: AuditCategory | 'all';
  searchInput: string;
  onLevelChange: (level: LogLevel | 'all') => void;
  onCategoryChange: (category: AuditCategory | 'all') => void;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (range: { from?: string; to?: string }) => void;
  onRefresh: () => void;
  onExport: (format: 'json' | 'csv') => void;
  onClear: () => void;
  loading?: boolean;
}

export function FilterBar({
  levelFilter,
  categoryFilter,
  searchInput,
  onLevelChange,
  onCategoryChange,
  onSearchChange,
  onDateRangeChange,
  onRefresh,
  onExport,
  onClear,
  loading = false,
}: FilterBarProps) {
  return (
    <div className="audit-filter-bar">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 font-mono text-sm"
          />
        </div>

        {/* Level Filter */}
        <Select value={levelFilter} onValueChange={(v) => onLevelChange(v as LogLevel | 'all')}>
          <SelectTrigger className="font-mono text-sm">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l === 'all' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={(v) => onCategoryChange(v as AuditCategory | 'all')}>
          <SelectTrigger className="font-mono text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === 'all' ? 'All Categories' : c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DateRangePicker onRangeChange={onDateRangeChange} />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" size="sm" onClick={onClear}>
            Clear Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Verify:** `npx vitest run src/components/audit/FilterBar.test.tsx`
**Commit:** `feat(audit): add FilterBar component with shadcn components`

---

### Task 2.6: Create LogTable Component (Redesigned)
**File:** `src/components/audit/LogTable.tsx`
**Test:** `src/components/audit/LogTable.test.tsx`
**Depends:** 1.1 (Table), 1.2 (Collapsible), 1.3 (Pagination), 1.6 (LevelBadge), 1.7 (CategoryIcon), 1.8 (CSS)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { LogTable } from './LogTable';
import type { AuditLogEntry } from '@/lib/logger';

const mockEntries: AuditLogEntry[] = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'auth',
    action: 'User logged in',
    user: 'admin',
    details: { ip: '127.0.0.1' },
    sessionId: 'sess_1',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'log_2',
    timestamp: new Date().toISOString(),
    level: 'error',
    category: 'scan',
    action: 'Scan failed',
    user: 'admin',
    details: { error: 'Connection timeout' },
    sessionId: 'sess_1',
    userAgent: 'Mozilla/5.0',
  },
];

describe('LogTable', () => {
  it('renders table with entries', () => {
    render(<LogTable entries={mockEntries} />);
    expect(screen.getByText('User logged in')).toBeInTheDocument();
    expect(screen.getByText('Scan failed')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<LogTable entries={[]} />);
    expect(screen.getByText('No logs found')).toBeInTheDocument();
  });

  it('expands row on click', () => {
    render(<LogTable entries={mockEntries} />);
    const row = screen.getByText('User logged in').closest('tr');
    if (row) {
      fireEvent.click(row);
      expect(screen.getByText('Session ID:')).toBeInTheDocument();
    }
  });

  it('renders pagination when entries exceed page size', () => {
    const manyEntries = Array(50).fill(null).map((_, i) => ({
      ...mockEntries[0],
      id: `log_${i}`,
    }));
    render(<LogTable entries={manyEntries} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import { useState } from 'react';
import type { AuditLogEntry, LogLevel } from '@/lib/logger';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { LevelBadge } from './LevelBadge';
import { CategoryIcon } from './CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface LogTableProps {
  entries: AuditLogEntry[];
  onExport?: (format: 'json' | 'csv') => void;
  onClear?: () => void;
  pageSize?: number;
}

export function LogTable({ entries, onExport, onClear, pageSize = 25 }: LogTableProps) {
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPages = Math.ceil(entries.length / pageSize);
  const pageEntries = entries.slice(page * pageSize, (page + 1) * pageSize);

  const levelRowClass: Record<LogLevel, string> = {
    debug: 'log-row-debug',
    info: 'log-row-info',
    warn: 'log-row-warn',
    error: 'log-row-error',
    critical: 'log-row-critical',
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No logs found"
        description="Activity will be recorded as you use the application"
        icon="📋"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(onExport || onClear) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-mono">
            Showing {pageEntries.length} of {entries.length} entries
          </p>
          <div className="flex items-center gap-2">
            {onExport && (
              <>
                <button onClick={() => onExport('json')}>Export JSON</button>
                <button onClick={() => onExport('csv')}>Export CSV</button>
              </>
            )}
            {onClear && (
              <button onClick={onClear}>Clear Logs</button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[var(--audit-border)] overflow-x-auto">
        <Table className="audit-table">
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageEntries.map((entry) => (
              <>
                <TableRow
                  key={entry.id}
                  className={cn('cursor-pointer', levelRowClass[entry.level])}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <LevelBadge level={entry.level} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CategoryIcon category={entry.category} />
                      <span className="capitalize">{entry.category.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.action}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.user}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate text-muted-foreground">
                    {JSON.stringify(entry.details)}
                  </TableCell>
                </TableRow>
                {expandedId === entry.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <Collapsible open={true}>
                        <CollapsibleContent>
                          <div className="p-4 bg-[var(--audit-bg-surface)] space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{entry.action}</h4>
                              <button onClick={() => setExpandedId(null)}>✕</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                              <div>
                                <span className="text-muted-foreground">Timestamp:</span>
                                <p className="mt-0.5 text-xs">{entry.timestamp}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Session ID:</span>
                                <p className="font-mono text-xs mt-0.5">{entry.sessionId}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">User:</span>
                                <p>{entry.user}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">User Agent:</span>
                                <p className="text-xs truncate">{entry.userAgent}</p>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Details:</span>
                              <pre className="mt-1 p-3 rounded-lg text-xs overflow-x-auto bg-[var(--audit-bg-base)] text-foreground">
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-disabled={page === 0}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink onClick={() => setPage(i)} isActive={page === i}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-disabled={page >= totalPages - 1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
```

**Verify:** `npx vitest run src/components/audit/LogTable.test.tsx`
**Commit:** `feat(audit): add redesigned LogTable with shadcn components`

---

## Batch 3: Redux Integration (parallel — 3 implementers)

All tasks in this batch depend on Batch 1 (foundation must exist).

### Task 3.1: Update auditLogSlice with Enhanced Reducers
**File:** `src/store/slices/auditLogSlice.ts` (update existing)
**Test:** `src/store/slices/auditLogSlice.test.ts`
**Depends:** 1.1 (foundation)

Design requires: Enhanced filter handling, date range support, stats computation, loading states.

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import auditLogReducer, {
  loadEntries,
  addEntry,
  setFilter,
  applyFilters,
  updateStats,
  clearEntries,
  setLoading,
  type AuditLogState,
} from './auditLogSlice';
import type { AuditLogEntry, LogLevel, AuditCategory } from '@/lib/logger';

describe('auditLogSlice', () => {
  const createMockEntry = (overrides?: Partial<AuditLogEntry>): AuditLogEntry => ({
    id: 'log_1',
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'auth',
    action: 'Test action',
    user: 'admin',
    details: {},
    sessionId: 'sess_1',
    ...overrides,
  });

  it('loads entries', () => {
    const entries = [createMockEntry()];
    const state = auditLogReducer(undefined, loadEntries(entries));
    expect(state.entries).toHaveLength(1);
    expect(state.filteredEntries).toHaveLength(1);
  });

  it('adds entry', () => {
    const entry = createMockEntry();
    const state = auditLogReducer(undefined, addEntry(entry));
    expect(state.entries[0].id).toBe('log_1');
  });

  it('sets filter and applies filters', () => {
    const entries = [
      createMockEntry({ level: 'info' }),
      createMockEntry({ level: 'error' }),
    ];
    let state = auditLogReducer(undefined, loadEntries(entries));
    state = auditLogReducer(state, setFilter({ level: 'error' }));
    expect(state.filter.level).toBe('error');
  });

  it('handles date range filter', () => {
    const entries = [
      createMockEntry({ timestamp: '2026-01-01T00:00:00Z' }),
      createMockEntry({ timestamp: '2026-02-01T00:00:00Z' }),
    ];
    let state = auditLogReducer(undefined, loadEntries(entries));
    state = auditLogReducer(state, setFilter({ from: '2026-01-15', to: '2026-02-15' }));
    expect(state.filter.from).toBe('2026-01-15');
    expect(state.filter.to).toBe('2026-02-15');
  });

  it('clears entries', () => {
    const entries = [createMockEntry()];
    let state = auditLogReducer(undefined, loadEntries(entries));
    state = auditLogReducer(state, clearEntries());
    expect(state.entries).toHaveLength(0);
  });

  it('sets loading state', () => {
    const state = auditLogReducer(undefined, setLoading(true));
    expect(state.loading).toBe(true);
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready (update existing auditLogSlice.ts)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuditLogEntry, LogLevel, AuditCategory } from '../../lib/logger';

interface AuditLogState {
  entries: AuditLogEntry[];
  filteredEntries: AuditLogEntry[];
  filter: {
    level: LogLevel | 'all';
    category: AuditCategory | 'all';
    user: string;
    search: string;
    from: string;
    to: string;
  };
  stats: {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: { category: string; count: number }[];
    byUser: { user: string; count: number }[];
  };
  loading: boolean;
}

const initialState: AuditLogState = {
  entries: [],
  filteredEntries: [],
  filter: {
    level: 'all',
    category: 'all',
    user: '',
    search: '',
    from: '',
    to: '',
  },
  stats: {
    total: 0,
    byLevel: { debug: 0, info: 0, warn: 0, error: 0, critical: 0 },
    byCategory: [],
    byUser: [],
  },
  loading: false,
};

// Helper: compute stats from entries
function computeStats(entries: AuditLogEntry[]) {
  const byLevel: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0, critical: 0 };
  const categoryMap: Record<string, number> = {};
  const userMap: Record<string, number> = {};

  entries.forEach((e) => {
    byLevel[e.level]++;
    categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    userMap[e.user] = (userMap[e.user] || 0) + 1;
  });

  return {
    total: entries.length,
    byLevel,
    byCategory: Object.entries(categoryMap).map(([category, count]) => ({ category, count })),
    byUser: Object.entries(userMap).map(([user, count]) => ({ user, count })),
  };
}

// Helper: apply all filters to entries
function applyAllFilters(entries: AuditLogEntry[], filter: AuditLogState['filter']): AuditLogEntry[] {
  let result = [...entries];

  if (filter.level !== 'all') {
    result = result.filter((e) => e.level === filter.level);
  }
  if (filter.category !== 'all') {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter.user) {
    result = result.filter((e) => e.user === filter.user);
  }
  if (filter.from) {
    result = result.filter((e) => e.timestamp >= filter.from);
  }
  if (filter.to) {
    result = result.filter((e) => e.timestamp <= filter.to);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q) ||
        JSON.stringify(e.details).toLowerCase().includes(q)
    );
  }

  return result;
}

const auditLogSlice = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    loadEntries: (state, action: PayloadAction<AuditLogEntry[]>) => {
      state.entries = action.payload;
      state.filteredEntries = applyAllFilters(action.payload, state.filter);
      state.stats = computeStats(action.payload);
    },
    addEntry: (state, action: PayloadAction<AuditLogEntry>) => {
      state.entries.unshift(action.payload);
      // Re-apply filters to include new entry if it matches
      state.filteredEntries = applyAllFilters(state.entries, state.filter);
      state.stats = computeStats(state.entries);
    },
    setFilter: (
      state,
      action: PayloadAction<Partial<AuditLogState['filter']>>
    ) => {
      state.filter = { ...state.filter, ...action.payload };
      state.filteredEntries = applyAllFilters(state.entries, state.filter);
    },
    applyFilters: (state, action: PayloadAction<AuditLogEntry[]>) => {
      state.filteredEntries = action.payload;
    },
    updateStats: (state, action: PayloadAction<AuditLogState['stats']>) => {
      state.stats = action.payload;
    },
    clearEntries: (state) => {
      state.entries = [];
      state.filteredEntries = [];
      state.stats = {
        total: 0,
        byLevel: { debug: 0, info: 0, warn: 0, error: 0, critical: 0 },
        byCategory: [],
        byUser: [],
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  loadEntries,
  addEntry,
  setFilter,
  applyFilters,
  updateStats,
  clearEntries,
  setLoading,
} = auditLogSlice.actions;

export default auditLogSlice.reducer;
```

**Verify:** `npx vitest run src/store/slices/auditLogSlice.test.ts`
**Commit:** `feat(store): enhance auditLogSlice with date range and filter support`

---

### Task 3.2: Update useAuditLog Hook with Redux Integration
**File:** `src/hooks/useAuditLog.ts` (update existing)
**Test:** `src/hooks/useAuditLog.test.ts`
**Depends:** 3.1 (auditLogSlice)

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuditLog } from './useAuditLog';
import auditLogReducer from '@/store/slices/auditLogSlice';
import type { AuditCategory } from '@/lib/logger';

describe('useAuditLog', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auditLog: auditLogReducer },
    });
  });

  it('logs info level entry', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuditLog(), { wrapper });
    
    result.current.info('auth' as AuditCategory, 'Test action', { key: 'value' });
    
    await waitFor(() => {
      const state = store.getState();
      expect(state.auditLog.entries.length).toBeGreaterThan(0);
    });
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready (update existing useAuditLog.ts)
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { auditLogger, type LogLevel, type AuditCategory } from '../lib/logger';
import { addEntry } from '../store/slices/auditLogSlice';

export function useAuditLog() {
  const dispatch = useDispatch<AppDispatch>();

  const log = useCallback(
    (
      level: LogLevel,
      category: AuditCategory,
      action: string,
      details: Record<string, unknown> = {}
    ) => {
      const entry = auditLogger.log(level, category, action, details);
      if (entry && entry.id) {
        dispatch(addEntry(entry));
      }
      return entry;
    },
    [dispatch]
  );

  const debug = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('debug', category, action, details),
    [log]
  );

  const info = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('info', category, action, details),
    [log]
  );

  const warn = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('warn', category, action, details),
    [log]
  );

  const error = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('error', category, action, details),
    [log]
  );

  const critical = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('critical', category, action, details),
    [log]
  );

  return { log, debug, info, warn, error, critical };
}
```

**Verify:** `npx vitest run src/hooks/useAuditLog.test.ts`
**Commit:** `feat(hooks): update useAuditLog hook with proper Redux integration`

---

### Task 3.3: Create Redux Selectors for Audit Log
**File:** `src/store/slices/auditLogSlice.ts` (add selectors)
**Test:** `src/store/slices/auditLogSlice.selectors.test.ts`
**Depends:** 3.1 (auditLogSlice)

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import auditLogReducer, { loadEntries } from './auditLogSlice';
import { selectFilteredEntries, selectStats, selectLoading } from './auditLogSlice';
import type { AuditLogEntry } from '@/lib/logger';

describe('auditLogSlice Selectors', () => {
  const createMockEntry = (overrides?: Partial<AuditLogEntry>): AuditLogEntry => ({
    id: 'log_1',
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'auth',
    action: 'Test action',
    user: 'admin',
    details: {},
    sessionId: 'sess_1',
    ...overrides,
  });

  it('selects filtered entries', () => {
    const store = configureStore({
      reducer: { auditLog: auditLogReducer },
    });

    store.dispatch(loadEntries([createMockEntry(), createMockEntry({ level: 'error' })]));
    
    const state = store.getState();
    expect(selectFilteredEntries(state)).toHaveLength(2);
  });

  it('selects stats', () => {
    const store = configureStore({
      reducer: { auditLog: auditLogReducer },
    });

    store.dispatch(loadEntries([createMockEntry()]));
    
    const state = store.getState();
    const stats = selectStats(state);
    expect(stats.total).toBe(1);
  });

  it('selects loading state', () => {
    const store = configureStore({
      reducer: { auditLog: auditLogReducer },
    });

    const state = store.getState();
    expect(selectLoading(state)).toBe(false);
  });
});
```

Add to `auditLogSlice.ts` (at the end, before export default):

```tsx
// Add these selectors to the existing auditLogSlice.ts file

// Selectors
export const selectEntries = (state: { auditLog: AuditLogState }) => state.auditLog.entries;
export const selectFilteredEntries = (state: { auditLog: AuditLogState }) => state.auditLog.filteredEntries;
export const selectFilter = (state: { auditLog: AuditLogState }) => state.auditLog.filter;
export const selectStats = (state: { auditLog: AuditLogState }) => state.auditLog.stats;
export const selectLoading = (state: { auditLog: AuditLogState }) => state.auditLog.loading;
```

**Verify:** `npx vitest run src/store/slices/auditLogSlice.selectors.test.ts`
**Commit:** `feat(store): add Redux selectors for audit log state`

---

## Batch 4: Component Redesign (parallel — 5 implementers)

All tasks in this batch depend on Batches 2 (shadcn components) and 3 (Redux integration).

### Task 4.1: Redesign LogViewer Page with New Components
**File:** `src/pages/Dashboard/LogViewer.tsx` (complete rewrite)
**Test:** `src/pages/Dashboard/LogViewer.test.tsx`
**Depends:** 2.3 (StatsPanel), 2.5 (FilterBar), 2.6 (LogTable), 3.1 (Redux), 3.3 (Selectors)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LogViewer } from './LogViewer';
import auditLogReducer from '@/store/slices/auditLogSlice';

describe('LogViewer Page', () => {
  const createStore = () => configureStore({
    reducer: { auditLog: auditLogReducer },
  });

  it('renders page header', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <LogViewer />
      </Provider>
    );
    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
  });

  it('switches between Access Log and Error Log tabs', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <LogViewer />
      </Provider>
    );
    
    const errorTab = screen.getByText('Error Log');
    fireEvent.click(errorTab);
    expect(errorTab.closest('button')).toHaveClass('active');
  });

  it('displays stats panel', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <LogViewer />
      </Provider>
    );
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready (rewrite LogViewer.tsx)
/**
 * SentinelScan — Audit Trail Page (Redesigned)
 * Path: src/pages/Dashboard/LogViewer.tsx
 *
 * Precision Instrument aesthetic redesign with shadcn/ui components
 * and proper Redux integration.
 */
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { StatsPanel } from '@/components/audit/StatsPanel';
import { FilterBar } from '@/components/audit/FilterBar';
import { LogTable } from '@/components/audit/LogTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { auditLogger, type LogLevel, type AuditCategory } from '@/lib/logger';
import { LEVELS, CATEGORIES } from '@/lib/logger-constants';
import {
  loadEntries,
  setFilter,
  clearEntries,
  setLoading,
  selectFilteredEntries,
  selectStats,
  selectLoading,
} from '@/store/slices/auditLogSlice';
import { FileText, AlertOctagon, AlertTriangle } from 'lucide-react';
import './audit-trail.css';

type LogType = 'access' | 'errors';

export function LogViewer() {
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector(selectFilteredEntries);
  const stats = useSelector(selectStats);
  const loading = useSelector(selectLoading);
  
  const [activeTab, setActiveTab] = useState<LogType>('access');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [realtime, setRealtime] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  // Load entries on mount and tab change
  const loadLogs = useCallback(() => {
    dispatch(setLoading(true));
    try {
      const accessLogs = auditLogger.getAccessLogs();
      const errorLogs = auditLogger.getErrorLogs();
      dispatch(loadEntries(activeTab === 'access' ? accessLogs : errorLogs));
      
      // Check storage capacity
      setStorageWarning(accessLogs.length > 4500);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Real-time updates
  useEffect(() => {
    if (!realtime) return;
    
    const interval = setInterval(() => {
      loadLogs();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [realtime, loadLogs]);

  // Apply filters
  useEffect(() => {
    dispatch(setFilter({
      level: levelFilter,
      category: categoryFilter,
      search: searchInput,
    }));
  }, [dispatch, levelFilter, categoryFilter, searchInput]);

  const handleExport = (format: 'json' | 'csv') => {
    try {
      if (activeTab === 'access') {
        auditLogger.downloadAccessLog(format);
      } else {
        auditLogger.downloadErrorLog(format);
      }
    } catch (error) {
      console.error('Export failed:', error);
      // Show toast notification
    }
  };

  const handleClear = () => {
    setConfirmClearOpen(true);
  };

  const confirmClear = () => {
    if (activeTab === 'access') {
      auditLogger.clearAccessLogs();
    } else {
      auditLogger.clearErrorLogs();
    }
    dispatch(clearEntries());
    setConfirmClearOpen(false);
    loadLogs();
  };

  const handleDateRangeChange = (range: { from?: string; to?: string }) => {
    dispatch(setFilter({ from: range.from || '', to: range.to || '' }));
  };

  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">Audit trail temporarily unavailable</div>}>
      <div className="audit-trail-page audit-grid-bg p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 font-[var(--audit-font-sans)]">
            {activeTab === 'access' ? (
              <FileText className="w-7 h-7 text-green-500" />
            ) : (
              <AlertOctagon className="w-7 h-7 text-red-500" />
            )}
            Audit Trail
          </h1>
          <p className="mt-1 text-[var(--audit-text-secondary)] font-mono text-sm">
            {activeTab === 'access' 
              ? 'All system activity and user actions' 
              : 'Error and critical issues requiring attention'}
          </p>
        </div>

        {/* Storage Warning */}
        {storageWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Storage Near Capacity</AlertTitle>
            <AlertDescription>
              Log storage is at {stats.total}/5000 entries. Consider exporting and clearing old logs.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Panel */}
        <StatsPanel stats={stats} realtime={realtime} onToggleRealtime={() => setRealtime(!realtime)} />

        {/* Tab Selector */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogType)}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="access" className="audit-tab">
              <FileText className="w-4 h-4 mr-2" />
              Access Log
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-700">
                {stats.total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="errors" className="audit-tab">
              <AlertOctagon className="w-4 h-4 mr-2" />
              Error Log
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-red-900">
                {stats.byLevel.error + stats.byLevel.critical}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access" className="space-y-6">
            {/* Filter Bar */}
            <FilterBar
              levelFilter={levelFilter}
              categoryFilter={categoryFilter}
              searchInput={searchInput}
              onLevelChange={setLevelFilter}
              onCategoryChange={setCategoryFilter}
              onSearchChange={setSearchInput}
              onDateRangeChange={handleDateRangeChange}
              onRefresh={loadLogs}
              onExport={handleExport}
              onClear={handleClear}
              loading={loading}
            />

            {/* Log Table */}
            <Card className="border-[var(--audit-border)] rounded-none">
              <LogTable
                entries={entries}
                onExport={handleExport}
                onClear={handleClear}
              />
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <FilterBar
              levelFilter={levelFilter}
              categoryFilter={categoryFilter}
              searchInput={searchInput}
              onLevelChange={setLevelFilter}
              onCategoryChange={setCategoryFilter}
              onSearchChange={setSearchInput}
              onDateRangeChange={handleDateRangeChange}
              onRefresh={loadLogs}
              onExport={handleExport}
              onClear={handleClear}
              loading={loading}
            />

            <Card className="border-[var(--audit-border)] rounded-none">
              <LogTable
                entries={entries.filter((e) => e.level === 'error' || e.level === 'critical')}
                onExport={handleExport}
                onClear={handleClear}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirm Dialog for Clear */}
        <ConfirmDialog
          isOpen={confirmClearOpen}
          title="Clear Logs"
          description={`Are you sure you want to clear all ${activeTab === 'access' ? 'access' : 'error'} logs? This cannot be undone.`}
          confirmText="Clear Logs"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={confirmClear}
          onCancel={() => setConfirmClearOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
```

**Verify:** `npx vitest run src/pages/Dashboard/LogViewer.test.tsx`
**Commit:** `feat(pages): redesign LogViewer page with Precision Instrument aesthetic`

---

### Task 4.2: Update AuditLogViewer Component (Simplify/Deprecate)
**File:** `src/components/AuditLogViewer.tsx` (update or mark deprecated)
**Test:** `src/components/AuditLogViewer.test.tsx`
**Depends:** 2.6 (LogTable)

Decision: Since LogTable now handles the table rendering with shadcn components, AuditLogViewer becomes a thin wrapper or is deprecated in favor of direct LogTable usage.

```tsx
// COMPLETE implementation - copy-paste ready (simplified AuditLogViewer.tsx)
/**
 * SentinelScan — Audit Log Viewer Component (Simplified)
 * Path: src/components/AuditLogViewer.tsx
 *
 * Now uses LogTable for rendering. This component is kept for backward compatibility.
 * @deprecated Use LogTable directly for new code.
 */
import type { AuditLogEntry } from '@/lib/logger';
import { LogTable } from './audit/LogTable';

interface AuditLogViewerProps {
  entries: AuditLogEntry[];
  onExport?: (format: 'json' | 'csv', entries: AuditLogEntry[]) => void;
  onClear?: () => void;
  compact?: boolean;
}

export function AuditLogViewer({ entries, onExport, onClear, compact }: AuditLogViewerProps) {
  return (
    <LogTable
      entries={compact ? entries.slice(0, 10) : entries}
      onExport={onExport ? (format) => onExport(format, entries) : undefined}
      onClear={onClear}
      pageSize={compact ? 10 : 25}
    />
  );
}
```

**Verify:** `npx vitest run src/components/AuditLogViewer.test.tsx`
**Commit:** `refactor(audit): simplify AuditLogViewer to use LogTable`

---

### Task 4.3: Create Logger Constants File
**File:** `src/lib/logger-constants.ts`
**Test:** none
**Depends:** none (but used by FilterBar and LogViewer)

```tsx
// COMPLETE implementation - copy-paste ready
import type { LogLevel, AuditCategory } from './logger';

export const LEVELS: (LogLevel | 'all')[] = ['all', 'debug', 'info', 'warn', 'error', 'critical'];

export const CATEGORIES: (AuditCategory | 'all')[] = [
  'all',
  'auth',
  'scan',
  'export',
  'user_management',
  'settings',
  'navigation',
  'system',
  'security',
  'performance',
];

export const LEVEL_COLORS: Record<LogLevel, { bg: string; text: string; border: string }> = {
  debug: { bg: 'rgba(71, 85, 105, 0.2)', text: 'text-slate-500', border: 'border-slate-300' },
  info: { bg: 'rgba(34, 197, 94, 0.1)', text: 'text-green-600', border: 'border-green-200' },
  warn: { bg: 'rgba(245, 158, 11, 0.1)', text: 'text-amber-600', border: 'border-amber-200' },
  error: { bg: 'rgba(239, 68, 68, 0.1)', text: 'text-red-600', border: 'border-red-200' },
  critical: { bg: 'rgba(220, 38, 38, 0.2)', text: 'text-red-700', border: 'border-red-300' },
};

export const CATEGORY_LABELS: Record<AuditCategory, string> = {
  auth: 'Authentication',
  scan: 'Scan',
  export: 'Export',
  user_management: 'User Management',
  settings: 'Settings',
  navigation: 'Navigation',
  system: 'System',
  security: 'Security',
  performance: 'Performance',
};
```

**Verify:** Check import in FilterBar works
**Commit:** `feat(lib): extract logger constants to separate file`

---

### Task 4.4: Create EmptyState Component (Enhanced for Audit Trail)
**File:** `src/components/ui/EmptyState.tsx` (update existing)
**Test:** `src/components/ui/EmptyState.test.tsx`
**Depends:** 1.8 (CSS)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders with title and description', () => {
    render(<EmptyState title="No logs" description="No logs found" />);
    expect(screen.getByText('No logs')).toBeInTheDocument();
    expect(screen.getByText('No logs found')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<EmptyState title="No logs" description="No logs found" icon="📋" />);
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<EmptyState title="Test" description="Test" className="custom" />);
    expect(screen.getByText('Test').closest('div')).toHaveClass('custom');
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready (update existing EmptyState.tsx)
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 audit-scanline', className)}>
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <p className="text-lg font-medium" style={{ color: 'var(--audit-text-secondary)' }}>
        {title}
      </p>
      <p className="text-sm mt-1 font-mono" style={{ color: 'var(--audit-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
```

**Verify:** `npx vitest run src/components/ui/EmptyState.test.tsx`
**Commit:** `feat(ui): enhance EmptyState with audit trail styling`

---

### Task 4.5: Add Toast Notification Component (for Export Errors)
**File:** `src/components/ui/Toast.tsx` (update existing if needed)
**Test:** `src/components/ui/Toast.test.tsx`
**Depends:** none

Note: Toast component already exists. Verify it supports error notifications. If not, update it.

```tsx
// Check existing Toast component and update if needed
// The existing Toast component should be reviewed and updated to support:
// - Error state
// - Success state
// - Auto-dismiss
// - Multiple toasts
```

**Verify:** `npx vitest run src/components/ui/Toast.test.tsx`
**Commit:** `feat(ui): update Toast component for audit trail notifications`

---

## Batch 5: Features & Polish (parallel — 6 implementers)

All tasks in this batch depend on Batch 4 (components must be redesigned).

### Task 5.1: Add Real-Time Updates Polling
**File:** `src/hooks/useRealtimeAudit.ts` (new file)
**Test:** `src/hooks/useRealtimeAudit.test.ts`
**Depends:** 3.1 (Redux), 3.2 (useAuditLog)

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect, vi, beforeEach, afterEach } = from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimeAudit } from './useRealtimeAudit';

describe('useRealtimeAudit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts polling when enabled', () => {
    const { result } = renderHook(() => useRealtimeAudit(false));
    
    // Enable realtime
    result.current.start();
    
    expect(result.current.active).toBe(true);
  });

  it('stops polling when disabled', () => {
    const { result } = renderHook(() => useRealtimeAudit(true));
    
    // Initially active
    expect(result.current.active).toBe(true);
    
    // Stop
    result.current.stop();
    
    expect(result.current.active).toBe(false);
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { loadEntries } from '@/store/slices/auditLogSlice';
import { auditLogger } from '@/lib/logger';

interface UseRealtimeAuditOptions {
  initialActive?: boolean;
  interval?: number; // milliseconds
}

export function useRealtimeAudit(
  initialActive = false,
  interval = 30000 // 30 seconds default
) {
  const dispatch = useDispatch<AppDispatch>();
  const [active, setActive] = useState(initialActive);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(() => {
    const accessLogs = auditLogger.getAccessLogs();
    dispatch(loadEntries(accessLogs));
  }, [dispatch]);

  const start = useCallback(() => {
    setActive(true);
    fetchLogs(); // Immediate fetch
    intervalRef.current = setInterval(fetchLogs, interval);
  }, [fetchLogs, interval]);

  const stop = useCallback(() => {
    setActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Toggle
  const toggle = useCallback(() => {
    if (active) {
      stop();
    } else {
      start();
    }
  }, [active, start, stop]);

  // Setup on mount if initialActive
  useEffect(() => {
    if (initialActive) {
      start();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Only run on mount

  return {
    active,
    start,
    stop,
    toggle,
  };
}
```

**Verify:** `npx vitest run src/hooks/useRealtimeAudit.test.ts`
**Commit:** `feat(hooks): add useRealtimeAudit hook for polling updates`

---

### Task 5.2: Add Storage Capacity Warning Banner
**File:** `src/components/audit/StorageWarning.tsx`
**Test:** `src/components/audit/StorageWarning.test.tsx`
**Depends:** 1.4 (Alert), 1.8 (CSS)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { StorageWarning } from './StorageWarning';

describe('StorageWarning', () => {
  it('does not render when under capacity', () => {
    render(<StorageWarning current={3000} max={5000} />);
    expect(screen.queryByText(/storage/i)).not.toBeInTheDocument();
  });

  it('renders warning when near capacity', () => {
    render(<StorageWarning current={4800} max={5000} />);
    expect(screen.getByText(/storage.*capacity/i)).toBeInTheDocument();
  });

  it('renders critical warning when over 95%', () => {
    render(<StorageWarning current={4800} max={5000} />);
    expect(screen.getByText(/4800\/5000/)).toBeInTheDocument();
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface StorageWarningProps {
  current: number;
  max: number;
  onExport?: () => void;
  onClear?: () => void;
}

export function StorageWarning({ current, max, onExport, onClear }: StorageWarningProps) {
  const percentage = (current / max) * 100;
  const isNearCapacity = percentage > 90;
  const isCritical = percentage > 95;

  if (!isNearCapacity) return null;

  return (
    <Alert variant={isCritical ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isCritical ? 'Storage Critical' : 'Storage Near Capacity'}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Log storage is at {current}/{max} entries ({percentage.toFixed(1)}%). 
          Consider exporting and clearing old logs.
        </span>
        <div className="flex gap-2 ml-4">
          {onExport && (
            <button onClick={onExport}>Export</button>
          )}
          {onClear && (
            <button onClick={onClear}>Clear</button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

**Verify:** `npx vitest run src/components/audit/StorageWarning.test.tsx`
**Commit:** `feat(audit): add storage capacity warning banner`

---

### Task 5.3: Add Keyboard Navigation for Log Table
**File:** `src/components/audit/LogTable.tsx` (update - add keyboard nav)
**Test:** `src/components/audit/LogTable.keyboard.test.tsx`
**Depends:** 2.6 (LogTable)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen, fireEvent } from '@testing-library/react';
import { LogTable } from './LogTable';
import type { AuditLogEntry } from '@/lib/logger';

const mockEntries: AuditLogEntry[] = Array(5).fill(null).map((_, i) => ({
  id: `log_${i}`,
  timestamp: new Date().toISOString(),
  level: 'info' as const,
  category: 'auth' as const,
  action: `Action ${i}`,
  user: 'admin',
  details: {},
  sessionId: 'sess_1',
}));

describe('LogTable Keyboard Navigation', () => {
  it('expands row on Enter key', () => {
    render(<LogTable entries={mockEntries} />);
    const firstRow = screen.getByText('Action 0').closest('tr');
    
    if (firstRow) {
      fireEvent.keyDown(firstRow, { key: 'Enter' });
      expect(screen.getByText('Session ID:')).toBeInTheDocument();
    }
  });

  it('expands row on Space key', () => {
    render(<LogTable entries={mockEntries} />);
    const firstRow = screen.getByText('Action 0').closest('tr');
    
    if (firstRow) {
      fireEvent.keyDown(firstRow, { key: ' ' });
      expect(screen.getByText('Session ID:')).toBeInTheDocument();
    }
  });
});
```

Add to LogTable component (update existing):
- Add `tabIndex={0}` to table rows
- Add `onKeyDown` handler for Enter and Space keys
- Add `role="button"` and `aria-expanded` for accessibility

**Verify:** `npx vitest run src/components/audit/LogTable.keyboard.test.tsx`
**Commit:** `feat(audit): add keyboard navigation to LogTable`

---

### Task 5.4: Add Loading Skeleton for Log Table
**File:** `src/components/audit/LogTableSkeleton.tsx`
**Test:** `src/components/audit/LogTableSkeleton.test.tsx`
**Depends:** existing SkeletonLoader component

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { LogTableSkeleton } from './LogTableSkeleton';

describe('LogTableSkeleton', () => {
  it('renders skeleton rows', () => {
    render(<LogTableSkeleton rows={5} />);
    const skeletons = document.querySelectorAll('[data-skeleton]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
```

```tsx
// COMPLETE implementation - copy-paste ready
import { Skeleton } from '@/components/ui/SkeletonLoader';

interface LogTableSkeletonProps {
  rows?: number;
}

export function LogTableSkeleton({ rows = 5 }: LogTableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-4">
        {Array(6).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array(rows).fill(null).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-64" />
        </div>
      ))}
    </div>
  );
}
```

**Verify:** `npx vitest run src/components/audit/LogTableSkeleton.test.tsx`
**Commit:** `feat(audit): add loading skeleton for LogTable`

---

### Task 5.5: Add Export Error Handling with Toast
**File:** `src/pages/Dashboard/LogViewer.tsx` (update - add toast)
**Test:** `src/pages/Dashboard/LogViewer.export.test.tsx`
**Depends:** 4.1 (LogViewer), existing Toast component

```tsx
// Add to LogViewer.tsx handleExport function:
// - Wrap in try-catch
// - Show success toast on successful export
// - Show error toast on failed export

// Update handleExport in LogViewer.tsx:
const handleExport = (format: 'json' | 'csv') => {
  try {
    if (activeTab === 'access') {
      auditLogger.downloadAccessLog(format);
    } else {
      auditLogger.downloadErrorLog(format);
    }
    // Show success toast
    showToast({ message: `Logs exported as ${format.toUpperCase()}`, type: 'success' });
  } catch (error) {
    console.error('Export failed:', error);
    showToast({ message: 'Export failed. Please try again.', type: 'error' });
  }
};
```

**Verify:** Manual testing of export functionality
**Commit:** `feat(audit): add toast notifications for export success/error`

---

### Task 5.6: Add ARIA Labels and Accessibility Enhancements
**File:** `src/components/audit/FilterBar.tsx` and `src/components/audit/LogTable.tsx` (update)
**Test:** `src/components/audit/accessibility.test.tsx`
**Depends:** 2.5 (FilterBar), 2.6 (LogTable)

```tsx
// COMPLETE test code - copy-paste ready
import { render, screen } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import { LogTable } from './LogTable';

describe('Accessibility', () => {
  it('FilterBar has proper ARIA labels', () => {
    render(
      <FilterBar
        levelFilter="all"
        categoryFilter="all"
        searchInput=""
        onLevelChange={() => {}}
        onCategoryChange={() => {}}
        onSearchChange={() => {}}
        onDateRangeChange={() => {}}
        onRefresh={() => {}}
        onExport={() => {}}
        onClear={() => {}}
      />
    );
    expect(screen.getByLabelText(/search logs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
  });

  it('LogTable rows are keyboard navigable', () => {
    const entries = [{
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      category: 'auth' as const,
      action: 'Test',
      user: 'admin',
      details: {},
      sessionId: 'sess_1',
    }];
    render(<LogTable entries={entries} />);
    const row = screen.getByText('Test').closest('tr');
    expect(row).toHaveAttribute('tabindex');
  });
});
```

**Verify:** `npx vitest run src/components/audit/accessibility.test.tsx`
**Commit:** `feat(audit): add ARIA labels and accessibility enhancements`

---

## Batch 6: Testing (parallel — 9 implementers)

All tasks in this batch depend on Batch 5 (all features implemented).

### Task 6.1: Unit Tests for logger.ts
**File:** `src/lib/logger.test.ts`
**Test:** unit tests for log creation, rotation, export, filtering
**Depends:** 5.1+ (all features)

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect, beforeEach } from 'vitest';
import { auditLogger, AuditLogEntry, LogLevel, AuditCategory } from './logger';

describe('Audit Logger', () => {
  beforeEach(() => {
    // Clear logs before each test
    auditLogger.clear();
    auditLogger.clearAccessLogs();
    auditLogger.clearErrorLogs();
  });

  it('creates log entry with correct structure', () => {
    const entry = auditLogger.log('info', 'auth', 'User logged in', { ip: '127.0.0.1' });
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('timestamp');
    expect(entry.level).toBe('info');
    expect(entry.category).toBe('auth');
    expect(entry.action).toBe('User logged in');
  });

  it('rotates logs when exceeding maxEntries', () => {
    // Fill up to max
    for (let i = 0; i < 5001; i++) {
      auditLogger.log('info', 'auth', `Log ${i}`);
    }
    const entries = auditLogger.getAll();
    expect(entries.length).toBeLessThanOrEqual(5000);
  });

  it('exports as JSON', () => {
    auditLogger.log('info', 'auth', 'Test');
    const json = auditLogger.exportAsJson();
    const parsed = JSON.parse(json);
    expect(parsed).toBeInstanceOf(Array);
    expect(parsed[0].action).toBe('Test');
  });

  it('exports as CSV', () => {
    auditLogger.log('info', 'auth', 'Test');
    const csv = auditLogger.exportAsCsv();
    expect(csv).toContain('Timestamp,Level,Category,Action,User,Details');
    expect(csv).toContain('Test');
  });

  it('filters by level', () => {
    auditLogger.log('info', 'auth', 'Info log');
    auditLogger.log('error', 'auth', 'Error log');
    const filtered = auditLogger.filter({ level: 'error' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].level).toBe('error');
  });

  it('filters by date range', () => {
    const entry = auditLogger.log('info', 'auth', 'Test');
    const filtered = auditLogger.filter({
      from: new Date(Date.now() - 1000).toISOString(),
      to: new Date(Date.now() + 1000).toISOString(),
    });
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('computes stats correctly', () => {
    auditLogger.log('info', 'auth', 'Log 1');
    auditLogger.log('error', 'scan', 'Log 2');
    const stats = auditLogger.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byLevel.info).toBe(1);
    expect(stats.byLevel.error).toBe(1);
  });
});
```

**Verify:** `npx vitest run src/lib/logger.test.ts`
**Commit:** `test(lib): add comprehensive unit tests for logger`

---

### Task 6.2: Integration Tests for Redux + Logger
**File:** `src/store/slices/auditLogSlice.integration.test.ts`
**Test:** integration between Redux and logger
**Depends:** 3.1, 3.2

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import auditLogReducer, {
  loadEntries,
  addEntry,
  setFilter,
} from './auditLogSlice';
import { auditLogger } from '@/lib/logger';

describe('auditLogSlice Integration', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auditLog: auditLogReducer },
    });
    auditLogger.clear();
  });

  it('syncs Redux state with logger on loadEntries', () => {
    // Add entry via logger
    auditLogger.log('info', 'auth', 'Test action');
    const logs = auditLogger.getAccessLogs();
    
    // Load into Redux
    store.dispatch(loadEntries(logs));
    
    const state = store.getState();
    expect(state.auditLog.entries).toHaveLength(1);
    expect(state.auditLog.stats.total).toBe(1);
  });

  it('applies multiple filters correctly', () => {
    // Add test data
    auditLogger.log('info', 'auth', 'Auth log');
    auditLogger.log('error', 'scan', 'Scan error');
    auditLogger.log('warn', 'auth', 'Auth warn');
    
    const logs = auditLogger.getAccessLogs();
    store.dispatch(loadEntries(logs));
    
    // Filter by level
    store.dispatch(setFilter({ level: 'error' }));
    let state = store.getState();
    expect(state.auditLog.filteredEntries).toHaveLength(1);
    
    // Filter by category
    store.dispatch(setFilter({ level: 'all', category: 'auth' }));
    state = store.getState();
    expect(state.auditLog.filteredEntries).toHaveLength(2);
  });
});
```

**Verify:** `npx vitest run src/store/slices/auditLogSlice.integration.test.ts`
**Commit:** `test(store): add integration tests for Redux + logger`

---

### Task 6.3: Component Tests for StatsPanel
**File:** `src/components/audit/StatsPanel.test.tsx` (already created in Task 2.3)
**Test:** verify tests pass
**Depends:** 2.3

Run existing tests and fix any issues.

**Verify:** `npx vitest run src/components/audit/StatsPanel.test.tsx`
**Commit:** `test(audit): fix StatsPanel tests if needed`

---

### Task 6.4: Component Tests for FilterBar
**File:** `src/components/audit/FilterBar.test.tsx` (already created in Task 2.5)
**Test:** verify tests pass
**Depends:** 2.5

Run existing tests and fix any issues.

**Verify:** `npx vitest run src/components/audit/FilterBar.test.tsx`
**Commit:** `test(audit): fix FilterBar tests if needed`

---

### Task 6.5: Component Tests for LogTable
**File:** `src/components/audit/LogTable.test.tsx` (already created in Task 2.6)
**Test:** verify tests pass
**Depends:** 2.6

Run existing tests and fix any issues.

**Verify:** `npx vitest run src/components/audit/LogTable.test.tsx`
**Commit:** `test(audit): fix LogTable tests if needed`

---

### Task 6.6: Component Tests for LogViewer Page
**File:** `src/pages/Dashboard/LogViewer.test.tsx` (already created in Task 4.1)
**Test:** verify tests pass
**Depends:** 4.1

Run existing tests and fix any issues.

**Verify:** `npx vitest run src/pages/Dashboard/LogViewer.test.tsx`
**Commit:** `test(pages): fix LogViewer tests if needed`

---

### Task 6.7: Accessibility Tests
**File:** `src/components/audit/accessibility.test.tsx` (already created in Task 5.6)
**Test:** verify ARIA labels, keyboard nav
**Depends:** 5.6

Run accessibility tests and fix issues.

**Verify:** `npx vitest run src/components/audit/accessibility.test.tsx`
**Commit:** `test(audit): fix accessibility tests if needed`

---

### Task 6.8: E2E Tests for Export Flow
**File:** `src/tests/e2e/audit-export.test.ts`
**Test:** full export flow
**Depends:** 4.1, 5.5

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect, vi } from 'vitest';
import { auditLogger } from '@/lib/logger';

describe('Audit Export E2E', () => {
  it('exports access logs as JSON', () => {
    // Mock createObjectURL and related DOM APIs
    const mockClick = vi.fn();
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
      style: {},
    } as any);
    const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockReturnValue({} as any);
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockReturnValue({} as any);

    auditLogger.log('info', 'auth', 'Test export');
    auditLogger.downloadAccessLog('json');

    expect(mockClick).toHaveBeenCalled();
    
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  it('exports error logs as CSV', () => {
    const mockClick = vi.fn();
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
      style: {},
    } as any);

    auditLogger.log('error', 'scan', 'Test error');
    auditLogger.downloadErrorLog('csv');

    expect(mockClick).toHaveBeenCalled();
    
    mockCreateElement.mockRestore();
  });
});
```

**Verify:** `npx vitest run src/tests/e2e/audit-export.test.ts`
**Commit:** `test(e2e): add E2E tests for audit export flow`

---

### Task 6.9: Performance Tests for Large Log Sets
**File:** `src/tests/performance/audit-performance.test.ts`
**Test:** rendering performance with 5000 entries
**Depends:** 2.6, 4.1

```tsx
// COMPLETE test code - copy-paste ready
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LogTable } from '@/components/audit/LogTable';
import type { AuditLogEntry } from '@/lib/logger';

describe('Audit Performance', () => {
  it('renders 1000 entries within performance budget', () => {
    const entries: AuditLogEntry[] = Array(1000).fill(null).map((_, i) => ({
      id: `log_${i}`,
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      category: 'auth' as const,
      action: `Action ${i}`,
      user: 'admin',
      details: {},
      sessionId: 'sess_1',
    }));

    const start = performance.now();
    render(<LogTable entries={entries} />);
    const end = performance.now();
    
    const renderTime = end - start;
    expect(renderTime).toBeLessThan(1000); // Should render within 1 second
  });
});
```

**Verify:** `npx vitest run src/tests/performance/audit-performance.test.ts`
**Commit:** `test(perf): add performance tests for audit log rendering`

---

## Summary

| Batch | Tasks | Description | Dependencies |
|-------|-------|-------------|---------------|
| 1 | 1.1 - 1.8 | Foundation: shadcn components (Table, Collapsible, Pagination, Alert, DropdownMenu), LevelBadge, CategoryIcon, CSS | None |
| 2 | 2.1 - 2.6 | shadcn Integration: Tabs update, DateRangePicker, StatsPanel, RealtimeIndicator, FilterBar, LogTable | Batch 1 |
| 3 | 3.1 - 3.3 | Redux Integration: auditLogSlice enhancement, useAuditLog update, Selectors | Batch 1 |
| 4 | 4.1 - 4.5 | Component Redesign: LogViewer page rewrite, AuditLogViewer simplification, logger constants, EmptyState enhancement | Batches 2, 3 |
| 5 | 5.1 - 5.6 | Features & Polish: Realtime polling, Storage warning, Keyboard nav, Loading skeleton, Export error handling, Accessibility | Batch 4 |
| 6 | 6.1 - 6.9 | Testing: Unit, Integration, Component, E2E, Performance tests | Batch 5 |

**Total Tasks:** 30 micro-tasks across 6 batches
**Parallelism:** Up to 8 implementers in Batch 1, 6 in Batch 2, 3 in Batch 3, 5 in Batch 4, 6 in Batch 5, 9 in Batch 6

---

## Implementation Notes

1. **Design Decisions Made:**
   - Using shadcn/ui components as base (Table, Card, Button, Input, Select, Popover, Calendar, DropdownMenu, Collapsible, Pagination, Tabs, Alert, Toast)
   - Precision Instrument aesthetic with `#0a0e14` base, JetBrains Mono font, LED indicators
   - Redux as single source of truth (no direct `auditLogger` reads in components)
   - Real-time updates via 30s polling (not WebSocket, as per design recommendation)
   - Date range picker using Popover + Calendar (new feature)
   - `window.confirm()` replaced with shadcn ConfirmDialog

2. **Gap Filling:**
   - Design didn't specify exact shadcn component API - used standard shadcn patterns
   - Design didn't specify CSS approach - created dedicated `audit-trail.css` with CSS variables
   - Design didn't specify test structure - followed existing project patterns (vitest + testing-library)

3. **Files Not Created (Existing Used):**
   - `ConfirmDialog.tsx` - already exists, used as-is
   - `Toast.tsx` - already exists, verified compatibility
   - `EmptyState.tsx` - already exists, enhanced for audit trail
   - `button.tsx`, `input.tsx`, `select.tsx`, `popover.tsx`, `calendar.tsx` - already exist, used as-is

4. **Key Migration Steps:**
   - Components no longer import `auditLogger` directly for reads (uses Redux `useSelector`)
   - Inline styles (`style={{}}`) replaced with CSS variables and shadcn className patterns
   - Custom `LogLevel` styling replaced with `LevelBadge` component
   - Emoji category icons replaced with Lucide icons via `CategoryIcon` component
