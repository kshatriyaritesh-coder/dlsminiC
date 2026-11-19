import { useState } from 'react';
import { LayoutDashboard, Users, Siren, Pill, FolderOpen, HeartPulse } from 'lucide-react';
import { createStore, useStructure } from '@/lib/store';
import { Dashboard } from '@/pages/Dashboard';
import { PatientQueuePage } from '@/pages/PatientQueue';
import { EmergencyPage } from '@/pages/Emergency';
import { PharmacyPage } from '@/pages/Pharmacy';
import { RecordsPage } from '@/pages/Records';

type Page = 'dashboard' | 'queue' | 'emergency' | 'pharmacy' | 'records';

const NAV: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'queue', label: 'OPD Queue', icon: Users },
  { id: 'emergency', label: 'Emergency Triage', icon: Siren },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'records', label: 'Patient Records', icon: FolderOpen },
];

export default function App() {
  const [store] = useState(createStore);
  const [, syncOpd] = useStructure(() => store.opdQueue);
  const [, syncEr] = useStructure(() => store.emergency);
  const [, syncRx] = useStructure(() => store.pharmacy);
  const [, syncRec] = useStructure(() => store.records);

  const [page, setPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const syncAll = () => { syncOpd(); syncEr(); syncRx(); syncRec(); };

  const go = (p: string) => {
    setPage(p as Page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <HeartPulse className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold">MediCore</span>
        </div>
        <button onClick={() => setMobileOpen((o) => !o)} className="btn-ghost px-3 py-2">
          <LayoutDashboard className="h-4 w-4" /> Menu
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-ink-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center gap-2.5 border-b border-ink-100 px-5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none text-ink-900">MediCore</p>
              <p className="text-[11px] font-medium text-ink-400">Hospital Management</p>
            </div>
          </div>

          <nav className="space-y-1 p-3">
            {NAV.map((item) => {
              const active = page === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-ink-400 group-hover:text-ink-600'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>

          
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && <div className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden" onClick={() => setMobileOpen(false)} />}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            {page === 'dashboard' && <Dashboard store={store} onNavigate={go} />}
            {page === 'queue' && <PatientQueuePage queue={store.opdQueue} sync={() => { syncOpd(); syncAll(); }} />}
            {page === 'emergency' && <EmergencyPage pq={store.emergency} sync={() => { syncEr(); syncAll(); }} />}
            {page === 'pharmacy' && <PharmacyPage stack={store.pharmacy} sync={() => { syncRx(); syncAll(); }} />}
            {page === 'records' && <RecordsPage records={store.records} sync={() => { syncRec(); syncAll(); }} />}
          </div>
        </main>
      </div>
    </div>
  );
}
