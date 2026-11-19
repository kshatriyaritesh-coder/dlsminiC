import { useState } from 'react';
import { Users, UserPlus, ArrowRightCircle, Trash2, Clock, Stethoscope } from 'lucide-react';
import { SectionHeader, EmptyState, Modal, Avatar, timeAgo } from '@/components/ui';
import { type QueuedPatient } from '@/lib/dataStructures';
import { nextId } from '@/lib/store';

export function PatientQueuePage({
  queue,
  sync,
}: {
  queue: { toArray: () => QueuedPatient[]; size: () => number; dequeue: () => QueuedPatient | undefined; enqueue: (p: QueuedPatient) => number; remove: (id: string) => QueuedPatient | undefined };
  sync: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', department: 'General Medicine' });
  const [serving, setServing] = useState<QueuedPatient | null>(null);

  const items = queue.toArray();
  const next = items[0];

  const addPatient = () => {
    if (!form.name.trim() || !form.age) return;
    queue.enqueue({
      id: nextId('OPD'),
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender,
      department: form.department,
      arrivedAt: Date.now(),
      queuedAt: Date.now(),
      status: 'waiting',
    });
    setForm({ name: '', age: '', gender: 'Male', department: 'General Medicine' });
    setOpen(false);
    sync();
  };

  const callNext = () => {
    const p = queue.dequeue();
    if (p) {
      setServing({ ...p, status: 'serving' });
      sync();
      setTimeout(() => {
        setServing(null);
      }, 4000);
    }
  };

  const departments = ['General Medicine', 'Cardiology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'Neurology'];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="OPD Patient Queue"
        subtitle="Outpatient registration handled in arrival order."
        icon={<Users className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Waiting patients</p>
          <p className="mt-1 font-display text-3xl font-bold text-brand-700">{queue.size()}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Next Patient</p>
          <p className="mt-1 truncate font-semibold text-ink-900">{next ? next.name : '—'}</p>
          {next && <p className="text-xs text-ink-500">{next.department} • waiting {timeAgo(next.queuedAt)}</p>}
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Call next patient</p>
            <p className="mt-1 text-sm text-ink-500">Calls the next in line</p>
          </div>
          <button className="btn-primary" onClick={callNext} disabled={queue.size() === 0}>
            <ArrowRightCircle className="h-4 w-4" /> Call Next
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Waiting Queue</h2>
          <button className="btn-soft" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" /> Register Patient
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={<Users className="h-6 w-6" />} title="Queue is empty" hint="New registrations will appear here as patients arrive." />
        ) : (
          <div className="space-y-2.5">
            {items.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all animate-slide-up ${
                  i === 0 ? 'border-brand-300 bg-brand-50/60 ring-1 ring-brand-200' : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-900 font-mono text-sm font-bold text-white">
                  {i + 1}
                </div>
                <Avatar name={p.name} className="h-9 w-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{p.name}</p>
                  <p className="truncate text-xs text-ink-500">{p.age} yrs • {p.gender} • {p.department}</p>
                </div>
                <div className="hidden items-center gap-1 text-xs text-ink-500 sm:flex">
                  <Clock className="h-3.5 w-3.5" /> {timeAgo(p.queuedAt)}
                </div>
                {i === 0 && <span className="chip bg-brand-100 text-brand-700">NEXT</span>}
                <button
                  onClick={() => { queue.remove(p.id); sync(); }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-rose-50 hover:text-rose-600"
                  title="Remove from queue"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {serving && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl bg-ink-900 px-5 py-4 text-white shadow-lift animate-slide-up">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-teal-500">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-300">Now serving</p>
            <p className="font-semibold">{serving.name} • {serving.department}</p>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Register New Patient">
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kavya Reddy" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age</label>
              <input className="input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="32" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={addPatient} disabled={!form.name.trim() || !form.age}>
              <UserPlus className="h-4 w-4" /> Add Patient
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
