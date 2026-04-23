import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Coins,
  Gift,
  Check,
  ArrowRight,
  Building2,
  Smartphone,
  Landmark,
  ChevronRight,
  Receipt,
  X,
  Download,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';

type PackageId = 'starter' | 'popular' | 'growth' | 'enterprise';
type PaymentId = 'qpay' | 'social' | 'bank';

interface Pkg {
  id: PackageId;
  name: string;
  amount: string;
  bonus?: string;
  badge?: string;
  amountMnt: number;
  bonusMnt: number;
}

const PACKAGES: Pkg[] = [
  { id: 'starter',    name: 'Starter',    amount: '₮100K',   amountMnt: 100_000,   bonusMnt: 0 },
  { id: 'popular',    name: 'Popular',    amount: '₮500K',   amountMnt: 500_000,   bonusMnt: 50_000,    bonus: '+₮50K bonus',    badge: 'Most Popular' },
  { id: 'growth',     name: 'Growth',     amount: '₮1,000K', amountMnt: 1_000_000, bonusMnt: 150_000,   bonus: '+₮150K bonus',   badge: '15% bonus' },
  { id: 'enterprise', name: 'Enterprise', amount: '₮5,000K', amountMnt: 5_000_000, bonusMnt: 1_000_000, bonus: '+₮1,000K bonus', badge: '20% bonus' },
];

