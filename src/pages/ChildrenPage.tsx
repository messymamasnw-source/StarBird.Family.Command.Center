import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    dateTime: '',
    location: '',
    participants: '',
    transportation: '',
    preparation: '',
    travelTimeMinutes: 15,
    reminderMinutes: 30,
    recurrence: '',
    notes: '',
  });

  const load = async () => {
    const data = await api.events.list();
    setEvents(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.events.create(form);
    setForm({
      title: '',
      dateTime: '',
      location: '',
      participants: '',
      transportation: '',
      preparation: '',
      travelTimeMinutes: 15,
      reminderMinutes: 30,
      recurrence: '',
      notes: '',
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    await api.events.remove(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">Operations</p>
          <h1 className="text-3xl font-semibold">Family Calendar</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Calendar events</h2>
          <div className="mt-4 space-y-3">
            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sage/60 p-6 text-sm text-charcoal/70">No events added yet.</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-sage/30 bg-ivory p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{event.title}</div>
                      <div className="mt-1 text-sm text-charcoal/70">{new Date(event.dateTime).toLocaleString()}</div>
                    </div>
                    <button className="btn-secondary px-2 py-1 text-xs" onClick={() => handleDelete(event.id)}>Delete</button>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/70">{event.location ?? 'Location pending'}</div>
                  <div className="mt-1 text-sm text-charcoal/70">Participants: {event.participants ?? 'Family members'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-5">
          <h2 className="text-xl font-semibold">Add event</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Date & time</label>
              <input type="datetime-local" className="input" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} required />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Participants</label>
              <input className="input" value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} />
            </div>
            <div>
              <label className="label">Transportation</label>
              <input className="input" value={form.transportation} onChange={(e) => setForm({ ...form, transportation: e.target.value })} />
            </div>
            <div>
              <label className="label">Preparation</label>
              <textarea className="input min-h-[80px]" value={form.preparation} onChange={(e) => setForm({ ...form, preparation: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Travel time</label>
                <input type="number" className="input" value={form.travelTimeMinutes} onChange={(e) => setForm({ ...form, travelTimeMinutes: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Reminder</label>
                <input type="number" className="input" value={form.reminderMinutes} onChange={(e) => setForm({ ...form, reminderMinutes: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="label">Recurrence</label>
              <input className="input" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn-primary w-full" type="submit">Save event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CalendarPage;
