import { useState, FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/pages/login/AuthShell';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));
    setSubmitting(false);
    setSent(true);
  }

  return (
    <AuthShell>
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('Back to sign in')}
      </Link>

      {!sent ? (
        <>
          <h2 className="font-serif text-4xl text-[#1A1A1A]">{t('Reset password')}</h2>
          <p className="text-[15px] text-[#8A8A8A] mt-2">
            {t(
              'Enter the email tied to your workspace and we’ll send a link to set a new password.',
            )}
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#FF3C21] text-white text-[15px] font-medium rounded-md hover:bg-[#E63419] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? t('Sending…') : t('Send reset link')}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="p-3.5 bg-[#FFF1EE] border border-[#FFD4C9] rounded-md flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#FF3C21] shrink-0 mt-0.5" />
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                {t(
                  'Demo flow — no email is actually sent. Any address will show the success state.',
                )}
              </p>
            </div>
          </form>
        </>
      ) : (
        <div>
          <div className="w-11 h-11 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-5">
            <CheckCircle2 className="w-5 h-5 text-[#047857]" />
          </div>
          <h2 className="font-serif text-4xl text-[#1A1A1A]">{t('Check your email')}</h2>
          <p className="text-[15px] text-[#8A8A8A] mt-2 leading-relaxed">
            {t('We sent a reset link to')}{' '}
            <span className="font-medium text-[#1A1A1A]">{email || 'you@idap.mn'}</span>.{' '}
            {t('It should arrive within a minute.')}
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="w-full py-3 bg-[#FF3C21] text-white text-[15px] font-medium rounded-md hover:bg-[#E63419] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {t('Return to sign in')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full py-3 bg-white text-[#1A1A1A] text-[15px] font-medium rounded-md border border-[#E3E3E3] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              {t('Use a different email')}
            </button>
          </div>

          <p className="text-xs text-[#8A8A8A] mt-8 leading-relaxed">
            {t('Didn’t get the email? Check your spam folder or try again in a few minutes.')}
          </p>
        </div>
      )}
    </AuthShell>
  );
}
