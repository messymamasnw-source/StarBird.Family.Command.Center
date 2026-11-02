import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'My Command Center' },
  { to: '/calendar', label: 'Family Calendar' },
  { to: '/children', label: 'Children & Schools' },
  { to: '/household', label: 'Household Management' },
  { to: '/meals', label: 'Meals & Groceries' },
  { to: '/finances', label: 'Family Finances' },
  { to: '/business-1', label: 'Business 1' },
  { to: '/business-2', label: 'Business 2' },
  { to: '/business-3', label: 'Business 3' },
  { to: '/speaking', label: 'Speaking & Visibility' },
  { to: '/priorities', label: 'My Priorities' },
  { to: '/ai', label: 'AI Chief of Staff' },
  { to: '/family', label: 'Family Members' },
  { to: '/settings', label: 'Settings & Integrations' },
];

function AppShell() {
  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-sage/40 bg-white/70 p-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-espresso text-lg font-semibold text-ivory">SB</div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Command</div>
              <div className="text-lg font-semibold">StarBird</div>
            </div>
          </div>

          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'bg-sage/12 text-espresso' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 pb-28 md:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sage/40 bg-white/95 p-3 shadow-soft lg:hidden">
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-charcoal/80">
          {navItems.slice(0, 8).map((item) => (
            <NavLink key={item.to} to={item.to} className="rounded-lg px-2 py-2 hover:bg-sage/10">
              {item.label.split(' ')[0]}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AppShell;
