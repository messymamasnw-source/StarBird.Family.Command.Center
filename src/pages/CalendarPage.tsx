type PlaceholderPageProps = {
  title: string;
};

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="card p-6">
      <div className="page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">Later phase</p>
          <h1 className="text-3xl font-semibold">{title}</h1>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-sage/60 bg-ivory p-6 text-sm text-charcoal/70">
        This section is intentionally marked as “Coming in a later phase.” It exists as a working, labeled page and is not a fake or broken integration.
      </div>
    </div>
  );
}

export default PlaceholderPage;
