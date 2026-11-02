import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import { api } from './lib/api';

function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    householdName: 'The Family',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = mode === 'signup'
        ? await api.signup(form)
        : await api.login({ email: form.email, password: form.password });

      localStorage.setItem('sb_token', result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f4ee] p-4">
      <div className="w-full max-w-md rounded-[32px] border border-sage/40 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-espresso text-xl font-semibold text-ivory">SB</div>
          <h1 className="text-2xl font-semibold">StarBird Family Command Center</h1>
          <p className="mt-2 text-sm text-charcoal/70">Private family coordination for the modern household.</p>
        </div>

        <div className="mb-4 flex rounded-xl border border-sage/50 bg-ivory p-1">
          <button className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-espresso text-white' : 'text-charcoal/80'}`} onClick={() => setMode('signup')}>Sign up</button>
          <button className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-espresso text-white' : 'text-charcoal/80'}`} onClick={() => setMode('login')}>Sign in</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div>
                <label className="label">First name</label>
                <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Household name</label>
                <input className="input" value={form.householdName} onChange={(e) => setForm({ ...form, householdName: e.target.value })} required />
              </div>
            </>
          )}

          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Working...' : mode === 'signup' ? 'Create household' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    setIsAuthenticated(Boolean(token));
  }, []);

  if (isAuthenticated === null) return <div className="min-h-screen bg-ivory" />;

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