type InvoiceStatus = 'Paid' | 'Upcoming' | 'Overdue';
interface Invoice {
  id: string;
  dueDate: string;
  issueDate: string;
  description: string;
  status: InvoiceStatus;
  total: number | null;
  paymentMethod: string;
  periodStart: string;
  periodEnd: string;
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-05', dueDate: 'May 14, 2026', issueDate: 'May 14, 2026', description: 'Monthly invoice', status: 'Upcoming', total: null, paymentMethod: 'QPay', periodStart: 'May 14, 2026', periodEnd: 'Jun 14, 2026' },
  { id: 'INV-2026-04', dueDate: 'Apr 14, 2026', issueDate: 'Apr 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'QPay', periodStart: 'Apr 14, 2026', periodEnd: 'May 14, 2026' },
  { id: 'INV-2026-03', dueDate: 'Mar 14, 2026', issueDate: 'Mar 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'Bank Transfer', periodStart: 'Mar 14, 2026', periodEnd: 'Apr 14, 2026' },
  { id: 'INV-2026-02', dueDate: 'Feb 14, 2026', issueDate: 'Feb 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'QPay', periodStart: 'Feb 14, 2026', periodEnd: 'Mar 14, 2026' },
  { id: 'INV-2026-01', dueDate: 'Jan 14, 2026', issueDate: 'Jan 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'Social Pay', periodStart: 'Jan 14, 2026', periodEnd: 'Feb 14, 2026' },
];

type ActivityKind = 'subscription' | 'topup';

interface Activity {
  id: string;
  kind: ActivityKind;
  date: string;
  label: string;
  status: InvoiceStatus;
  amount: number | null;
  method: string;
  invoice: Invoice;
}

const subscriptionActivities: Activity[] = INVOICES.map((inv) => ({
  id: inv.id,
  kind: 'subscription',
  date: inv.issueDate,
  label: 'Growth plan — monthly subscription',
  status: inv.status,
  amount: inv.total,
  method: inv.paymentMethod,
  invoice: inv,
}));

const topupActivities: Activity[] = [
  { id: 'TOP-2026-04-21', kind: 'topup', date: 'Apr 21, 2026', label: 'Credit top-up — Growth package', status: 'Paid', amount: 1_000_000, method: 'QPay', invoice: { id: 'TOP-2026-04-21', dueDate: 'Apr 21, 2026', issueDate: 'Apr 21, 2026', description: 'Credit top-up — Growth package', status: 'Paid', total: 1_000_000, paymentMethod: 'QPay', periodStart: 'Apr 21, 2026', periodEnd: 'One-time' } },
  { id: 'TOP-2026-04-10', kind: 'topup', date: 'Apr 10, 2026', label: 'Credit top-up — Popular package', status: 'Paid', amount: 500_000, method: 'Bank Transfer', invoice: { id: 'TOP-2026-04-10', dueDate: 'Apr 10, 2026', issueDate: 'Apr 10, 2026', description: 'Credit top-up — Popular package', status: 'Paid', total: 500_000, paymentMethod: 'Bank Transfer', periodStart: 'Apr 10, 2026', periodEnd: 'One-time' } },
];

const ACTIVITY: Activity[] = [...subscriptionActivities, ...topupActivities].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

const PAYMENT_LABEL: Record<PaymentId, string> = {
  qpay: 'QPay',
  social: 'Social Pay',
  bank: 'Bank Transfer',
};

interface PurchaseDialogProps {
  open: boolean;
  step: 'idle' | 'confirm' | 'processing' | 'success';
  pkg: Pkg | undefined;
  paymentMethod: PaymentId;
  onCancel: () => void;
  onConfirm: () => void;
  onDone: () => void;
}

function PurchaseDialog({ open, step, pkg, paymentMethod, onCancel, onConfirm, onDone }: PurchaseDialogProps) {
  const { t } = useTranslation();
  const totalCredits = pkg ? pkg.amountMnt + pkg.bonusMnt : 0;
  const canDismiss = step === 'confirm';

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(o) => {
        if (o) return;
        // Only allow closing when we're in the confirm step; processing/success close via their own actions.
        if (canDismiss) onCancel();
      }}
    >
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[#E3E3E3]">
        {pkg && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E3E3E3] flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <DrawerTitle className="text-base font-semibold text-[#1A1A1A]">
                  {step === 'success' ? t('Payment successful') : t('Confirm purchase')}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-[#8A8A8A] mt-0.5">
                  {step === 'confirm'
                    ? t('Review the details before paying.')
                    : step === 'processing'
                    ? t('Please wait while we process your payment.')
                    : t('Credits have been added to your account.')}
                </DrawerDescription>
              </div>
              {step !== 'processing' && (
                <button
                  onClick={step === 'success' ? onDone : onCancel}
                  className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {step === 'confirm' && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-3 p-4 rounded-md bg-[#FFF1EE]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#FF3C21] shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1A1A1A]">{t(pkg.name)} {t('package')}</div>
                      {pkg.bonus && <div className="text-xs text-[#FF3C21]">{t(pkg.bonus)}</div>}
                    </div>
                    <div className="text-lg font-semibold text-[#1A1A1A] tabular-nums">{pkg.amount}</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label={t('Package')} value={pkg.amount} />
                    {pkg.bonusMnt > 0 && (
                      <Row
                        label={t('Bonus credits')}
                        value={`+ ₮${pkg.bonusMnt.toLocaleString('en-US')}`}
                        valueClass="text-[#047857]"
                      />
                    )}
                    <Row label={t('Payment method')} value={PAYMENT_LABEL[paymentMethod]} />
                    <div className="border-t border-[#F3F3F3] pt-3 mt-3 flex items-baseline justify-between">
                      <span className="text-sm font-medium text-[#1A1A1A]">{t('Total credits')}</span>
                      <span className="text-lg font-semibold text-[#1A1A1A] tabular-nums">
                        ₮{totalCredits.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-[#8A8A8A]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#047857]" />
                    <span>{t('Credits are added to your account instantly after payment confirmation.')}</span>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="px-6 py-16 flex flex-col items-center text-center">
                  <Loader2 className="w-10 h-10 text-[#FF3C21] animate-spin mb-4" strokeWidth={1.75} />
                  <h3 className="text-base font-semibold text-[#1A1A1A]">{t('Processing payment')}</h3>
                  <p className="text-sm text-[#8A8A8A] mt-1">
                    {t('Contacting')} {PAYMENT_LABEL[paymentMethod]}…
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="px-6 py-12 flex flex-col items-center text-center">
                  <div className="relative w-14 h-14 mb-4">
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0.6 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full bg-[#ECFDF5]"
                    />
                    {[
                      { x: -38, y: -10, c: '#FF3C21', d: 0.15 },
                      { x: 36, y: -18, c: '#047857', d: 0.2 },
                      { x: -28, y: 32, c: '#F59E0B', d: 0.22 },
                      { x: 30, y: 28, c: '#1D4ED8', d: 0.18 },
                      { x: 0, y: -40, c: '#FF3C21', d: 0.28 },
                      { x: 0, y: 42, c: '#047857', d: 0.3 },
                    ].map((p, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.8] }}
                        transition={{ duration: 0.9, delay: p.d, ease: 'easeOut' }}
                        style={{ backgroundColor: p.c }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.05 }}
                      className="relative w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.25 }}
                      >
                        <CheckCircle2 className="w-7 h-7 text-[#047857]" strokeWidth={1.75} />
                      </motion.div>
                    </motion.div>
                  </div>
                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.35, ease: 'easeOut' }}
                    className="text-base font-semibold text-[#1A1A1A]"
                  >
                    {t('Payment successful')}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.45, ease: 'easeOut' }}
                    className="text-sm text-[#8A8A8A] mt-1"
                  >
                    {t('Added')} ₮{totalCredits.toLocaleString('en-US')} {t('to your balance.')}
                  </motion.p>
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'confirm' && (
              <div className="px-6 py-3 border-t border-[#E3E3E3] bg-[#FAFAFA] flex items-center gap-2 shrink-0">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-[#FF3C21] text-white rounded-md hover:bg-[#E63419] transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('Pay')} {pkg.amount}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="px-6 py-3 border-t border-[#E3E3E3] bg-[#FAFAFA] flex items-center gap-2 shrink-0">
                <button
                  onClick={onDone}
                  className="flex-1 px-5 py-2 bg-[#1A1A1A] text-white rounded-md text-sm font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  {t('Done')}
                </button>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[#8A8A8A]">{label}</span>
      <span className={`tabular-nums ${valueClass ?? 'text-[#1A1A1A]'}`}>{value}</span>
    </div>
  );
}

function formatMnt(value: number): string {
  return `₮${value.toLocaleString('en-US')}`;
}

export default function Billing() {
  const { t } = useTranslation();
  const [selectedPkg, setSelectedPkg] = useState<PackageId | null>('popular');
  const [selectedPayment, setSelectedPayment] = useState<PaymentId>('qpay');
  const [openInvoice, setOpenInvoice] = useState<Invoice | null>(null);
  const [availableCredits, setAvailableCredits] = useState(450_000);
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'confirm' | 'processing' | 'success'>('idle');

  const renewsOn = new Date();
  renewsOn.setDate(renewsOn.getDate() + 23);
  const renewsLabel = renewsOn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const paymentMethods: { id: PaymentId; label: string; Icon: React.ElementType }[] = [
    { id: 'qpay', label: 'QPay', Icon: Smartphone },
    { id: 'social', label: 'Social Pay', Icon: CreditCard },
    { id: 'bank', label: 'Bank Transfer', Icon: Landmark },
  ];

  const selectedPackageObj = PACKAGES.find((p) => p.id === selectedPkg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#1A1A1A]">{t('Billing & Credits')}</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">
          {t('Manage your credits and view transaction history.')}
        </p>
      </div>

      {/* Hero — Available Credits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative overflow-hidden bg-[#1A1A1A] rounded-md p-8 mb-8"
      >
        {/* Soft brand glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full bg-[#FF3C21]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 w-[320px] h-[320px] rounded-full bg-[#FF3C21]/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2">{t('Available Credits')}</p>
            <h2 className="text-5xl font-semibold text-white mb-4 tabular-nums tracking-tight">
              ₮{availableCredits.toLocaleString('en-US')}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] font-medium text-white tracking-wide backdrop-blur-sm">
              <Building2 className="w-3 h-3" />
              {t('Growth plan')}
            </span>
          </div>

          <div className="shrink-0 p-2.5 bg-white/10 border border-white/15 rounded-md text-white/80 backdrop-blur-sm">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Top Up Credits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-[#E3E3E3] rounded-md p-6 mb-6 shadow-none"
      >
        <div className="flex items-center gap-2 mb-5">
          <Coins className="w-4 h-4 text-[#FF3C21]" />
          <h3 className="text-base font-semibold text-[#1A1A1A]">{t('Top Up Credits')}</h3>
        </div>

        {/* Package grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {PACKAGES.map((pkg) => {
            const isActive = selectedPkg === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg.id)}
                className={`relative text-left p-4 rounded-md border transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#FF3C21] bg-[#FFF1EE]'
                    : 'border-[#E3E3E3] bg-white hover:border-[#D4D4D4]'
                }`}
              >
                {pkg.badge && (
                  <span
                    className={`absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-full ${
                      isActive
                        ? 'bg-[#FF3C21] text-white'
                        : 'bg-[#FFF1EE] text-[#FF3C21]'
                    }`}
                  >
                    {t(pkg.badge)}
                  </span>
                )}
                <div className="text-sm font-medium text-[#4A4A4A] mb-1">{t(pkg.name)}</div>
                <div className={`text-2xl font-semibold tabular-nums ${isActive ? 'text-[#FF3C21]' : 'text-[#1A1A1A]'}`}>
                  {pkg.amount}
                </div>
                {pkg.bonus && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#047857]">
                    <Gift className="w-3 h-3" />
                    {pkg.bonus}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment methods */}
        <div className="mb-5">
          <p className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">
            {t('Payment method')}
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map(({ id, label, Icon }) => {
              const isActive = selectedPayment === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPayment(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[#FF3C21] bg-[#FFF1EE] text-[#FF3C21]'
                      : 'border-[#E3E3E3] bg-white text-[#4A4A4A] hover:border-[#D4D4D4] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={!selectedPkg}
          onClick={() => selectedPkg && setPurchaseStep('confirm')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
            selectedPkg
              ? 'bg-[#FF3C21] text-white hover:bg-[#E63419] cursor-pointer'
              : 'bg-[#F3F3F3] text-[#B5B5B5] cursor-not-allowed'
          }`}
        >
          {selectedPackageObj
            ? `${t('Purchase')} ${selectedPackageObj.amount}`
            : t('Select a package')}
          {selectedPkg && <ArrowRight className="w-4 h-4" />}
        </button>
      </motion.div>

      <PurchaseDialog
        open={purchaseStep !== 'idle'}
        step={purchaseStep}
        pkg={selectedPackageObj}
        paymentMethod={selectedPayment}
        onCancel={() => setPurchaseStep('idle')}
        onConfirm={() => {
          setPurchaseStep('processing');
          setTimeout(() => {
            if (selectedPackageObj) {
              setAvailableCredits((c) => c + selectedPackageObj.amountMnt + selectedPackageObj.bonusMnt);
            }
            setPurchaseStep('success');
          }, 1400);
        }}
        onDone={() => setPurchaseStep('idle')}
      />

      {/* Your Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white border border-[#E3E3E3] rounded-md p-6 mb-6 shadow-none"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">
                {t('Your Plan')} <span className="text-[#8A8A8A] font-normal">— {t('Growth')}</span>
              </h3>
              <p className="text-xs text-[#8A8A8A] mt-0.5">
                {t('Next monthly invoice due')} <span className="tabular-nums">{renewsLabel}</span>
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors cursor-pointer">
            {t('Upgrade plan')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[
            'Up to 20 active surveys',
            '5,000 responses/month',
            'Advanced analytics',
            'Priority support',
            'Demographic targeting',
            'Custom branding',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5 text-sm text-[#4A4A4A]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857] shrink-0">
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
              {t(feature)}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Billing Activity — subscription invoices + credit top-ups */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="bg-white border border-[#E3E3E3] rounded-md overflow-hidden shadow-none"
      >
        <div className="px-6 pt-5 pb-4">
          <h3 className="text-base font-semibold text-[#1A1A1A]">{t('Billing Activity')}</h3>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            {t('Your subscription invoices and credit top-ups')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#E3E3E3] text-[#8A8A8A] font-medium bg-[#FAFAFA]">
                <th className="px-6 py-3 font-medium">{t('Date')}</th>
                <th className="px-6 py-3 font-medium">{t('Description')}</th>
                <th className="px-6 py-3 font-medium">{t('Status')}</th>
                <th className="px-6 py-3 font-medium text-right">{t('Amount')}</th>
                <th className="px-6 py-3 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F3]">
              {ACTIVITY.map((item, index) => {
                const statusBadge =
                  item.status === 'Paid'
                    ? 'bg-[#ECFDF5] text-[#047857]'
                    : item.status === 'Overdue'
                    ? 'bg-[#FEF2F2] text-[#DC2626]'
                    : 'bg-[#F3F3F3] text-[#4A4A4A]';

                const Icon = item.kind === 'subscription' ? Receipt : Coins;

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => setOpenInvoice(item.invoice)}
                    className="hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#F3F3F3] text-[#4A4A4A] shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="font-medium text-[#1A1A1A]">{t(item.label)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusBadge}`}>
                        {t(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-[#1A1A1A]">
                      {item.amount === null ? <span className="text-[#B5B5B5]">—</span> : formatMnt(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[#B5B5B5] group-hover:text-[#4A4A4A] transition-colors" />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invoice Detail Drawer */}
      <AnimatePresence>
        {openInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenInvoice(null)}
            className="fixed inset-0 bg-[#1A1A1A]/30 z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white h-full overflow-y-auto border-l border-[#E3E3E3] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#F3F3F3] flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                      openInvoice.status === 'Paid'
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : openInvoice.status === 'Overdue'
                        ? 'bg-[#FEF2F2] text-[#DC2626]'
                        : 'bg-[#F3F3F3] text-[#4A4A4A]'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-[#1A1A1A]">{t(openInvoice.description)}</h2>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${
                          openInvoice.status === 'Paid'
                            ? 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]'
                            : openInvoice.status === 'Overdue'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                            : 'bg-[#F3F3F3] text-[#4A4A4A] border border-[#E3E3E3]'
                        }`}
                      >
                        {t(openInvoice.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[#8A8A8A] mt-1">
                      {t('Invoice issue date')} <span className="tabular-nums">{openInvoice.issueDate}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenInvoice(null)}
                  className="p-1 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors cursor-pointer shrink-0"
                  aria-label={t('Close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Meta grid */}
              <div className="px-6 py-5 border-b border-[#F3F3F3] grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">{t('Due date')}</p>
                  <p className="text-sm font-medium text-[#1A1A1A] tabular-nums">{openInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">{t('Status')}</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{t(openInvoice.status)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">{t('Invoice number')}</p>
                  <button className="text-sm font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors tabular-nums cursor-pointer">
                    {openInvoice.id}
                  </button>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">{t('Payment method')}</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{t(openInvoice.paymentMethod)}</p>
                </div>
              </div>

              {/* Monthly costs */}
              <div className="px-6 py-5 border-b border-[#F3F3F3]">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">{t('Monthly costs')}</h3>
                <p className="text-sm text-[#8A8A8A] mb-4">
                  {t('This covers your workspace from')}{' '}
                  <span className="tabular-nums">{openInvoice.periodStart}</span> {t('to')}{' '}
                  <span className="tabular-nums">{openInvoice.periodEnd}</span>.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4A4A4A]">{t('Growth plan — monthly subscription')}</span>
                    <span className="text-[#1A1A1A] font-medium tabular-nums">
                      {openInvoice.total !== null ? formatMnt(500_000) : formatMnt(500_000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4A4A4A]">{t('5,000 response credits included')}</span>
                    <span className="text-[#1A1A1A] font-medium tabular-nums">₮0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4A4A4A]">{t('Additional top-up credits')}</span>
                    <span className="text-[#1A1A1A] font-medium tabular-nums">₮0</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="px-6 py-5 border-b border-[#F3F3F3] space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4A4A4A]">{t('Subtotal')}</span>
                  <span className="text-[#1A1A1A] font-medium tabular-nums">{formatMnt(500_000)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4A4A4A]">{t('VAT (0%)')}</span>
                  <span className="text-[#1A1A1A] font-medium tabular-nums">₮0</span>
                </div>
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#F3F3F3]">
                  <span className="text-base font-semibold text-[#1A1A1A]">{t('Total')}</span>
                  <span className="text-base font-semibold text-[#1A1A1A] tabular-nums">
                    {openInvoice.total === null ? formatMnt(500_000) : formatMnt(openInvoice.total)}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="px-6 py-5 mt-auto">
                <button
                  disabled={openInvoice.status === 'Upcoming'}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    openInvoice.status === 'Upcoming'
                      ? 'bg-[#F3F3F3] text-[#B5B5B5] border border-[#E3E3E3] cursor-not-allowed'
                      : 'bg-white text-[#1A1A1A] border border-[#E3E3E3] hover:bg-[#FAFAFA] cursor-pointer'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('Download invoice')}
                </button>
                {openInvoice.status === 'Upcoming' && (
                  <p className="text-xs text-[#8A8A8A] mt-2 text-center">
                    {t('Available after this invoice is paid.')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
