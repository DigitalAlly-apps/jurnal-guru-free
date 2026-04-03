interface StatBoxProps {
  value: string | number;
  label: string;
  accentColor?: 'accent' | 'red' | 'yellow' | 'blue';
}

export function StatBox({ value, label, accentColor }: StatBoxProps) {
  const colorMap = {
    accent: 'text-primary',
    red: 'text-semantic-red',
    yellow: 'text-semantic-yellow',
    blue: 'text-semantic-blue',
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-[16px] min-h-[84px]">
      <span className={`text-[26px] font-semibold leading-none block mb-[4px] ${accentColor ? colorMap[accentColor] : 'text-foreground'}`}>
        {value}
      </span>
      <span className="label-upper">{label}</span>
    </div>
  );
}
