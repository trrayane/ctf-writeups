import { useState, type FormEvent, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

function AuthScaffold({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="page-card">
          <p className="eyebrow">Authentication</p>
          <h1 className="section-title" style={{ fontSize: 34 }}>
            {title}
          </h1>
          <p className="section-intro">{subtitle}</p>
          <div style={{ marginTop: 20 }}>{children}</div>
        </div>
      </div>
    </section>
  );
}

function redirectByRole(roleCode: string) {
  if (roleCode === 'admin') return '/admin';
  if (roleCode === 'staff') return '/staff';
  return '/portal';
}

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={redirectByRole(user.roleCode)} replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      title="Sign in to NovaCrest"
      subtitle="One login works for portal, staff, and admin dashboards."
    >
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p style={{ color: '#ff8a80' }}>{error}</p> : null}
        <button className="button button--filled" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthScaffold>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    title: '',
    avatarUrl: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await register(form);
      setMessage('Account created successfully. You can now sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <AuthScaffold
      title="External Registration"
      subtitle="External users can create portal accounts here."
    >
      <form className="form-grid" onSubmit={onSubmit}>
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="field">
            <span>{key}</span>
            <input
              type={key === 'password' ? 'password' : 'text'}
              value={value}
              onChange={(event) =>
                setForm((current) => ({ ...current, [key]: event.target.value }))
              }
              required={key === 'fullName' || key === 'email' || key === 'password'}
            />
          </label>
        ))}
        {message ? <p style={{ color: '#76ffb7' }}>{message}</p> : null}
        {error ? <p style={{ color: '#ff8a80' }}>{error}</p> : null}
        <button className="button button--filled" type="submit">
          Create Account
        </button>
      </form>
    </AuthScaffold>
  );
}
