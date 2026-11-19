import { useState } from 'react';
import { Pill, Undo2, Plus, Package } from 'lucide-react';
import { SectionHeader, EmptyState, Modal, timeAgo } from '@/components/ui';
import { type MedicineDispense } from '@/lib/dataStructures';
import { nextId } from '@/lib/store';

export function PharmacyPage({
  stack,
  sync,
}: {
  stack: {
    toArray: () => MedicineDispense[];
    size: () => number;
    push: (m: MedicineDispense) => number;
    pop: () => MedicineDispense | undefined;
  };
  sync: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientName: '', medicine: '', dosage: '', dispensedBy: 'Pharmacist R. Khan' });
  const [undoFlash, setUndoFlash] = useState(false);

  const items = stack.toArray().reverse(); // top of stack first for display
  const top = stack.toArray()[stack.size() - 1];

  const dispense = () => {
    if (!form.patientName.trim() || !form.medicine.trim()) return;
    stack.push({
      id: nextId('RX'),
      patientName: form.patientName.trim(),
      medicine: form.medicine.trim(),
      dosage: form.dosage.trim() || 'As directed',
      dispensedBy: form.dispensedBy,
      dispensedAt: Date.now(),
    });
    setForm({ patientName: '', medicine: '', dosage: '', dispensedBy: 'Pharmacist R. Khan' });
    setOpen(false);
    sync();
  };

  const undo = () => {
    stack.pop();
    setUndoFlash(true);
    setTimeout(() => setUndoFlash(false), 500);
    sync();
  };

  const medicines = ['Amoxicillin 500mg', 'Paracetamol 650mg', 'Ibuprofen 400mg', 'Cetirizine 10mg', 'Metformin 500mg', 'Atorvastatin 10mg', 'Omeprazole 20mg', 'Azithromycin 250mg'];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pharmacy Dispense Log"
        subtitle="Each dispense is recorded; the latest entry can be undone instantly if needed."
        icon={<Pill className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Entries logged</p>
          <p className="mt-1 font-display text-3xl font-bold text-teal-600">{stack.size()}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Latest Dispense</p>
          <p className="mt-1 truncate font-semibold text-ink-900">{top ? top.medicine : '—'}</p>
          {top && <p className="text-xs text-ink-500">for {top.patientName} • {timeAgo(top.dispensedAt)}</p>}
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Undo last dispense</p>
            <p className="mt-1 text-sm text-ink-500">Reverts the most recent entry</p>
          </div>
          <button className="btn-ghost" onClick={undo} disabled={stack.size() === 0}>
            <Undo2 className="h-4 w-4" /> Undo
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Dispense History</h2>
          <button className="btn-soft" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New Dispense
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={<Package className="h-6 w-6" />} title="No dispenses yet" hint="Log a new dispensation using the button above." />
        ) : (
          <div className="space-y-2.5">
            {items.map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all animate-slide-up ${
                  i === 0
                    ? `border-teal-300 bg-teal-50/60 ring-1 ring-teal-200 ${undoFlash ? 'animate-pop' : ''}`
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-600">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{d.medicine}</p>
                  <p className="truncate text-xs text-ink-500">
                    {d.dosage} • for <span className="font-medium text-ink-600">{d.patientName}</span> • by {d.dispensedBy}
                  </p>
                </div>
                <span className="hidden text-xs text-ink-400 sm:block">{timeAgo(d.dispensedAt)}</span>
                {i === 0 && <span className="chip bg-teal-600 text-white">LATEST</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Medicine Dispense">
        <div className="space-y-4">
          <div>
            <label className="label">Patient name</label>
            <input className="input" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="e.g. Kavya Reddy" autoFocus />
          </div>
          <div>
            <label className="label">Medicine</label>
            <input className="input" list="meds" value={form.medicine} onChange={(e) => setForm({ ...form, medicine: e.target.value })} placeholder="Type or select" />
            <datalist id="meds">{medicines.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Dosage</label>
              <input className="input" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="1 tab × 2/day" />
            </div>
            <div>
              <label className="label">Dispensed by</label>
              <input className="input" value={form.dispensedBy} onChange={(e) => setForm({ ...form, dispensedBy: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={dispense} disabled={!form.patientName.trim() || !form.medicine.trim()}>
              <Plus className="h-4 w-4" /> Add Dispense
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
