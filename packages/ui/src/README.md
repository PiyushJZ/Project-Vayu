# src

## Overview

Source root of `@project-vayu/ui`. It groups the component library, shared helpers, and the global stylesheet.

## Subdirectories & Boundaries

- components: [./components/README.md](./components/README.md) - `Button`, `Card*`, `DropdownMenu*`, `Skeleton`, `Textarea` components.
- lib: [./lib/README.md](./lib/README.md) - `cn` class-name helper re-export.
- styles: contains only `styles/globals.css` (no source code, no README). It is exported as `@project-vayu/ui/globals.css`. It imports `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`; declares `@source` globs for `../../../apps/**/*.{ts,tsx}` and `../**/*.{ts,tsx}`; defines `:root` and `.dark` CSS variables, an `@custom-variant dark`, an `@theme inline` block, and an `@layer base` block.
