import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Info, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/shared/lib/auth';
import { cn } from '@/shared/lib/cn';
import { AuthShell } from './AuthShell';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    const finalEmail = email.trim() || 'demo@idap.mn';
    login(finalEmail, remember);
    navigate(from, { replace: true });
  }

  return (
    <AuthShell>
      <h2 className="font-serif text-4xl text-[#1A1A1A]">{t('Sign in')}</h2>
      <p className="text-[15px] text-[#8A8A8A] mt-2">
        {t('Use your workspace credentials to continue.')}
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{t('Email')}</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@idap.mn"
              className="w-full pl-10 pr-3 py-3 bg-white border border-[#E3E3E3] rounded-md text-[15px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF3C21] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[#1A1A1A]">{t('Password')}</label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
            >
              {t('Forgot?')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#E3E3E3] rounded-md text-[15px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF3C21] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t('Hide password') : t('Show password')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <span
            className={cn(
              'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors shrink-0',
              remember
                ? 'bg-[#FF3C21] border-[#FF3C21]'
                : 'bg-white border-[#D4D4D4] hover:border-[#8A8A8A]',
            )}
          >
            {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm text-[#1A1A1A]">
            {t('Keep me signed in on this device')}
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#FF3C21] text-white text-[15px] font-medium rounded-md hover:bg-[#E63419] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t('Signing in…') : t('Sign in')}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>

        <div className="p-3.5 bg-[#FFF1EE] border border-[#FFD4C9] rounded-md flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#FF3C21] shrink-0 mt-0.5" />
          <p className="text-xs text-[#4A4A4A] leading-relaxed">
            {t('Demo login — any email and password will work. Session stays on this browser only.')}
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
