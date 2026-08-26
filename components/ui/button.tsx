'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'outline' | 'ghost' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-2xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]';

const variants: Record<Variant, string> = {
  default: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-sm',
  outline: 'border-2 border-terracotta text-terracotta hover:bg-terracotta/10',
  ghost: 'text-terracotta hover:bg-terracotta/10',
  secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-8 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild, ...props }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);
    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement<any>, {
        ...props,
        className: cn(classes, (props.children as any)?.className),
      });
    }
    return <button ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = 'Button';