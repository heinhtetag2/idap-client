import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, ExternalLink, ChevronDown, Upload, Trash2,
  UserCircle, Bell, Globe, Building2,
  Plus, Check, Mail,
  Image as ImageIcon, Eye, EyeOff, Wallet, ShieldCheck, Monitor,
  CreditCard, Building, Smartphone, Star, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/shared/lib/cn';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { X } from 'lucide-react';

type SectionId =
  | 'Account'
  | 'Organisation'
  | 'Payment methods'
  | 'Notifications'
  | 'Language & region'
  | 'Privacy & data'
  | 'Sessions';

export default function Settings() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionId>('Account');
  const [search, setSearch] = useState('');

  const navigation = useMemo(
    () => [
      {
        category: t('Personal'),
        items: [
          {
            id: 'Account' as const,
            label: t('Account'),
            icon: UserCircle,
            keywords: [
              'profile', 'photo', 'avatar', 'first name', 'last name', 'job title',
              'country', 'city', 'email', 'password', 'login', 'mfa', '2fa',
              'two-factor', 'authenticator', 'delete account', 'danger zone',
            ],
          },
        ],
      },
      {
        category: t('Workspace'),
        items: [
          {
            id: 'Organisation' as const,
            label: t('Organisation'),
            icon: Building2,
            keywords: [
              'organisation', 'organization', 'org', 'company', 'workspace',
              'industry', 'size', 'team', 'members', 'logo', 'brand',
              'respondent region', 'market', 'mongolia',
            ],
          },
        ],
      },
      {
        category: t('Payments'),
        items: [
          {
            id: 'Payment methods' as const,
            label: t('Payment methods'),
            icon: Wallet,
            keywords: [
              'card', 'credit card', 'debit', 'visa', 'mastercard', 'bank',
              'qpay', 'bonum', 'mobile banking', 'billing', 'invoice',
              'receipt', 'top up', 'topup', 'credits', 'default method',
            ],
          },
        ],
      },
      {
        category: t('Preferences'),
        items: [
          {
            id: 'Notifications' as const,
            label: t('Notifications'),
            icon: Bell,
            keywords: [
              'email', 'in-app', 'push', 'alerts', 'digest', 'daily', 'weekly',
              'quiet hours', 'survey milestone', 'response target', 'reward',
              'low credit', 'invoice reminder', 'mute', 'sound',
            ],
          },
          {
            id: 'Language & region' as const,
            label: t('Language & region'),
            icon: Globe,
            keywords: [
              'language', 'locale', 'english', 'korean', 'french', 'spanish',
              'timezone', 'time zone', 'utc', 'date format', 'time format',
              '12-hour', '24-hour', 'currency', 'mnt',
            ],
          },
        ],
      },
      {
        category: t('Privacy & security'),
        items: [
          {
            id: 'Privacy & data' as const,
            label: t('Privacy & data'),
            icon: ShieldCheck,
            keywords: [
              'data export', 'download data', 'retention', 'gdpr', 'consent',
              'third party', 'analytics', 'cookies', 'tracking', 'marketing',
              'usage policy', 'terms',
            ],
          },
          {
            id: 'Sessions' as const,
            label: t('Sessions'),
            icon: Monitor,
            keywords: [
              'device', 'browser', 'ip address', 'location', 'last active',
              'sign out', 'log out', 'logout', 'revoke', 'active session',
              'trusted device',
            ],
          },
        ],
      },
    ],
    [t],
  );

  const filteredNav = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return navigation;
    return navigation
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => {
          if (i.label.toLowerCase().includes(q)) return true;
          return i.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [navigation, search]);

  const trimmedSearch = search.trim();
  const matchCount = useMemo(
    () => filteredNav.reduce((sum, g) => sum + g.items.length, 0),
    [filteredNav],
  );

  const activeCategory =
    navigation.find((g) => g.items.some((i) => i.id === activeSection))?.category ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full bg-[#FAFAF9] flex-col md:flex-row overflow-hidden w-full max-w-none"
    >
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-64 border-r border-[#E3E3E3] bg-white flex flex-col shrink-0 h-full overflow-y-auto">
        <div className="p-4 shrink-0">
          <h2 className="text-lg font-medium text-[#1A1A1A] mb-4">{t('Settings')}</h2>
          <div
            className={cn(
              'relative rounded-md border bg-white transition-colors',
              trimmedSearch ? 'border-[#FF3C21]' : 'border-[#E3E3E3] focus-within:border-[#FF3C21]',
            )}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search')}
              className="w-full pl-9 pr-9 py-2 bg-transparent rounded-md text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none"
            />
            {trimmedSearch && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label={t('Clear search')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {trimmedSearch && (
            <div className="mt-3 text-xs text-[#8A8A8A]">
              {matchCount === 0
                ? t('No results for')
                : t('{{count}} results for', { count: matchCount, defaultValue: `${matchCount} results for` })}{' '}
              <span className="text-[#1A1A1A] font-medium">"{trimmedSearch}"</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-2 pb-4 space-y-6">
          {filteredNav.map((group) => (
            <div key={group.category}>
              <div className="px-3 mb-2 text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                {group.category}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 cursor-pointer',
                        isActive
                          ? 'bg-[#FFF1EE] text-[#FF3C21] font-medium'
                          : 'text-[#3F3F46] hover:bg-[#F3F3F3]',
                      )}
                    >
                      <Icon
                        className={cn('w-4 h-4', isActive ? 'text-[#FF3C21]' : 'text-[#8A8A8A]')}
                      />
                      <HighlightedLabel text={item.label} query={trimmedSearch} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredNav.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-[#8A8A8A]">
              {t('No settings match your search.')}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-14 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <span className="text-sm text-[#8A8A8A] font-medium">{activeCategory}</span>
            <h1 className="text-3xl font-serif text-[#1A1A1A] mt-1">{t(activeSection)}</h1>
            {activeSection === 'Account' && (
              <p className="text-sm text-[#8A8A8A] mt-8 leading-relaxed max-w-3xl">
                {t('By using iDap you acknowledge and agree to abide by the')}{' '}
                <a href="#" className="font-medium underline hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-1">
                  {t('Usage Policy')} <ExternalLink className="w-3 h-3" />
                </a>{' '}
                {t('and')}{' '}
                <a href="#" className="font-medium underline hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-1">
                  {t('Terms of Use')} <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            )}
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'Account' && <AccountSection />}
              {activeSection === 'Organisation' && <OrganisationSection />}
              {activeSection === 'Payment methods' && <PaymentMethodsSection />}
              {activeSection === 'Notifications' && <NotificationsSection />}
              {activeSection === 'Language & region' && <LanguageRegionSection />}
              {activeSection === 'Privacy & data' && <PrivacyDataSection />}
              {activeSection === 'Sessions' && <SessionsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Shared field primitives ---------- */

function HighlightedLabel({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#FF3C21] font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full px-3 py-2.5 bg-white border border-[#E3E3E3] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF3C21] transition-colors',
        props.readOnly && 'bg-[#F3F3F3] border-transparent text-[#8A8A8A] cursor-not-allowed',
        props.className,
      )}
    />
  );
}

function NativeSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[#E3E3E3] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF3C21] transition-colors cursor-pointer',
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
    </div>
  );
}

function SectionCard({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div>
      <h3
        className={cn(
          'text-lg font-medium mb-4',
          danger ? 'text-[#DC2626]' : 'text-[#1A1A1A]',
        )}
      >
        {title}
      </h3>
      <div
        className={cn(
          'bg-white border rounded-md p-6 transition-colors',
          danger ? 'border-[#E3E3E3] hover:border-[#F5DBDB]' : 'border-[#E3E3E3]',
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-[#FF3C21]' : 'bg-[#E3E3E3]',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

/* Reusable drawer chrome — header + scrollable body + sticky footer */
function SettingsDrawer({
  open,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  };
  secondaryAction?: { label: string; onClick: () => void };
}) {
  const { t } = useTranslation();
  return (
    <Drawer direction="right" open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[#E3E3E3]">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3E3E3] flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-semibold text-[#1A1A1A]">{title}</DrawerTitle>
              {description && (
                <DrawerDescription className="text-sm text-[#8A8A8A] mt-0.5">
                  {description}
                </DrawerDescription>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
          {(primaryAction || secondaryAction) && (
            <div className="px-6 py-3 border-t border-[#E3E3E3] bg-[#FAFAFA] flex items-center gap-2 shrink-0">
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {secondaryAction.label}
                </button>
              )}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className={cn(
                    'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-white',
                    primaryAction.danger
                      ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                      : 'bg-[#FF3C21] hover:bg-[#E63419]',
                  )}
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ---------- Sections ---------- */

function AccountSection() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('Hein');
  const [lastName, setLastName] = useState('Htet');
  const [jobTitle, setJobTitle] = useState('Research Lead');
  const [country, setCountry] = useState('Mongolia');
  const [city, setCity] = useState('Ulaanbaatar');
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-8 pb-20">
      <SectionCard title={t('Profile')}>
        <div className="mb-8">
          <FieldLabel>{t('Profile image')}</FieldLabel>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full border border-[#E3E3E3] bg-white flex items-center justify-center text-[#1A1A1A] text-xl font-medium shrink-0">
              {firstName[0]}
              {lastName[0]}
            </div>
            <div className="space-y-3">
              <p className="text-xs text-[#8A8A8A]">
                {t('Upload a JPG or PNG up to 5MB. Shown next to your name to teammates.')}
              </p>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#8A8A8A]" />
                {t('Upload image')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <FieldLabel>{t('First name')}</FieldLabel>
            <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <FieldLabel>{t('Last name')}</FieldLabel>
            <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div className="mb-6">
          <FieldLabel>{t('Job title')}</FieldLabel>
          <TextInput
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={t('e.g. Product Manager, Researcher')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel>{t('Country')}</FieldLabel>
            <NativeSelect value={country} onChange={setCountry}>
              <option>Mongolia</option>
              <option>South Korea</option>
              <option>Japan</option>
              <option>United States</option>
              <option>United Kingdom</option>
            </NativeSelect>
          </div>
          <div>
            <FieldLabel>{t('City')}</FieldLabel>
            <TextInput value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
      </SectionCard>

      <LoginDetailsCard />

      <SectionCard title={t('Delete account')} danger>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="block text-sm font-medium text-[#DC2626] mb-1">{t('Danger zone')}</span>
            <p className="text-sm text-[#8A8A8A]">
              {t('Permanently delete your account, surveys, and all associated data.')}
            </p>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#F3F3F3] rounded-md text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#F5DBDB] transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {t('Delete my account')}
          </button>
        </div>
      </SectionCard>

      <DeleteAccountDrawer open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}

function DeleteAccountDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE' && password.length > 0;

  const reset = () => {
    setConfirmText('');
    setPassword('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  return (
    <SettingsDrawer
      open={open}
      onClose={handleClose}
      title={t('Delete account')}
      description={t('This cannot be undone. Take a moment.')}
      secondaryAction={{ label: t('Cancel'), onClick: handleClose }}
      primaryAction={{
        label: t('Permanently delete account'),
        onClick: handleClose,
        disabled: !canDelete,
        danger: true,
      }}
    >
      <div className="space-y-6">
        <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#7F1D1D]">
          <div className="font-medium mb-2">{t('You will lose')}</div>
          <ul className="list-disc pl-5 space-y-1 text-[#7F1D1D]">
            <li>{t('All surveys, drafts, and templates')}</li>
            <li>{t('Every collected response and export history')}</li>
            <li>{t('Remaining credit balance — credits are non-refundable')}</li>
            <li>{t('Access to this workspace and any teammates you invited')}</li>
          </ul>
        </div>

        <div>
          <FieldLabel>
            {t('Type')} <span className="font-mono">DELETE</span> {t('to confirm')}
          </FieldLabel>
          <TextInput
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="font-mono"
          />
        </div>

        <div>
          <FieldLabel>{t('Confirm with your password')}</FieldLabel>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>
    </SettingsDrawer>
  );
}

function LoginDetailsCard() {
  const { t } = useTranslation();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [mfaOpen, setMfaOpen] = useState(false);
  const [email, setEmail] = useState('heincise@gmail.com');

  return (
    <SectionCard title={t('Login details')}>
      {/* Email row */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <FieldLabel>{t('Email')}</FieldLabel>
          <TextInput type="email" value={email} readOnly />
        </div>
        <button
          onClick={() => setEmailOpen(true)}
          className="px-4 py-2.5 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
        >
          {t('Change email')}
        </button>
      </div>

      <div className="h-px w-full bg-[#E3E3E3] my-8" />

      {/* Password row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#1A1A1A]">{t('Password')}</div>
          <p className="text-sm text-[#8A8A8A] mt-1">{t('Last changed 3 months ago.')}</p>
        </div>
        <button
          onClick={() => setPwOpen(true)}
          className="px-4 py-2.5 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
        >
          {t('Change password')}
        </button>
      </div>

      <div className="h-px w-full bg-[#E3E3E3] my-8" />

      {/* Two-step verification row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#1A1A1A]">{t('Two-step verification')}</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-medium',
                mfaEnabled ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF2F2] text-[#DC2626]',
              )}
            >
              {mfaEnabled ? t('Enabled') : t('Not enabled')}
            </span>
          </div>
          <p className="text-sm text-[#8A8A8A] mt-1">
            {t('Protect your account with an extra sign-in step.')}
          </p>
        </div>
        <button
          onClick={() => (mfaEnabled ? setMfaEnabled(false) : setMfaOpen(true))}
          className="px-4 py-2.5 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
        >
          {mfaEnabled ? t('Disable') : t('Enable')}
        </button>
      </div>

      <ChangePasswordDrawer open={pwOpen} onClose={() => setPwOpen(false)} />
      <ChangeEmailDrawer
        open={emailOpen}
        currentEmail={email}
        onClose={() => setEmailOpen(false)}
        onChanged={(next) => setEmail(next)}
      />
      <EnableMfaDrawer
        open={mfaOpen}
        onClose={() => setMfaOpen(false)}
        onEnabled={() => setMfaEnabled(true)}
      />
    </SectionCard>
  );
}

function EnableMfaDrawer({
  open,
  onClose,
  onEnabled,
}: {
  open: boolean;
  onClose: () => void;
  onEnabled: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'scan' | 'verify' | 'backup'>('scan');
  const [code, setCode] = useState('');
  const secret = 'JBSW Y3DP EHPK 3PXP';
  const backupCodes = [
    'a1b2-c3d4', '9f8e-7d6c', '5b4a-3210', 'qz9x-7w6v',
    'mn5l-4k3j', 'ph2g-1f0e', 'rt6y-5u4i', 'op3a-2s1d',
  ];

  const reset = () => {
    setStep('scan');
    setCode('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const finish = () => {
    onEnabled();
    handleClose();
  };

  return (
    <SettingsDrawer
      open={open}
      onClose={handleClose}
      title={
        step === 'backup' ? t('Save your backup codes') : t('Enable two-step verification')
      }
      description={
        step === 'scan'
          ? t('Step 1 of 3 — scan the QR code with an authenticator app.')
          : step === 'verify'
          ? t('Step 2 of 3 — enter the 6-digit code.')
          : t('Step 3 of 3 — store these somewhere safe.')
      }
      secondaryAction={
        step === 'scan'
          ? { label: t('Cancel'), onClick: handleClose }
          : step === 'verify'
          ? { label: t('Back'), onClick: () => setStep('scan') }
          : undefined
      }
      primaryAction={
        step === 'scan'
          ? { label: t('Continue'), onClick: () => setStep('verify') }
          : step === 'verify'
          ? {
              label: t('Verify'),
              onClick: () => setStep('backup'),
              disabled: code.length !== 6,
            }
          : { label: t("I've saved my codes"), onClick: finish }
      }
    >
      {step === 'scan' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-44 h-44 rounded-md border border-[#E3E3E3] bg-[repeating-conic-gradient(#1A1A1A_0_25%,#FFFFFF_0_50%)] bg-[length:14px_14px] flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-[10px] font-mono text-[#8A8A8A]">
                QR
              </div>
            </div>
          </div>
          <div>
            <FieldLabel>{t('Or enter this key manually')}</FieldLabel>
            <TextInput value={secret} readOnly className="font-mono text-center tracking-wider" />
          </div>
          <p className="text-xs text-[#8A8A8A]">
            {t('Recommended apps: 1Password, Authy, Google Authenticator.')}
          </p>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div>
            <FieldLabel>{t('6-digit code from your app')}</FieldLabel>
            <TextInput
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="text-center tracking-[0.5em] font-mono text-lg"
            />
          </div>
          <p className="text-xs text-[#8A8A8A]">
            {t('Codes refresh every 30 seconds. Make sure your device clock is correct.')}
          </p>
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-4">
          <div className="rounded-md border border-[#FDE68A] bg-[#FFF8E1] p-4 text-xs text-[#92400E]">
            {t('If you lose your authenticator, these single-use codes are the only way back in.')}
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((c) => (
              <div
                key={c}
                className="px-3 py-2 rounded-md border border-[#E3E3E3] bg-[#FAFAFA] text-center text-[#1A1A1A]"
              >
                {c}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(backupCodes.join('\n'))}
            className="text-xs text-[#1A1A1A] hover:underline cursor-pointer"
          >
            {t('Copy all codes')}
          </button>
        </div>
      )}
    </SettingsDrawer>
  );
}

function ChangeEmailDrawer({
  open,
  currentEmail,
  onClose,
  onChanged,
}: {
  open: boolean;
  currentEmail: string;
  onClose: () => void;
  onChanged: (newEmail: string) => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const reset = () => {
    setStep('request');
    setNewEmail('');
    setPassword('');
    setCode('');
    setResendIn(0);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
  const isSameAsCurrent = newEmail.trim().toLowerCase() === currentEmail.toLowerCase();
  const canRequest = emailValid && !isSameAsCurrent && password.length > 0;
  const canVerify = code.length === 6;

  const sendCode = () => {
    if (!canRequest) return;
    setStep('verify');
    setResendIn(30);
    const timer = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const verify = () => {
    if (!canVerify) return;
    onChanged(newEmail);
    setStep('success');
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[#E3E3E3]">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3E3E3] flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-semibold text-[#1A1A1A]">
                {step === 'success' ? t('Email updated') : t('Change email')}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-[#8A8A8A] mt-0.5">
                {step === 'request' && t('We will send a 6-digit code to confirm the new address.')}
                {step === 'verify' && t('Enter the code we just sent.')}
                {step === 'success' && t('Use your new email to sign in next time.')}
              </DrawerDescription>
            </div>
            <button
              onClick={handleClose}
              className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {step === 'request' && (
              <>
                <div>
                  <FieldLabel>{t('Current email')}</FieldLabel>
                  <TextInput value={currentEmail} readOnly />
                </div>
                <div>
                  <FieldLabel>{t('New email')}</FieldLabel>
                  <TextInput
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  {newEmail.length > 0 && !emailValid && (
                    <p className="text-xs text-[#DC2626] mt-2">
                      {t('Enter a valid email address.')}
                    </p>
                  )}
                  {emailValid && isSameAsCurrent && (
                    <p className="text-xs text-[#DC2626] mt-2">
                      {t('That is already your current email.')}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel>{t('Confirm with your password')}</FieldLabel>
                  <TextInput
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {step === 'verify' && (
              <>
                <div className="flex items-start gap-3 p-4 rounded-md bg-[#FFF1EE]">
                  <Mail className="w-5 h-5 text-[#FF3C21] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#1A1A1A] min-w-0">
                    <div>
                      {t('We sent a code to')}{' '}
                      <span className="font-medium break-all">{newEmail}</span>
                    </div>
                    <button
                      onClick={() => setStep('request')}
                      className="text-xs text-[#FF3C21] hover:underline mt-1 cursor-pointer"
                    >
                      {t('Use a different email')}
                    </button>
                  </div>
                </div>
                <div>
                  <FieldLabel>{t('6-digit verification code')}</FieldLabel>
                  <TextInput
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="text-center tracking-[0.5em] font-mono text-lg"
                  />
                </div>
                <div className="text-xs text-[#8A8A8A]">
                  {resendIn > 0 ? (
                    <>{t('Resend code in')} {resendIn}s</>
                  ) : (
                    <button
                      onClick={() => setResendIn(30)}
                      className="text-[#1A1A1A] hover:underline cursor-pointer"
                    >
                      {t('Resend code')}
                    </button>
                  )}
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-[#047857]" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  {t('All set')}
                </h3>
                <p className="text-sm text-[#8A8A8A] mt-1 max-w-xs">
                  {t('Your email is now')} <span className="font-medium text-[#1A1A1A] break-all">{newEmail}</span>.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-[#E3E3E3] bg-[#FAFAFA] flex items-center gap-2 shrink-0">
            {step === 'request' && (
              <>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={sendCode}
                  disabled={!canRequest}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-[#FF3C21] text-white rounded-md hover:bg-[#E63419] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('Send code')}
                </button>
              </>
            )}
            {step === 'verify' && (
              <>
                <button
                  onClick={() => setStep('request')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {t('Back')}
                </button>
                <button
                  onClick={verify}
                  disabled={!canVerify}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-[#FF3C21] text-white rounded-md hover:bg-[#E63419] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('Verify and update')}
                </button>
              </>
            )}
            {step === 'success' && (
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-black transition-colors cursor-pointer"
              >
                {t('Done')}
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ChangePasswordDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);

  const canSubmit = current.length > 0 && next.length >= 12 && next === confirm;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setCurrent('');
    setNext('');
    setConfirm('');
    onClose();
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[#E3E3E3]">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E3E3E3] flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-semibold text-[#1A1A1A]">
                {t('Change password')}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-[#8A8A8A] mt-0.5">
                {t('You will need to sign in again on other devices.')}
              </DrawerDescription>
            </div>
            <button
              onClick={onClose}
              className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <FieldLabel>{t('Current password')}</FieldLabel>
              <div className="relative">
                <TextInput
                  type={showCurrent ? 'text' : 'password'}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A] cursor-pointer"
                  aria-label={showCurrent ? t('Hide password') : t('Show password')}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>{t('New password')}</FieldLabel>
              <TextInput
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-[#8A8A8A] mt-2">
                {t('At least 12 characters with a mix of letters, numbers, and symbols.')}
              </p>
            </div>

            <div>
              <FieldLabel>{t('Confirm new password')}</FieldLabel>
              <TextInput
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
              {confirm.length > 0 && confirm !== next && (
                <p className="text-xs text-[#DC2626] mt-2">{t('Passwords do not match.')}</p>
              )}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-[#E3E3E3] bg-[#FAFAFA] flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2 text-sm font-medium bg-[#FF3C21] text-white rounded-md hover:bg-[#E63419] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('Update password')}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function NotificationsSection() {
  const { t } = useTranslation();
  type Pref = { email: boolean; inApp: boolean };
  const [prefs, setPrefs] = useState<Record<string, Pref>>({
    surveyLaunched: { email: true, inApp: true },
    targetReached: { email: true, inApp: true },
    surveyCompleted: { email: false, inApp: true },
    lowCredits: { email: true, inApp: true },
    paymentReceipt: { email: true, inApp: false },
    newSignIn: { email: true, inApp: false },
    weeklyDigest: { email: true, inApp: false },
  });

  const groups: { title: string; items: { key: keyof typeof prefs; label: string; hint: string }[] }[] = [
    {
      title: t('Surveys'),
      items: [
        { key: 'surveyLaunched', label: t('Survey launched'), hint: t('When a draft survey goes live.') },
        { key: 'targetReached', label: t('Response target reached'), hint: t('When a survey hits its response goal.') },
        { key: 'surveyCompleted', label: t('Survey completed'), hint: t('When a survey is closed and final results are ready.') },
      ],
    },
    {
      title: t('Billing'),
      items: [
        { key: 'lowCredits', label: t('Low credit balance'), hint: t('When your balance falls below ₮100,000.') },
        { key: 'paymentReceipt', label: t('Payment receipt'), hint: t('When a top-up or invoice is charged.') },
      ],
    },
    {
      title: t('Account'),
      items: [
        { key: 'newSignIn', label: t('New sign-in'), hint: t('When your account is accessed from a new device.') },
        { key: 'weeklyDigest', label: t('Weekly digest'), hint: t('Summary of activity across your workspace.') },
      ],
    },
  ];

  const update = (key: string, channel: keyof Pref, value: boolean) =>
    setPrefs((p) => ({ ...p, [key]: { ...p[key], [channel]: value } }));

  return (
    <div className="space-y-8 pb-20">
      {groups.map((group) => (
        <SectionCard key={group.title} title={group.title}>
          <div className="-mx-6 -my-6">
            <div className="hidden sm:grid grid-cols-[1fr_72px_72px] items-center px-6 py-3 border-b border-[#F3F3F3] text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
              <span>{t('Event')}</span>
              <span className="text-center">{t('Email')}</span>
              <span className="text-center">{t('In-app')}</span>
            </div>
            {group.items.map((item, idx) => (
              <div
                key={item.key}
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-[1fr_72px_72px] items-center gap-3 px-6 py-4',
                  idx < group.items.length - 1 && 'border-b border-[#F3F3F3]',
                )}
              >
                <div>
                  <div className="text-sm font-medium text-[#1A1A1A]">{item.label}</div>
                  <div className="text-xs text-[#8A8A8A] mt-0.5">{item.hint}</div>
                </div>
                <div className="flex sm:justify-center items-center gap-2">
                  <span className="sm:hidden text-xs text-[#8A8A8A]">{t('Email')}</span>
                  <Toggle
                    checked={prefs[item.key].email}
                    onChange={(v) => update(item.key, 'email', v)}
                    label={`${item.label} — ${t('Email')}`}
                  />
                </div>
                <div className="flex sm:justify-center items-center gap-2">
                  <span className="sm:hidden text-xs text-[#8A8A8A]">{t('In-app')}</span>
                  <Toggle
                    checked={prefs[item.key].inApp}
                    onChange={(v) => update(item.key, 'inApp', v)}
                    label={`${item.label} — ${t('In-app')}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function LanguageRegionSection() {
  const { t, i18n } = useTranslation();
  const [timezone, setTimezone] = useState('Asia/Ulaanbaatar');
  const [dateFormat, setDateFormat] = useState('MMM d, yyyy');
  const [timeFormat, setTimeFormat] = useState('24h');

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white border border-[#E3E3E3] rounded-md p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <FieldLabel>{t('Display language')}</FieldLabel>
            <p className="text-xs text-[#8A8A8A] mb-3">
              {t('Language used across the iDap interface.')}
            </p>
            <NativeSelect value={i18n.language} onChange={(v) => i18n.changeLanguage(v)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="ko">한국어</option>
            </NativeSelect>
          </div>

          <div>
            <FieldLabel>{t('Timezone')}</FieldLabel>
            <p className="text-xs text-[#8A8A8A] mb-3">
              {t('Used for survey schedules and invoice dates.')}
            </p>
            <NativeSelect value={timezone} onChange={setTimezone}>
              <option value="Asia/Ulaanbaatar">Asia/Ulaanbaatar (UTC+8)</option>
              <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="America/New_York">America/New_York (UTC−5)</option>
            </NativeSelect>
          </div>

          <div>
            <FieldLabel>{t('Date format')}</FieldLabel>
            <NativeSelect value={dateFormat} onChange={setDateFormat}>
              <option value="MMM d, yyyy">MMM d, yyyy</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </NativeSelect>
          </div>

          <div>
            <FieldLabel>{t('Time format')}</FieldLabel>
            <NativeSelect value={timeFormat} onChange={setTimeFormat}>
              <option value="24h">{t('24-hour')} (14:30)</option>
              <option value="12h">{t('12-hour')} (2:30 PM)</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#8A8A8A] px-1">
        {t('Workspace currency is ₮ MNT. Contact support to change.')}
      </p>
    </div>
  );
}

function OrganisationSection() {
  const { t } = useTranslation();
  const [name, setName] = useState("Hein's Org");
  const [industry, setIndustry] = useState('Market research');
  const [size, setSize] = useState('2-10');
  const [respondentRegion, setRespondentRegion] = useState('Mongolia');

  return (
    <div className="space-y-8 pb-20">
      <SectionCard title={t('Workspace')}>
        <div className="mb-8">
          <FieldLabel>{t('Workspace logo')}</FieldLabel>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-md border border-dashed border-[#E3E3E3] bg-[#FAFAFA] flex items-center justify-center text-[#8A8A8A] shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <p className="text-xs text-[#8A8A8A]">
                {t('PNG or SVG, square, at least 256×256. Shown in the sidebar and on respondent surveys.')}
              </p>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#8A8A8A]" />
                {t('Upload logo')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <FieldLabel>{t('Organisation name')}</FieldLabel>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <FieldLabel>{t('Industry')}</FieldLabel>
            <NativeSelect value={industry} onChange={setIndustry}>
              <option>Market research</option>
              <option>Consumer brands</option>
              <option>Financial services</option>
              <option>Government &amp; non-profit</option>
              <option>Education</option>
              <option>Other</option>
            </NativeSelect>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel>{t('Company size')}</FieldLabel>
            <NativeSelect value={size} onChange={setSize}>
              <option value="1">{t('Just me')}</option>
              <option value="2-10">2-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="200+">200+</option>
            </NativeSelect>
          </div>
          <div>
            <FieldLabel>{t('Primary respondent region')}</FieldLabel>
            <NativeSelect value={respondentRegion} onChange={setRespondentRegion}>
              <option>Mongolia</option>
              <option>South Korea</option>
              <option>Japan</option>
              <option>Global</option>
            </NativeSelect>
          </div>
        </div>
      </SectionCard>

    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[#1A1A1A]">{label}</div>
        <div className="text-xs text-[#8A8A8A] mt-0.5">{hint}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

type PaymentMethod = {
  id: string;
  kind: 'card' | 'bank' | 'wallet';
  label: string;
  detail: string;
  isDefault: boolean;
};

function PaymentMethodsSection() {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: 'p1', kind: 'card', label: 'Visa', detail: '•••• 4242 · exp 06/28', isDefault: true },
    { id: 'p2', kind: 'wallet', label: 'QPay', detail: '+976 9911 ••42', isDefault: false },
    { id: 'p3', kind: 'bank', label: 'Khan Bank', detail: 'IBAN MN •••• 0193', isDefault: false },
  ]);
  const [autoRecharge, setAutoRecharge] = useState(true);
  const [threshold, setThreshold] = useState('100000');
  const [topupAmount, setTopupAmount] = useState('500000');
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<PaymentMethod | null>(null);

  const setDefault = (id: string) =>
    setMethods((ms) => ms.map((m) => ({ ...m, isDefault: m.id === id })));
  const removeMethod = (id: string) =>
    setMethods((ms) => ms.filter((m) => m.id !== id || m.isDefault));
  const addMethod = (m: PaymentMethod) => setMethods((ms) => [...ms, m]);

  const iconFor = (kind: PaymentMethod['kind']) =>
    kind === 'card' ? CreditCard : kind === 'wallet' ? Smartphone : Building;

  return (
    <div className="space-y-8 pb-20">
      <SectionCard title={t('Saved methods')}>
        <div className="-mx-6 -mt-6 -mb-6">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#F3F3F3]">
            <span className="text-xs text-[#8A8A8A]">
              {t('Used to top up credits and pay your monthly invoice.')}
            </span>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] text-white rounded-md text-sm font-medium hover:bg-black transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t('Add method')}
            </button>
          </div>
          <div className="divide-y divide-[#F3F3F3]">
            {methods.map((m) => {
              const Icon = iconFor(m.kind);
              return (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-md bg-[#F3F3F3] text-[#4A4A4A] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1A1A1A]">{m.label}</span>
                      {m.isDefault && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF1EE] text-[#FF3C21] text-[11px] font-medium inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {t('Default')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#8A8A8A] mt-0.5 font-mono">{m.detail}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!m.isDefault && (
                      <button
                        onClick={() => setDefault(m.id)}
                        className="text-sm text-[#1A1A1A] hover:underline cursor-pointer"
                      >
                        {t('Make default')}
                      </button>
                    )}
                    {!m.isDefault && (
                      <button
                        onClick={() => setRemoving(m)}
                        className="text-sm text-[#DC2626] hover:underline cursor-pointer"
                      >
                        {t('Remove')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('Auto top-up')}>
        <div className="space-y-5">
          <ToggleRow
            label={t('Automatically top up credits when low')}
            hint={t('We charge your default method to keep your workspace running.')}
            checked={autoRecharge}
            onChange={setAutoRecharge}
          />
          {autoRecharge && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <FieldLabel>{t('Trigger when balance is below (₮)')}</FieldLabel>
                <TextInput
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  min={0}
                  step={50000}
                />
              </div>
              <div>
                <FieldLabel>{t('Top-up amount (₮)')}</FieldLabel>
                <TextInput
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min={50000}
                  step={50000}
                />
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title={t('Billing contact')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel>{t('Invoice email')}</FieldLabel>
            <TextInput type="email" defaultValue="billing@heinsorg.mn" />
          </div>
          <div>
            <FieldLabel>{t('Tax ID (optional)')}</FieldLabel>
            <TextInput defaultValue="" placeholder="MN-1234567" />
          </div>
        </div>
      </SectionCard>

      <AddPaymentMethodDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addMethod}
      />
      <RemovePaymentMethodDrawer
        method={removing}
        onClose={() => setRemoving(null)}
        onConfirm={(id) => {
          removeMethod(id);
          setRemoving(null);
        }}
      />
    </div>
  );
}

function AddPaymentMethodDrawer({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (m: PaymentMethod) => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'pick' | 'card' | 'qpay' | 'bank'>('pick');

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // QPay form
  const [phone, setPhone] = useState('');

  // Bank form
  const [bankName, setBankName] = useState('Khan Bank');
  const [iban, setIban] = useState('');

  const reset = () => {
    setStep('pick');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
    setPhone('');
    setBankName('Khan Bank');
    setIban('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const cardValid =
    cardNumber.replace(/\s/g, '').length >= 13 &&
    /^\d{2}\/\d{2}$/.test(cardExpiry) &&
    cardCvc.length >= 3 &&
    cardName.trim().length > 0;
  const qpayValid = phone.replace(/\D/g, '').length >= 8;
  const bankValid = bankName.trim().length > 0 && iban.replace(/\s/g, '').length >= 10;

  const submit = () => {
    if (step === 'card' && cardValid) {
      const last4 = cardNumber.replace(/\D/g, '').slice(-4);
      onAdd({
        id: `p${Date.now()}`,
        kind: 'card',
        label: 'Card',
        detail: `•••• ${last4} · exp ${cardExpiry}`,
        isDefault: false,
      });
      handleClose();
    } else if (step === 'qpay' && qpayValid) {
      const masked = phone.replace(/\D/g, '').replace(/(\d{4})(\d{2})$/, '••$2');
      onAdd({
        id: `p${Date.now()}`,
        kind: 'wallet',
        label: 'QPay',
        detail: `+976 ${masked}`,
        isDefault: false,
      });
      handleClose();
    } else if (step === 'bank' && bankValid) {
      const last4 = iban.replace(/\s/g, '').slice(-4);
      onAdd({
        id: `p${Date.now()}`,
        kind: 'bank',
        label: bankName,
        detail: `IBAN MN •••• ${last4}`,
        isDefault: false,
      });
      handleClose();
    }
  };

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const isPick = step === 'pick';
  const canSubmit =
    (step === 'card' && cardValid) ||
    (step === 'qpay' && qpayValid) ||
    (step === 'bank' && bankValid);

  return (
    <SettingsDrawer
      open={open}
      onClose={handleClose}
      title={t('Add payment method')}
      description={
        isPick
          ? t('Choose how you would like to pay.')
          : step === 'card'
          ? t('Enter your card details.')
          : step === 'qpay'
          ? t('We will send a QPay link to confirm.')
          : t('We will verify with a small deposit.')
      }
      secondaryAction={
        isPick
          ? { label: t('Cancel'), onClick: handleClose }
          : { label: t('Back'), onClick: () => setStep('pick') }
      }
      primaryAction={
        isPick
          ? undefined
          : { label: t('Add method'), onClick: submit, disabled: !canSubmit }
      }
    >
      {isPick && (
        <div className="space-y-3">
          <PaymentTypeTile
            icon={<CreditCard className="w-5 h-5" />}
            title={t('Credit or debit card')}
            hint={t('Visa, Mastercard, Amex.')}
            onClick={() => setStep('card')}
          />
          <PaymentTypeTile
            icon={<Smartphone className="w-5 h-5" />}
            title="QPay"
            hint={t('Pay from your QPay wallet.')}
            onClick={() => setStep('qpay')}
          />
          <PaymentTypeTile
            icon={<Building className="w-5 h-5" />}
            title={t('Bank transfer')}
            hint={t('Direct debit from a Mongolian bank account.')}
            onClick={() => setStep('bank')}
          />
        </div>
      )}

      {step === 'card' && (
        <div className="space-y-5">
          <div>
            <FieldLabel>{t('Card number')}</FieldLabel>
            <TextInput
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t('Expiry')}</FieldLabel>
              <TextInput
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
              />
            </div>
            <div>
              <FieldLabel>CVC</FieldLabel>
              <TextInput
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
          </div>
          <div>
            <FieldLabel>{t('Name on card')}</FieldLabel>
            <TextInput
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Hein Htet"
              autoComplete="cc-name"
            />
          </div>
        </div>
      )}

      {step === 'qpay' && (
        <div className="space-y-5">
          <div>
            <FieldLabel>{t('QPay phone number')}</FieldLabel>
            <div className="flex gap-2">
              <div className="px-3 py-2.5 bg-[#F3F3F3] rounded-md text-sm text-[#4A4A4A] shrink-0">
                +976
              </div>
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="9911 4242"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      )}

      {step === 'bank' && (
        <div className="space-y-5">
          <div>
            <FieldLabel>{t('Bank')}</FieldLabel>
            <NativeSelect value={bankName} onChange={setBankName}>
              <option>Khan Bank</option>
              <option>Golomt Bank</option>
              <option>TDB Bank</option>
              <option>State Bank</option>
              <option>Khas Bank</option>
            </NativeSelect>
          </div>
          <div>
            <FieldLabel>IBAN</FieldLabel>
            <TextInput
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              placeholder="MN12 3456 7890 1234"
              className="font-mono"
            />
          </div>
        </div>
      )}
    </SettingsDrawer>
  );
}

function PaymentTypeTile({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-md border border-[#E3E3E3] bg-white hover:border-[#FF3C21] hover:bg-[#FFF8F6] transition-colors text-left cursor-pointer"
    >
      <div className="w-10 h-10 rounded-md bg-[#F3F3F3] text-[#4A4A4A] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#1A1A1A]">{title}</div>
        <div className="text-xs text-[#8A8A8A] mt-0.5">{hint}</div>
      </div>
    </button>
  );
}

function RemovePaymentMethodDrawer({
  method,
  onClose,
  onConfirm,
}: {
  method: PaymentMethod | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <SettingsDrawer
      open={!!method}
      onClose={onClose}
      title={t('Remove payment method')}
      description={method ? t('You can add it back later.') : undefined}
      secondaryAction={{ label: t('Cancel'), onClick: onClose }}
      primaryAction={
        method
          ? {
              label: t('Remove'),
              onClick: () => onConfirm(method.id),
              danger: true,
            }
          : undefined
      }
    >
      {method && (
        <div className="rounded-md border border-[#E3E3E3] bg-[#FAFAFA] p-4">
          <div className="text-sm font-medium text-[#1A1A1A]">{method.label}</div>
          <div className="text-xs text-[#8A8A8A] mt-1 font-mono">{method.detail}</div>
        </div>
      )}
    </SettingsDrawer>
  );
}

function PrivacyDataSection() {
  const { t } = useTranslation();
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [maskRespondents, setMaskRespondents] = useState(true);
  const [retention, setRetention] = useState('365');
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="space-y-8 pb-20">
      <SectionCard title={t('Data controls')}>
        <div className="space-y-5">
          <ToggleRow
            label={t('Mask respondent identities in exports')}
            hint={t('Replace names and emails with anonymised IDs in CSV downloads.')}
            checked={maskRespondents}
            onChange={setMaskRespondents}
          />
          <div className="h-px w-full bg-[#F3F3F3]" />
          <ToggleRow
            label={t('Help improve iDap')}
            hint={t('Share aggregated, anonymised usage analytics. Never includes survey content.')}
            checked={shareAnalytics}
            onChange={setShareAnalytics}
          />
        </div>
      </SectionCard>

      <SectionCard title={t('Response retention')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel>{t('Auto-delete responses after')}</FieldLabel>
            <NativeSelect value={retention} onChange={setRetention}>
              <option value="90">{t('90 days')}</option>
              <option value="180">{t('180 days')}</option>
              <option value="365">{t('1 year')}</option>
              <option value="1095">{t('3 years')}</option>
              <option value="never">{t('Never (keep forever)')}</option>
            </NativeSelect>
            <p className="text-xs text-[#8A8A8A] mt-2">
              {t('Applies to new responses. Existing responses are unaffected unless manually deleted.')}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('Export workspace data')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="block text-sm font-medium text-[#1A1A1A] mb-1">
              {t('Download a copy of everything')}
            </span>
            <p className="text-sm text-[#8A8A8A]">
              {t('Includes surveys, responses, and team activity as a ZIP archive. Ready within 24 hours.')}
            </p>
          </div>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8A8A8A]" />
            {t('Request export')}
          </button>
        </div>
      </SectionCard>

      <RequestExportDrawer open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

function RequestExportDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [format, setFormat] = useState('csv');
  const [includeResponses, setIncludeResponses] = useState(true);
  const [includeSurveys, setIncludeSurveys] = useState(true);
  const [includeActivity, setIncludeActivity] = useState(false);
  const [requested, setRequested] = useState(false);

  const reset = () => {
    setRequested(false);
    setFormat('csv');
    setIncludeResponses(true);
    setIncludeSurveys(true);
    setIncludeActivity(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  return (
    <SettingsDrawer
      open={open}
      onClose={handleClose}
      title={requested ? t('Export requested') : t('Request data export')}
      description={
        requested
          ? t('We will email a download link when the archive is ready.')
          : t('We will package the selected data into a downloadable archive.')
      }
      secondaryAction={requested ? undefined : { label: t('Cancel'), onClick: handleClose }}
      primaryAction={
        requested
          ? { label: t('Done'), onClick: handleClose }
          : { label: t('Request export'), onClick: () => setRequested(true) }
      }
    >
      {requested ? (
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-[#047857]" strokeWidth={2} />
          </div>
          <p className="text-sm text-[#4A4A4A] max-w-xs">
            {t('Most exports finish in under an hour. Larger workspaces can take up to 24 hours.')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <FieldLabel>{t('Format')}</FieldLabel>
            <NativeSelect value={format} onChange={setFormat}>
              <option value="csv">{t('CSV (one file per survey)')}</option>
              <option value="json">{t('JSON (single archive)')}</option>
            </NativeSelect>
          </div>
          <div className="space-y-4">
            <FieldLabel>{t('Include')}</FieldLabel>
            <ToggleRow
              label={t('Surveys and questions')}
              hint={t('All survey definitions, drafts, and templates.')}
              checked={includeSurveys}
              onChange={setIncludeSurveys}
            />
            <div className="h-px w-full bg-[#F3F3F3]" />
            <ToggleRow
              label={t('Responses')}
              hint={t('Every collected response with quality scores.')}
              checked={includeResponses}
              onChange={setIncludeResponses}
            />
            <div className="h-px w-full bg-[#F3F3F3]" />
            <ToggleRow
              label={t('Team activity log')}
              hint={t('Audit log of who did what, when.')}
              checked={includeActivity}
              onChange={setIncludeActivity}
            />
          </div>
        </div>
      )}
    </SettingsDrawer>
  );
}

function SessionsSection() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'MacBook Pro · Chrome', location: 'Ulaanbaatar, MN', lastActive: t('Active now'), current: true },
    { id: 's2', device: 'iPhone 15 · Safari', location: 'Ulaanbaatar, MN', lastActive: t('2 hours ago'), current: false },
    { id: 's3', device: 'Windows · Firefox', location: 'Seoul, KR', lastActive: t('3 days ago'), current: false },
  ]);

  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const signOut = (id: string) => setSessions((ss) => ss.filter((s) => s.id !== id));
  const signOutOthers = () => setSessions((ss) => ss.filter((s) => s.current));
  const hasOthers = sessions.some((s) => !s.current);
  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white border border-[#E3E3E3] rounded-md overflow-hidden">
        <div className="divide-y divide-[#F3F3F3]">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-md border border-[#E3E3E3] bg-white text-[#4A4A4A] flex items-center justify-center shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#1A1A1A]">{s.device}</span>
                    {s.current && (
                      <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857] text-[11px] font-medium">
                        {t('Current')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8A8A8A] mt-0.5">
                    {s.location} · {s.lastActive}
                  </div>
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() => signOut(s.id)}
                  className="px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] bg-white hover:bg-[#F3F3F3] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                >
                  {t('Sign out')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {hasOthers && (
        <button
          onClick={() => setConfirmAllOpen(true)}
          className="px-4 py-2.5 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors cursor-pointer self-start"
        >
          {t('Sign out of all other sessions')}
        </button>
      )}

      <SettingsDrawer
        open={confirmAllOpen}
        onClose={() => setConfirmAllOpen(false)}
        title={t('Sign out of other sessions')}
        description={t('You will stay signed in on this device.')}
        secondaryAction={{ label: t('Cancel'), onClick: () => setConfirmAllOpen(false) }}
        primaryAction={{
          label: t('Sign out'),
          onClick: () => {
            signOutOthers();
            setConfirmAllOpen(false);
          },
          danger: true,
        }}
      >
        <div className="rounded-md border border-[#E3E3E3] bg-[#FAFAFA] p-4 text-sm text-[#4A4A4A]">
          {otherCount === 1
            ? t('1 other session will be signed out.')
            : `${otherCount} ${t('other sessions will be signed out.')}`}
        </div>
        <p className="text-xs text-[#8A8A8A] mt-3">
          {t('Anyone signed in on those devices will need to log in again.')}
        </p>
      </SettingsDrawer>
    </div>
  );
}
