import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = 'Username is required';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login({ ...form, username: form.username.trim() });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setFormError(await getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-logo"><Logo size={44} light={false} /><span>HealthCare <b>RCM</b></span></div>
          <p>Revenue Cycle Management</p>
        </div>
        <h1>Sign In to Your Account</h1>
        <p className="login-sub">Access claims, eligibility, and revenue cycle dashboards</p>
        <form className="login-card" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <span className={`input-wrap ${errors.username ? 'invalid' : ''}`}>
              <User size={18} />
              <input id="username" autoComplete="username" value={form.username} onChange={set('username')} aria-invalid={Boolean(errors.username)} />
            </span>
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <span className={`input-wrap ${errors.password ? 'invalid' : ''}`}>
              <Lock size={18} />
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={set('password')} aria-invalid={Boolean(errors.password)} />
              <button type="button" className="icon-btn plain" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="login-row">
            <label className="check"><input type="checkbox" checked={form.rememberMe} onChange={set('rememberMe')} /> Remember me</label>
            <button type="button" className="link link-btn" onClick={() => setShowHelp((s) => !s)}>Forgot Password?</button>
          </div>
          {showHelp && <p className="info-box">Password resets are handled by your administrator. Contact them to reset your password.</p>}
          {formError && <p className="form-error form-error-box" role="alert">{formError}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
