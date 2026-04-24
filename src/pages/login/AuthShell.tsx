import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex bg-white font-sans text-[#1A1A1A] selection:bg-[#F3F3F3]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0B0B0B] text-white overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[620px] h-[620px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, #FF3C21, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 border border-dashed border-[#3A3A3A] rounded-md text-[11px] font-semibold tracking-[0.14em] text-[#8A8A8A] select-none">
              LOGO
            </div>
            <span className="px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-[#8A8A8A] uppercase">
              {t('Business')}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-xl">
            <h1 className="font-serif text-5xl xl:text-6xl leading-[1.05] tracking-tight text-white">
              {t('Signals that')}
              <br />
              {t('move your business.')}
            </h1>
            <p className="mt-7 text-[15px] text-[#9E9E9E] leading-relaxed max-w-md">
              {t(
                'Launch surveys, monitor responses, and turn respondent signals into decisions — without leaving your workspace.',
              )}
            </p>

            <div className="mt-14 flex items-center gap-14">
              <Stat label={t('Surveys')} value="24" />
              <Stat label={t('Responses')} value="4.7K" />
              <Stat label={t('Credits')} value="₮12M" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span>© 2026 iDap Business</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              {t('Private workspace')}
            </span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-20">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B6B6B] mb-2">{label}</div>
      <div className="text-2xl font-medium text-white">{value}</div>
    </div>
  );
}
