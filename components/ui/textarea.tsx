'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const classes = cn(
      'w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base transition-colors focus:border-terracotta focus:outline-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400',
      className
    );
    return <textarea ref={ref} className={classes} {...props} />;
  }
);
Textarea.displayName = 'Textarea';