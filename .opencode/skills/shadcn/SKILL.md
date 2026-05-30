---
name: shadcn
description: Use shadcn/ui components to build accessible, customizable React components. This skill helps with adding and using shadcn components in this project. Use when the user asks to add UI components, build forms, modals, buttons, or any shadcn/ui component.
license: MIT
---

# shadcn/ui Skill

This project uses shadcn/ui components with Tailwind CSS v4 and Radix UI primitives.

## Project Setup

This project is already configured with:
- `components.json` - shadcn configuration
- Tailwind CSS v4 with Vite plugin
- Required Radix UI primitives in dependencies
- `clsx` and `tailwind-merge` for conditional classes

## Adding Components

To add a new shadcn component:

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## Using Components

Import components from `@/components/ui/`:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## Available Components

Check available components at: https://ui.shadcn.com/docs/components

Common components:
- Button, Input, Select
- Card, Dialog, Sheet
- Form, Label, Switch
- Table, Tabs, Badge
- Dropdown Menu, Navigation Menu

## Styling

Components use Tailwind CSS classes. Customize by:
1. Passing className props
2. Using the `cn()` utility from `@/lib/utils`
3. Modifying the component's source in `components/ui/`

## Component Structure

All shadcn components are copied to `src/components/ui/` and can be modified directly. They are not installed as dependencies but as source code you own.
