import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import CalendarPage from '../pages/CalendarPage';
import ChildrenPage from '../pages/ChildrenPage';
import CommandCenterPage from '../pages/CommandCenterPage';
import FamilyPage from '../pages/FamilyPage';
import HouseholdPage from '../pages/HouseholdPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import SettingsPage from '../pages/SettingsPage';
import TasksPage from '../pages/TasksPage';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('sb_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <div className="mx-auto flex max-w-[1800px] flex-col lg:flex-row">
        <aside className="hidden w-72 border-r border-sage/40 bg-white/70 p-4 backdrop-blur lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-espresso text-lg font-semibold text-ivory">
              SB
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage">
                Command
              </div>
              <div className="text-lg font-semibold">StarBird</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'bg-sage/15 text-espresso' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button onClick={handleLogout} className="btn-secondary mt-8 w-full">
            Sign out
          </button>
        </aside>

        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-sage/40 bg-white/90 p-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button className="btn-secondary px-3 py-2" onClick={() => setSidebarOpen((v) => !v)}>
              Menu
            </button>
            <div className="text-sm font-semibold">StarBird</div>
          </div>
          <button className="btn-secondary px-3 py-2" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 top-[64px] z-20 bg-ivory/95 p-4 lg:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className="nav-item block"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        <main className="w-full flex-1 p-4 pb-28 pt-20 lg:p-6 lg:pt-6">
          <Routes>
            <Route path="/dashboard" element={<CommandCenterPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/children" element={<ChildrenPage />} />
            <Route path="/household" element={<HouseholdPage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/meals" element={<PlaceholderPage title="Meals & Groceries" />} />
            <Route path="/finances" element={<PlaceholderPage title="Family Finances" />} />
            <Route path="/business-1" element={<PlaceholderPage title="Business 1" />} />
            <Route path="/business-2" element={<PlaceholderPage title="Business 2" />} />
            <Route path="/business-3" element={<PlaceholderPage title="Business 3" />} />
            <Route path="/speaking" element={<PlaceholderPage title="Speaking & Visibility" />} />
            <Route path="/priorities" element={<PlaceholderPage title="My Priorities" />} />
            <Route path="/ai" element={<PlaceholderPage title="AI Chief of Staff" />} />
            <Route path="/" element={<CommandCenterPage />} />
          </Routes>
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
