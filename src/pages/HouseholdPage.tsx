import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gradeLevel: '',
    careNotes: '',
  });

  const load = async () => {
    const [childData, schoolData] = await Promise.all([api.children.list(), api.schools.list()]);
    setChildren(childData);
    setSchools(schoolData);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.children.create(form);
    setForm({ firstName: '', lastName: '', gradeLevel: '', careNotes: '' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">Family operations</p>
          <h1 className="text-3xl font-semibold">Children & schools</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Children</h2>
          <div className="mt-4 space-y-3">
            {children.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sage/60 p-4 text-sm text-charcoal/70">
                No children added yet.
              </div>
            ) : (
              children.map((child) => (
                <div key={child.id} className="rounded-2xl border border-sage/30 bg-ivory p-3">
                  <div className="font-semibold">
                    {child.firstName} {child.lastName}
                  </div>
                  <div className="mt-1 text-sm text-charcoal/70">Grade: {child.gradeLevel ?? 'Not set'}</div>
                  <div className="mt-1 text-sm text-charcoal/70">School: {child.school?.name ?? 'Unassigned'}</div>
                  <div className="mt-1 text-sm text-charcoal/70">Care notes: {child.careNotes ?? 'No notes'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-5">
          <h2 className="text-xl font-semibold">Add child profile</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">First name</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Grade level</label>
              <input
                className="input"
                value={form.gradeLevel}
                onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Care notes</label>
              <textarea
                className="input min-h-[90px]"
                value={form.careNotes}
                onChange={(e) => setForm({ ...form, careNotes: e.target.value })}
              />
            </div>
            <button className="btn-primary w-full" type="submit">
              Save child
            </button>
          </div>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-semibold">Schools</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {schools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage/60 p-4 text-sm text-charcoal/70">
              No schools yet.
            </div>
          ) : (
            schools.map((school) => (
              <div key={school.id} className="rounded-2xl border border-sage/30 bg-white p-3">
                <div className="font-semibold">{school.name}</div>
                <div className="mt-1 text-sm text-charcoal/70">{school.address ?? 'Address not set'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ChildrenPage;
