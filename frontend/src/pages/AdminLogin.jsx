import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, TOKEN_KEY } from '../api.js';

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem(TOKEN_KEY, token);
      nav('/admin');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell login">
      <form className="login-box" onSubmit={submit}>
        <h1>Administrator access</h1>
        <p className="muted">Restricted to authorised personnel.</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {err && <p className="error">{err}</p>}
        <button className="btn btn-blue" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to dashboard'}</button>
        <Link to="/" className="back">← Back to tourist site</Link>
      </form>
    </div>
  );
}
