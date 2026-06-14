import type { ButtonHTMLAttributes } from 'react';

export default function Button({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent py-3 font-bold text-fg-on-accent transition hover:bg-accent-hover ${className}`}
    >
      {children}
    </button>
  );
}
