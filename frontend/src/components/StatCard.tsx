import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
}

const colorMap = {
  emerald: {
    bg: 'bg-white/90 dark:bg-zinc-900/60',
    text: 'text-zinc-900 dark:text-white',
    iconBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 dark:bg-white/10 dark:text-white dark:border-white/15 shadow-xs',
    border: 'border-zinc-200/80 dark:border-white/10'
  },
  blue: {
    bg: 'bg-white/90 dark:bg-zinc-900/60',
    text: 'text-zinc-900 dark:text-white',
    iconBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 dark:bg-white/10 dark:text-white dark:border-white/15 shadow-xs',
    border: 'border-zinc-200/80 dark:border-white/10'
  },
  amber: {
    bg: 'bg-white/90 dark:bg-zinc-900/60',
    text: 'text-zinc-900 dark:text-white',
    iconBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 dark:bg-white/10 dark:text-white dark:border-white/15 shadow-xs',
    border: 'border-zinc-200/80 dark:border-white/10'
  },
  rose: {
    bg: 'bg-white/90 dark:bg-zinc-900/60',
    text: 'text-zinc-900 dark:text-white',
    iconBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 dark:bg-white/10 dark:text-white dark:border-white/15 shadow-xs',
    border: 'border-zinc-200/80 dark:border-white/10'
  },
  purple: {
    bg: 'bg-white/90 dark:bg-zinc-900/60',
    text: 'text-zinc-900 dark:text-white',
    iconBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 dark:bg-white/10 dark:text-white dark:border-white/15 shadow-xs',
    border: 'border-zinc-200/80 dark:border-white/10'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'emerald',
}) => {
  const c = colorMap[color];

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-4 sm:p-6 glass-card glass-card-hover backdrop-blur-xl transition-all duration-300 shadow-sm min-w-0 ${c.bg} ${c.border}`}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-zinc-200/30 blur-2xl dark:bg-white/5" />
      <div className="flex items-center justify-between gap-3 relative z-10 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
            {title}
          </p>
          <h4 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white truncate">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shrink-0 ${c.iconBg}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
};
