interface StatBoxProps {
  value: number;
  label: string;
  accentColor: 'accent' | 'red' | 'yellow' | 'blue' | 'purple' | 'green';
  icon?: React.ReactNode;
  trend?: number; // optional % change
}

const COLOR_MAP: Record<string, { text: string; iconBg: string; glow: string }> = {
  accent: { text: 'text-primary',          iconBg: 'bg-accent-light',             glow: 'accent-glow' },
  red:    { text: 'text-semantic-red',      iconBg: 'bg-semantic-red-light',       glow: 'red-glow' },
  yellow: { text: 'text-semantic-yellow',   iconBg: 'bg-semantic-yellow-light',    glow: 'yellow-glow' },
  blue:   { text: 'text-semantic-blue',     iconBg: 'bg-semantic-blue-light',      glow: 'blue-glow' },
  green:  { text: 'text-semantic-green',    iconBg: 'bg-semantic-green-light',     glow: 'green-glow' },
  purple: { text: 'text-semantic-purple',   iconBg: 'bg-semantic-purple-light',    glow: 'purple-glow' },
};

export function StatBox({ value, label, accentColor, icon }: StatBoxProps) {
  const { text, iconBg } = COLOR_MAP[accentColor] || COLOR_MAP.accent;

  return (
    <div className="stat-box-rich flex flex-col gap-0">
      <div className="flex items-start justify-between gap-2">
        <span className={`stat-num-rich ${text}`}>{value}</span>
        {icon && (
          <div className={`stat-icon-badge ${iconBg} flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      <span className="stat-label-rich">{label}</span>
    </div>
  );
}
