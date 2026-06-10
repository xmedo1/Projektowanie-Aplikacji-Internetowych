import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page text-fg-default">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-accent">{title}</h2>
        {children}
      </div>
    </div>
  );
}
