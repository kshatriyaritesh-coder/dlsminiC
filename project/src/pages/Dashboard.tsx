import { Users, Siren, Pill, FolderOpen, Activity, TrendingUp, Clock } from 'lucide-react';
import { StatCard, Avatar, timeAgo } from '@/components/ui';
import type { HospitalStore } from '@/lib/store';
import type { QueuedPatient, EmergencyPatient } from '@/lib/dataStructures';

export function Dashboard({
  store,
  onNavigate,
}: {
  store: HospitalStore;
  onNavigate: (page: string) => void;
}) {
  const opd = store.opdQueue.toArray();
  const er = store.emergency.toArray();
  const rx = store.pharmacy.toArray();
  const records = store.records.values();

  const critical = er.filter((e) => e.priority <= 2).length;

  const navCards = [
    { id: 'queue', title: 'OPD Patient Queue', icon: <Users className="h-5 w-5" />, count: opd.length, accent: 'brand', desc: 'First-come, first-served outpatient flow.' },
    { id: 'emergency', title: 'Emergency Triage', icon: <Siren className="h-5 w-5" />, count: er.length, accent: 'rose', desc: 'Severity-sorted triage for critical emergency cases.' },
    { id: 'pharmacy', title: 'Pharmacy Dispense', icon: <Pill className="h-5 w-5" />, count: rx.length, accent: 'teal', desc: 'Last dispense is one-click undoable.' },
    { id: 'records', title: 'Patient Records', icon: <FolderOpen className="h-5 w-5" />, count: records.length, accent: 'amber', desc: 'Quick search and directory by patient ID.' },
  ];

  const accentMap: Record<string, { icon: string; pill: string }> = {
    brand: { icon: 'bg-brand-50 text-brand-600', pill: 'bg-brand-100 text-brand-700' },
    rose: { icon: 'bg-rose-50 text-rose-600', pill: 'bg-rose-100 text-rose-700' },
    teal: { icon: 'bg-teal-50 text-teal-600', pill: 'bg-teal-100 text-teal-700' },
    amber: { icon: 'bg-amber-50 text-amber-600', pill: 'bg-amber-100 text-amber-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Hospital Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="OPD Waiting" value={opd.length} accent="brand" sub="Outpatient waiting" />
        <StatCard icon={<Siren className="h-5 w-5" />} label="ER Critical" value={critical} accent="rose" sub={`${er.length} in triage`} />
        <StatCard icon={<Pill className="h-5 w-5" />} label="Dispenses" value={rx.length} accent="teal" sub="Recent dispensations" />
        <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Records" value={records.length} accent="amber" sub="Registered patients" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {navCards.map((c) => (
          <button
            key={c.id}
            onClick={() => onNavigate(c.id)}
            className="card group p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift animate-slide-up"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${accentMap[c.accent].icon}`}>
                {c.icon}
              </div>
              <span className="font-display text-2xl font-bold text-ink-900">{c.count}</span>
            </div>
            <p className="mt-3 font-display font-bold text-ink-900 group-hover:text-brand-700">{c.title}</p>
            <p className="text-xs text-ink-500">{c.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Next up in OPD */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900">Next in OPD Queue</h2>
            <span className="chip bg-brand-50 text-brand-600"><Clock className="h-3 w-3" /> Waiting</span>
          </div>
          <div className="space-y-2">
            {opd.slice(0, 3).map((p: QueuedPatient, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-ink-100 p-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-ink-900 font-mono text-xs font-bold text-white">{i + 1}</span>
                <Avatar name={p.name} className="h-8 w-8 text-[11px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                  <p className="truncate text-xs text-ink-500">{p.department}</p>
                </div>
                <span className="text-xs text-ink-400">{timeAgo(p.queuedAt)}</span>
              </div>
            ))}
            {opd.length === 0 && <p className="py-6 text-center text-sm text-ink-400">Queue is empty.</p>}
          </div>
        </div>

        {/* ER critical */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900">Triage Priority</h2>
            <span className="chip bg-rose-50 text-rose-600"><Activity className="h-3 w-3" /> Priority</span>
          </div>
          <div className="space-y-2">
            {er.slice(0, 3).map((p: EmergencyPatient, i) => (
              <div key={p.id} className={`flex items-center gap-3 rounded-lg border p-2.5 ${i === 0 ? 'border-rose-200 bg-rose-50/40' : 'border-ink-100'}`}>
                <span className={`chip ${p.priority <= 2 ? 'bg-rose-600 text-white' : p.priority === 3 ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'}`}>P{p.priority}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                  <p className="truncate text-xs text-ink-500">{p.complaint}</p>
                </div>
                <TrendingUp className="h-4 w-4 text-ink-300" />
              </div>
            ))}
            {er.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No patients in triage.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
