import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'medium' | 'large';
  leadingIcon?: ReactNode;
};

export function Button({
  asChild = false,
  variant = 'primary',
  size = 'large',
  leadingIcon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classNames = `ui-button ui-button--${variant} ui-button--${size} ${className}`.trim();

  if (asChild)
    return (
      <Slot className={classNames} {...props}>
        {children}
      </Slot>
    );

  return (
    <button className={classNames} {...props}>
      {leadingIcon}
      <span>{children}</span>
    </button>
  );
}
