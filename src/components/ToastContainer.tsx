import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-[8px]">
      {toasts.map(t => (
        <div key={t.id} className="bg-surface border border-border rounded-md px-[14px] py-[10px] text-[13px] text-foreground shadow-sm whitespace-nowrap">
          {t.message}
        </div>
      ))}
    </div>
  );
}
