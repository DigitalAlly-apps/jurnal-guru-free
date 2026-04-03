interface StatBoxProps {
  value: number;
  label: string;
  accentColor: 'accent' | 'red' | 'yellow' | 'blue' | 'purple';
  icon?: React.ReactNode;
}

const BG_MAP: Record<string, string> = {
  accent: 'bg-accent-light',
  red: 'bg-semantic-red-light',
  yellow: 'bg-semantic-yellow-light',
  blue: 'bg-semantic-blue-light',
  purple: 'bg-semantic-purple-light',
};

const TEXT_MAP: Record<string, string> = {
  accent: 'text-primary',
  red: 'text-semantic-red',
  yellow: 'text-semantic-yellow',
  blue: 'text-semantic-blue',
  purple: 'text-semantic-purple',
};

export function StatBox({ value, label, accentColor, icon }: StatBoxProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-soft p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-2xl font-bold ${TEXT_MAP[accentColor]}`}>{value}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-xl ${BG_MAP[accentColor]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      <span className="text-[11px] font-medium text-text-tertiary tracking-wide uppercase">{label}</span>
    </div>
  );
}
