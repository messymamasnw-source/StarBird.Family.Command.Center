import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function CommandCenterPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.dashboard();
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) return <div className="card p-6">Loading your command center…</div>;
  if (error) return <div className="card border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  if (!dashboard) return <div className="card p-6">No dashboard data available.</div>;

  return (
    <div className="space-y-6">
      <header className="page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">Family dashboard</p>
          <h1 className="text-3xl font-semibold text-espresso">Good morning, {dashboard.greeting}</h1>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-ivory px-4 py-3 text-sm text-charcoal">
          {dashboard.dateLabel}
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-sage">Top priorities</div>
          <div className="mt-3 text-3xl font-semibold">{dashboard.topPriorities.length}</div>
          <div className="mt-2 text-sm text-charcoal/75">Today’s critical items</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-sage">Appointments</div>
          <div className="mt-3 text-3xl font-semibold">{dashboard.appointments.length}</div>
          <div className="mt-2 text-sm text-charcoal/75">School and family events</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-sage">Decision points</div>
          <div className="mt-3 text-3xl font-semibold">{dashboard.tasks.length}</div>
          <div className="mt-2 text-sm text-charcoal/75">Needs review</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-sage">Wait list</div>
          <div className="mt-3 text-3xl font-semibold">{dashboard.waitList.length}</div>
          <div className="mt-2 text-sm text-charcoal/75">Can wait safely</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today’s top three priorities</h2>
            <button className="btn-primary">Plan My Day</button>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.topPriorities.map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-sage/30 bg-ivory p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{item.title}</div>
                  <span className="status-pill border-gold/60 bg-gold/10 text-gold">{item.kind}</span>
                </div>
                <div className="mt-2 text-sm text-charcoal/70">{item.when}</div>
                <div className="mt-2 text-sm text-charcoal/70">{item.details}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            <button className="btn-secondary">Add Event</button>
            <button className="btn-secondary">Add Task</button>
            <button className="btn-secondary">Add School Notice</button>
            <button className="btn-secondary">Add Grocery Item</button>
            <button className="btn-secondary">Assign Responsibility</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Upcoming family appointments & school events</h2>
          <div className="mt-4 space-y-3">
            {dashboard.appointments.map((event: any) => (
              <div key={event.id} className="rounded-2xl border border-sage/30 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{event.title}</div>
                  <span className="status-pill border-sage/40 bg-sage/10 text-charcoal">School</span>
                </div>
                <div className="mt-2 text-sm text-charcoal/70">{new Date(event.dateTime).toLocaleString()}</div>
                <div className="mt-1 text-sm text-charcoal/70">{event.location ?? 'Location pending'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold">Pickup, drop-off & responsibility checks</h2>
          <div className="mt-4 space-y-3">
            {dashboard.responsibilities.map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-sage/30 bg-white p-3">
                <div className="font-semibold">{item.title}</div>
                <div className="mt-1 text-sm text-charcoal/70">{item.status}</div>
                <div className="mt-1 text-sm text-charcoal/70">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Business commitments</h2>
          <div className="mt-4 text-sm text-charcoal/70">No business data in this phase. Coming in a later phase.</div>
        </div>
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Household reminders</h2>
          <div className="mt-4 space-y-2 text-sm text-charcoal/70">
            {dashboard.waitList.map((msg: string) => <div key={msg}>• {msg}</div>)}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Overlapping commitments</h2>
          <div className="mt-4 text-sm text-charcoal/70">
            {dashboard.conflicts.length > 0 ? dashboard.conflicts.map((msg: string) => <div key={msg}>• {msg}</div>) : 'No conflicts identified.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenterPage;
