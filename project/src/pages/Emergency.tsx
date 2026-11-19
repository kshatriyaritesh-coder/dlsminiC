import { useState } from 'react';
import { Siren, Ambulance, Activity, Trash2, ArrowRightCircle, Heart } from 'lucide-react';
import { SectionHeader, EmptyState, Modal, Avatar } from '@/components/ui';
import { type EmergencyPatient, type PatientPriority } from '@/lib/dataStructures';
import { nextId } from '@/lib/store';

const PRIORITY_META: Record<number, { label: string; chip: string; ring: string; dot: string }> = {
  1: { label: 'Resuscitation', chip: 'bg-rose-600 text-white', ring: 'ring-rose-300', dot: 'bg-rose-500' },
  2: { label: 'Emergency', chip: 'bg-rose-100 text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-400' },
  3: { label: 'Urgent', chip: 'bg-amber-100 text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-400' },
  4: { label: 'Less Urgent', chip: 'bg-brand-100 text-brand-700', ring: 'ring-brand-200', dot: 'bg-brand-400' },
  5: { label: 'Non-Urgent', chip: 'bg-teal-100 text-teal-700', ring: 'ring-teal-200', dot: 'bg-teal-400' },
};

export function EmergencyPage({
  pq,
  sync,
}: {
  pq: {
    toArray: () => EmergencyPatient[];
    size: () => number;
    dequeue: () => EmergencyPatient | undefined;
    enqueue: (p: EmergencyPatient) => number;
    remove: (id: string) => EmergencyPatient | undefined;
  };
  sync: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male', complaint: '', priority: '3' as string,
    systolic: '', diastolic: '', pulse: '', spo2: '',
  });

  const items = pq.toArray(); // already sorted by priority
  const top = items[0];

  const admit = () => {
    const priority = parseInt(form.priority, 10) as PatientPriority;
    pq.enqueue({
      id: nextId('ER'),
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender,
      department: 'ER',
      arrivedAt: Date.now(),
      queuedAt: Date.now(),
      priority,
      complaint: form.complaint.trim(),
      vitals: {
        systolic: form.systolic ? parseInt(form.systolic, 10) : undefined,
        diastolic: form.diastolic ? parseInt(form.diastolic, 10) : undefined,
        pulse: form.pulse ? parseInt(form.pulse, 10) : undefined,
        spo2: form.spo2 ? parseInt(form.spo2, 10) : undefined,
      },
    });
    setForm({ name: '', age: '', gender: 'Male', complaint: '', priority: '3', systolic: '', diastolic: '', pulse: '', spo2: '' });
    setOpen(false);
    sync();
  };

  const treat = () => {
    pq.dequeue();
    sync();
  };

  const counts = [1, 2, 3, 4, 5].map((p) => items.filter((i) => i.priority === p).length);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Emergency Triage"
        subtitle="Patients are ordered by clinical severity — the most critical is always treated first."
        icon={<Siren className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">In triage</p>
          <p className="mt-1 font-display text-3xl font-bold text-rose-600">{pq.size()}</p>
        </div>
        <div className="card p-5 ring-1 ring-rose-200">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 animate-pulse text-rose-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Most critical</p>
          </div>
          <p className="mt-1 truncate font-semibold text-ink-900">{top ? top.name : '—'}</p>
          {top && <p className="text-xs text-ink-500">{PRIORITY_META[top.priority].label} • {top.complaint}</p>}
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Treat next</p>
            <p className="mt-1 text-sm text-ink-500">Treat highest priority patient</p>
          </div>
          <button className="btn-danger" onClick={treat} disabled={pq.size() === 0}>
            <ArrowRightCircle className="h-4 w-4" /> Treat
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Triage Board</h2>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((p) => (
              <span key={p} className={`chip ${PRIORITY_META[p].chip}`}>
                P{p} · {counts[p - 1]}
              </span>
            ))}
          </div>
          <button className="btn-soft" onClick={() => setOpen(true)}>
            <Ambulance className="h-4 w-4" /> Admit Patient
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={<Siren className="h-6 w-6" />} title="No patients in triage" hint="Admitted patients are sorted by clinical severity." />
        ) : (
          <div className="space-y-2.5">
            <p className="mb-1 text-xs font-semibold text-ink-400">Sorted by clinical severity — highest priority treated first</p>
            {items.map((p, i) => {
              const meta = PRIORITY_META[p.priority];
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-3.5 transition-all animate-slide-up ${
                    i === 0 ? `border-rose-200 ring-1 ${meta.ring}` : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`chip ${meta.chip}`}>P{p.priority}</span>
                  </div>
                  <Avatar name={p.name} className="h-9 w-9 text-xs" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-ink-900">{p.name}</p>
                      <span className="text-xs text-ink-400">{p.age}y • {p.gender}</span>
                    </div>
                    <p className="truncate text-xs text-ink-500">{p.complaint}</p>
                    {p.vitals && (p.vitals.systolic || p.vitals.pulse || p.vitals.spo2) && (
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-mono text-ink-500">
                        {p.vitals.systolic && <span className="rounded bg-ink-50 px-1.5 py-0.5">BP {p.vitals.systolic}/{p.vitals.diastolic}</span>}
                        {p.vitals.pulse && <span className="rounded bg-ink-50 px-1.5 py-0.5">HR {p.vitals.pulse}</span>}
                        {p.vitals.spo2 && <span className={`rounded px-1.5 py-0.5 ${p.vitals.spo2 < 92 ? 'bg-rose-50 text-rose-600' : 'bg-ink-50'}`}>SpO₂ {p.vitals.spo2}%</span>}
                      </div>
                    )}
                  </div>
                  {i === 0 && (
                    <span className="chip bg-rose-600 text-white animate-pulse">
                      <Activity className="h-3 w-3" /> NEXT
                    </span>
                  )}
                  <button
                    onClick={() => { pq.remove(p.id); sync(); }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Admit to Emergency">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="label">Age</label>
              <input className="input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Priority (1 = critical)</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="1">1 — Resuscitation</option>
                <option value="2">2 — Emergency</option>
                <option value="3">3 — Urgent</option>
                <option value="4">4 — Less Urgent</option>
                <option value="5">5 — Non-Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Chief complaint</label>
            <input className="input" value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })} placeholder="e.g. Difficulty breathing" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="label">Sys BP</label><input className="input" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: e.target.value })} placeholder="120" /></div>
            <div><label className="label">Dia BP</label><input className="input" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: e.target.value })} placeholder="80" /></div>
            <div><label className="label">Pulse</label><input className="input" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} placeholder="72" /></div>
            <div><label className="label">SpO₂ %</label><input className="input" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} placeholder="98" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-danger" onClick={admit} disabled={!form.name.trim() || !form.age || !form.complaint.trim()}>
              <Ambulance className="h-4 w-4" /> Admit to Triage
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
