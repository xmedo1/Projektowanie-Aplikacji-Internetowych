interface NotificationProps {
  message: string | null;
}

export default function Notification({ message }: NotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed top-10 left-1/2 z-50 -translate-x-1/2 transform rounded-lg border border-accent bg-card px-6 py-3 font-bold text-fg-default shadow-2xl transition-all duration-300">
      {message}
    </div>
  );
}
