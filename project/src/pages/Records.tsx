import { useState, useMemo } from 'react';
import { FolderOpen, UserPlus, Search, Trash2, Phone, MapPin, Droplet, FileText } from 'lucide-react';
import { SectionHeader, EmptyState, Modal, Avatar } from '@/components/ui';
import { type PatientRecord, HashMap } from '@/lib/dataStructures';
import { nextId } from '@/lib/store';

export function RecordsPage({
  records,
  sync,
}: {
  records: HashMap<string, PatientRecord>;
  sync: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PatientRecord | null>(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', bloodGroup: 'O+', phone: '', address: '', history: '' });

  const all = useMemo(() => records.values().sort((a, b) => b.createdAt - a.createdAt), [records]);
  const filtered = useMemo(() => {
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((r) => r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.bloodGroup.toLowerCase().includes(q));
  }, [all, query]);

  const addRecord = () => {
    if (!form.name.trim() || !form.age) return;
    const id = nextId('REC');
    records.set(id, {
      id,
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      phone: form.phone.trim(),
      address: form.address.trim(),
      history: form.history.trim(),
      createdAt: Date.now(),
    });
    setForm({ name: '', age: '', gender: 'Male', bloodGroup: 'O+', phone: '', address: '', history: '' });
    setOpen(false);
    sync();
  };

  const removeRecord = (id: string) => {
    records.delete(id);
    if (view?.id === id) setView(null);
    sync();
  };

  const maleCount = all.filter((r) => r.gender === 'Male').length;
  const femaleCount = all.filter((r) => r.gender === 'Female').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Patient Records"
        subtitle="Manage and view comprehensive patient medical records."
        icon={<FolderOpen className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Total records</p>
          <p className="mt-1 font-display text-3xl font-bold text-brand-700">{records.size()}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Male Patients</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-700">{maleCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Female Patients</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-700">{femaleCount}</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search by name, phone, blood group…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="btn-soft self-start" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" /> New Record
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<FolderOpen className="h-6 w-6" />} title="No records found" hint="Create a new patient record using the button above." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink-200">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Age / Sex</th>
                  <th className="hidden px-4 py-3 md:table-cell">Blood</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="cursor-pointer transition hover:bg-brand-50/40" onClick={() => setView(r)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} className="h-8 w-8 text-[11px]" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{r.name}</p>
                          <p className="truncate font-mono text-xs text-ink-400">{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">{r.age}y • {r.gender}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="chip bg-rose-50 text-rose-600">{r.bloodGroup}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-600 lg:table-cell">{r.phone}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => removeRecord(r.id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {view && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setView(null)} />
          <div className="relative h-full w-full max-w-md bg-white shadow-lift animate-slide-up overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-100 p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">Patient Details</h2>
              <button onClick={() => setView(null)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={view.name} className="h-16 w-16 text-lg" />
                <div>
                  <p className="font-display text-xl font-bold text-ink-900">{view.name}</p>
                  <p className="font-mono text-sm text-ink-400">{view.id}</p>
                  <p className="text-sm text-ink-500">{view.age} years • {view.gender}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-rose-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600"><Droplet className="h-3.5 w-3.5" /> Blood Group</div>
                  <p className="mt-1 font-display text-lg font-bold text-ink-900">{view.bloodGroup}</p>
                </div>
                <div className="rounded-xl bg-brand-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600"><Phone className="h-3.5 w-3.5" /> Phone</div>
                  <p className="mt-1 text-sm font-medium text-ink-900">{view.phone}</p>
                </div>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500"><MapPin className="h-3.5 w-3.5" /> Address</div>
                <p className="mt-1 text-sm text-ink-700">{view.address || '—'}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700"><FileText className="h-3.5 w-3.5" /> Medical History</div>
                <p className="mt-1 text-sm text-ink-700">{view.history || 'No recorded history.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Patient Record">
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
              <label className="label">Blood group</label>
              <select className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" /></div>
            <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <div>
            <label className="label">Medical history</label>
            <textarea className="input min-h-[80px]" value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} placeholder="Known conditions, allergies, prior surgeries…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={addRecord} disabled={!form.name.trim() || !form.age}>
              <UserPlus className="h-4 w-4" /> Save Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
