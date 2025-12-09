import React from 'react';
import { cn } from '@/lib/utils';

interface SocialLinksButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const SocialLinksButton = React.forwardRef<HTMLButtonElement, SocialLinksButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SocialLinksButton.displayName = 'SocialLinksButton';
