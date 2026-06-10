import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
  return (
    <div>
      <label className="mb-1 block text-sm text-fg-muted">{label}</label>
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-lg bg-input p-3 text-fg-default outline-none focus:ring-2 ${
          error
            ? 'border border-error focus:ring-error'
            : 'border border-transparent focus:ring-accent'
        }`}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
