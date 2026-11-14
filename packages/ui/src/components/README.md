# components

## Overview

shadcn/ui ("base-lyra" style per `../../components.json`) React components built on `@base-ui/react` primitives, `class-variance-authority`, and Tailwind classes. Consumers import them via the package export `@project-vayu/ui/components/*` (`../../package.json` `exports`).

## Interface

- `button.tsx`: `Button` (props: `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`), `buttonVariants` (cva). Variants: `default | outline | secondary | ghost | destructive | link`. Sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`.
- `card.tsx`: `Card` (extra prop `size?: "default" | "sm"`), `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`.
- `dropdown-menu.tsx`: `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem` (`variant?: "default" | "destructive"`, `inset?`), `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`.
- `skeleton.tsx`: `Skeleton`.
- `textarea.tsx`: `Textarea`.

## Invariants

- Every component merges caller `className` through `cn` from `@project-vayu/ui/lib/utils` (all five files) and spreads remaining `...props` onto the root element.
- Each root element sets a `data-slot` attribute (e.g. `button.tsx:Button` -> `"button"`, `card.tsx:Card` -> `"card"`, `skeleton.tsx:Skeleton` -> `"skeleton"`, `textarea.tsx:Textarea` -> `"textarea"`, dropdown parts -> `dropdown-menu-*`). `card.tsx` styles depend on slots such as `card-footer` and `card-action`.
- `Button` defaults: `variant = "default"`, `size = "default"` (`button.tsx:buttonVariants.defaultVariants`).
- `DropdownMenuContent` defaults: `align="start"`, `alignOffset=0`, `side="bottom"`, `sideOffset=4`; `DropdownMenuSubContent` defaults `alignOffset=-3`, `side="right"`, `sideOffset=0`.
- `dropdown-menu.tsx` begins with the `"use client"` directive; the other files do not.
- Components import each other/utilities through the `@project-vayu/ui/*` alias (`../../tsconfig.json` `paths`).

## Side Effects

- None at module load; components are pure render functions with no state, network, or disk access. `DropdownMenuContent` renders into a portal (`MenuPrimitive.Portal`) when mounted.

## Verification

- Run: `pnpm --filter @project-vayu/ui check-types`
