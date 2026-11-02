import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', dueDate: '', notes: '', recurrence: '' });

  const load = async () => {
    const data = await api.tasks.list();
    setTasks(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.tasks.create(form);
    setForm({ title: '', dueDate: '', notes: '', recurrence: '' });
    await load();
  };

  const handleToggle = async (task: any) => {
    await api.tasks.update(task.id, { completed: !task.completed });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">Execution</p>
          <h1 className="text-3xl font-semibold">Tasks</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Open tasks</h2>
          <div className="mt-4 space-y-3">
            {tasks.length === 0 ? <div className="rounded-xl border border-dashed border-sage/60 p-4">No tasks yet.</div> : tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-sage/30 bg-ivory p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{task.title}</div>
                  <button className="btn-secondary px-2 py-1 text-xs" onClick={() => handleToggle(task)}>{task.completed ? 'Reopen' : 'Complete'}</button>
                </div>
                <div className="mt-1 text-sm text-charcoal/70">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
                <div className="mt-1 text-sm text-charcoal/70">Recurrence: {task.recurrence ?? 'None'}</div>
                <div className="mt-1 text-sm text-charcoal/70">Notes: {task.notes ?? 'No notes'}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-5">
          <h2 className="text-xl font-semibold">Add task</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Recurrence</label>
              <input className="input" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn-primary w-full" type="submit">Save task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TasksPage;
