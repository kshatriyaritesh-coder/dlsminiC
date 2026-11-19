import type { ReactNode } from 'react';

export function StatCard({
  icon,
  label,
  value,
  accent = 'brand',
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: 'brand' | 'teal' | 'amber' | 'rose';
  sub?: string;
}) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="card p-5 flex items-start gap-4 animate-slide-up">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accents[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-bold text-ink-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink-500">{sub}</p>}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  dsLabel,
  dsType,
  icon,
}: {
  title: string;
  subtitle: string;
  dsLabel?: string;
  dsType?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-soft">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
          <p className="text-sm text-ink-500">{subtitle}</p>
        </div>
      </div>
      {dsLabel && (
        <div className="flex items-center gap-2 self-start rounded-xl border border-ink-200 bg-white px-3 py-2 shadow-card">
          <span className="ds-pill bg-violet-100 text-violet-700">{dsLabel}</span>
          {dsType && <span className="text-xs font-mono text-ink-500">{dsType}</span>}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-400">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-ink-700">{title}</p>
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative card w-full ${width} p-6 animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const palette = ['bg-brand-100 text-brand-700', 'bg-teal-100 text-teal-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
  const idx = name.charCodeAt(0) % palette.length;
  return (
    <div className={`grid place-items-center rounded-full font-semibold ${palette[idx]} ${className}`}>
      {initials}
    </div>
  );
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
