import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function HouseholdPage() {
  const [household, setHousehold] = useState<any>(null);
  const [responsibilities, setResponsibilities] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [householdData, responsibilitiesData] = await Promise.all([api.household.me(), api.responsibilities.list()]);
      setHousehold(householdData);
      setResponsibilities(responsibilitiesData);
    };

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">Home</p>
          <h1 className="text-3xl font-semibold">Household management</h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-xl font-semibold">Household</h2>
          <div className="mt-4 space-y-2 text-sm text-charcoal/75">
            <div><span className="font-semibold">Name:</span> {household?.name ?? 'Loading...'}</div>
            <div><span className="font-semibold">Members:</span> {household?.members?.length ?? 0}</div>
            {household?.members?.map((member: any) => (
              <div key={member.id} className="rounded-xl border border-sage/30 bg-ivory p-2">
                {member.user.firstName} {member.user.lastName} — {member.role}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold">Responsibility assignments</h2>
          <div className="mt-4 space-y-3">
            {responsibilities.length === 0 ? <div className="text-sm text-charcoal/70">No responsibilities yet.</div> : responsibilities.map((item) => (
              <div key={item.id} className="rounded-2xl border border-sage/30 bg-ivory p-3">
                <div className="font-semibold">{item.title}</div>
                <div className="mt-1 text-sm text-charcoal/70">Assigned to: {item.assignee ? `${item.assignee.firstName} ${item.assignee.lastName}` : 'Unassigned'}</div>
                <div className="mt-1 text-sm text-charcoal/70">Status: {item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HouseholdPage;
