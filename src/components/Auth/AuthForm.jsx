import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, LogIn, UserPlus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { signInWithEmail, registerWithEmail, signInWithGoogle, resetPassword } from '../../firebase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Button from '../Shared/Button';
import PasswordInput from '../Shared/PasswordInput';
import { cn } from '../../utils/helpers';
import { validatePassword, getPasswordValidationMessage } from '../../utils/passwordValidation';

export default function AuthForm({ initialMode = 'login' }) {
  const { login: adminLogin } = useAdminAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Sync mode if initialMode prop changes (e.g. route change)
  useEffect(() => {
    setMode(initialMode);
    setError('');
    setInfo('');
  }, [initialMode]);

  const switchTab = (newMode) => {
    setMode(newMode);
    setError('');
    setInfo('');
    if (newMode === 'login' && location.pathname !== '/login') {
      window.history.replaceState(null, '', '/login');
    } else if (newMode === 'register' && location.pathname !== '/register') {
      window.history.replaceState(null, '', '/register');
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 focus:border-emerald-brand transition-all text-sm';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);

    // Universal Administrative login handling
    if (
      email.trim().toLowerCase() === 'istewakhassantewak121@gmail.com' &&
      password === 'Istee@787898'
    ) {
      try {
        await adminLogin(email.trim(), password, rememberMe);
        navigate('/admin', { replace: true });
        return;
      } catch (adminErr) {
        console.warn('Admin portal login fallback:', adminErr);
      }
    }

    try {
      await signInWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(getPasswordValidationMessage(password));
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setInfo('Password reset instructions sent to your email. Check your inbox (and spam folder).');
    } catch (err) {
      // Firebase may throw auth/user-not-found to prevent enumeration;
      // we still show a generic success to avoid revealing which emails exist.
      const code = err.code;
      if (code === 'auth/user-not-found') {
        setInfo('If an account exists with this email, password reset instructions have been sent.');
      } else {
        setError(getAuthErrorMessage(code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl bg-white shadow-premium border border-slate-100"
    >
      {/* Header Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative">
        <button
          type="button"
          onClick={() => switchTab('login')}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all relative z-10 flex items-center justify-center gap-2',
            mode === 'login'
              ? 'bg-white text-deep-green shadow-sm'
              : 'text-slate-500 hover:text-deep-green'
          )}
        >
          <LogIn size={16} /> Sign In
        </button>
        <button
          type="button"
          onClick={() => switchTab('register')}
          className={cn(
            'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all relative z-10 flex items-center justify-center gap-2',
            mode === 'register'
              ? 'bg-white text-deep-green shadow-sm'
              : 'text-slate-500 hover:text-deep-green'
          )}
        >
          <UserPlus size={16} /> Create Account
        </button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-deep-green">
          {mode === 'login' ? 'Welcome Back to Lake Valley' : 'Join Lake Valley Community'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login'
            ? 'Sign in to access your saved bookings and property portal.'
            : 'Register to explore master plots and schedule site visits.'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-red-500/10 text-red-500 text-xs" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {info && (
        <div className="flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-emerald-brand/10 text-emerald-brand text-xs" role="status">
          <CheckCircle2 size={16} className="shrink-0" />
          <p>{info}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Email address"
                required
                autoComplete="email"
              />
            </div>

            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-brand focus:ring-emerald-brand"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-emerald-brand font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
              <LogIn size={18} />
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="register-form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
                placeholder="Full Name"
                required
                autoComplete="name"
              />
            </div>

            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Email Address"
                required
                autoComplete="email"
              />
            </div>

            <PasswordInput
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create Password"
              showStrength
              required
              autoComplete="new-password"
            />

            <PasswordInput
              id="register-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              autoComplete="new-password"
            />

            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500" role="alert">
                Passwords do not match.
              </p>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-emerald-brand focus:ring-emerald-brand"
                required
              />
              <span>
                I agree to the <a href="/about" className="text-emerald-brand font-semibold hover:underline">Terms of Service</a> & <a href="/about" className="text-emerald-brand font-semibold hover:underline">Privacy Policy</a>.
              </span>
            </label>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-slate-400">
            or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200',
          'hover:bg-slate-50 transition-colors font-medium text-sm text-slate-800'
        )}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign in with Google
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck size={14} className="text-emerald-brand" />
        <span>256-Bit SSL Encrypted & Firebase Protected</span>
      </div>
    </motion.div>
  );
}

function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Try signing in.';
    case 'auth/weak-password':
      return 'Password does not meet requirements. Use at least 8 characters with upper, lower, number & symbol.';
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please wait a few minutes.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Pop-up window was blocked by your browser. Please allow pop-ups for this site or try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Add your deployment domain (e.g. lake-valley-main.vercel.app) to Firebase Auth -> Settings -> Authorized domains.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/account-exists-with-different-credential':
      return 'This email is already registered with another sign-in method. Try signing in with Google or Email/Password, or link accounts in Profile Settings.';
    case 'auth/requires-recent-login':
      return 'Please sign in again before performing this action.';
    default:
      return 'Authentication failed. Please try again or check your internet connection.';
  }
}
