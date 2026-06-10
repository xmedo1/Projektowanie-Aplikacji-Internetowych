import type { ButtonHTMLAttributes } from "react";

export default function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-accent py-3 font-bold text-fg-on-accent transition hover:bg-accent-hover cursor-pointer"
    >
      {children}
    </button>
  );
}