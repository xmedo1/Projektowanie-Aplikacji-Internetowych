interface NotificationProps {
  message: string | null;
  type?: 'success' | 'error';
}

export default function Notification({ message, type = 'success' }: NotificationProps) {
  if (!message) return null;
  const isError = type === 'error';

  return (
    <div
      className={`fixed top-10 left-1/2 z-50 -translate-x-1/2 transform rounded-lg border bg-card px-6 py-3 font-bold shadow-2xl transition-all duration-300 ${
        isError ? 'border-error text-error' : 'border-accent text-fg-default'
      }`}
    >
      {message}
    </div>
  );
}
