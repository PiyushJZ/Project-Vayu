import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@project-vayu/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/*
  One button system. A button steps up 1px under a fine pointer and sinks 1px with a 1.5% shrink when
  pressed; colours answer in 150ms and leave in 120ms. Reduced motion keeps the colour change only.
*/
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-[background-color,color,border-color,translate,scale] duration-[120ms] ease-ui select-none hover:duration-150 active:duration-[90ms] active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 motion-reduce:translate-none! motion-reduce:scale-none! pointer-fine:hover:-translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_86%,var(--foreground))]",
        outline:
          "border-border-strong bg-transparent text-foreground hover:border-[color-mix(in_oklab,var(--foreground)_36%,transparent)] hover:bg-accent aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_14%,var(--background))]",
        ghost: "text-foreground hover:bg-accent aria-expanded:bg-accent",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "link h-auto rounded-none px-0 pointer-fine:hover:translate-y-0",
      },
      size: {
        default: "h-11 gap-2 px-6 text-base",
        xs: "h-9 gap-1.5 px-3 text-sm max-sm:h-11",
        sm: "h-9 gap-1.5 px-4 text-sm max-sm:h-11",
        lg: "h-12 gap-2.5 px-6 text-base",
        icon: "size-11",
        "icon-xs": "size-9 max-sm:size-11",
        "icon-sm": "size-9 max-sm:size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
