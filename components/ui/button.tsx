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

// Elementos que pueden recibir className vía asChild
type AsChildTarget = React.HTMLAttributes<HTMLElement> & { className?: string };

const layoutClasses = 'inline-flex items-center justify-center';
const behaviorClasses =
  'rounded-2xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]';

const variantClasses: Record<Variant, string> = {
  default: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-sm',
  outline: 'border-2 border-terracotta text-terracotta hover:bg-terracotta/10',
  ghost: 'text-terracotta hover:bg-terracotta/10',
  secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-8 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild, ...props }, ref) => {
    const classes = cn(variantClasses[variant], sizeClasses[size], className);

    if (asChild && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<AsChildTarget>;
      return React.cloneElement(child, {
        ...props,
        className: cn(layoutClasses, behaviorClasses, classes, child.props?.className),
      });
    }

    return (
      <button ref={ref} className={cn(layoutClasses, behaviorClasses, classes)} {...props} />
    );
  }
);
Button.displayName = 'Button';