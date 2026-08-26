'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    const classes = cn(
      'text-sm font-semibold text-slate-700 dark:text-slate-300',
      className
    );
    return <label ref={ref} className={classes} {...props} />;
  }
);
Label.displayName = 'Label';