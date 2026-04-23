import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Save,
  Rocket,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  GripVertical,
  Zap,
  CheckCircle2,
  Calendar,
  PlayCircle,
  Eye,
  Star,
  X,
  Lock,
  Copy,
  Info,
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PLATFORM_FEE, TRUST_LEVELS } from '@/shared/config/business';
import { BrandSelect } from '@/shared/ui/brand-select';
import type { BuilderQuestion } from '@/shared/lib/mock-questions';

type QuestionType =
  | 'scale'
  | 'rating'
  | 'single_choice'
  | 'ranking'
  | 'multiple_choice'
  | 'date'
  | 'matrix'
  | 'short_text'
  | 'long_text';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  /** Matrix rows (columns use `options`). Ignored for non-matrix types. */
  rows?: string[];
}

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  scale: 'Scale',
  rating: 'Rating',
  single_choice: 'Single Choice',
  ranking: 'Ranking',
  multiple_choice: 'Multi Choice',
  date: 'Date',
  matrix: 'Matrix',
  short_text: 'Short Text',
  long_text: 'Long Text',
};

const SURVEY_CATEGORIES = ['Social', 'Product', 'Brand', 'Market Research', 'Other'] as const;

function needsOptions(type: QuestionType) {
  return (
    type === 'single_choice' ||
    type === 'multiple_choice' ||
    type === 'ranking' ||
    type === 'matrix'
  );
}

function needsRows(type: QuestionType) {
  return type === 'matrix';
}

function makeId() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

function formatMnt(n: number) {
  return `₮${n.toLocaleString('en-US')}`;
}

interface SurveyPrefill {
  title?: string;
  description?: string;
  category?: string;
  reward?: number;
  maxResponses?: number;
  estMinutes?: number;
  trustLevel?: 1 | 2 | 3 | 4 | 5;
  endDate?: string;
  anonymous?: boolean;
  questions?: BuilderQuestion[];
  status?: 'Active' | 'Paused' | 'Draft' | 'Completed';
  responsesCurrent?: number;
}

function LockPill() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F3F3F3] text-[#8A8A8A] text-[10px] font-medium ml-2"
      title="Locked while live — end the survey or clone as a new draft to change this"
    >
      <Lock className="w-2.5 h-2.5" /> Locked
    </span>
  );
}

export default function SurveyBuilder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: SurveyPrefill } | null)?.prefill;
  const isEditing = Boolean(prefill);
  const surveyStatus = prefill?.status;
  const isLive = surveyStatus === 'Active' || surveyStatus === 'Paused';
  const isCompleted = surveyStatus === 'Completed';
  const structuralLock = isLive || isCompleted; // questions, reward, length, category, trust, anonymity
  const responsesCurrent = prefill?.responsesCurrent ?? 0;
  const minResponsesAllowed = isLive ? Math.max(10, responsesCurrent) : 10;
  const cloneAsDraft = () => {
    if (!prefill) return;
    navigate('/surveys/new', {
      state: {
        prefill: {
          ...prefill,
          title: `${prefill.title ?? ''} (copy)`,
          status: undefined,
          responsesCurrent: undefined,
        },
      },
    });
  };

  // Survey meta
  const [title, setTitle] = useState(prefill?.title ?? '');
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [category, setCategory] = useState<string>(prefill?.category ?? 'Market Research');

  // Reward & limits
  const [reward, setReward] = useState(prefill?.reward ?? 500);
  const [maxResponses, setMaxResponses] = useState(prefill?.maxResponses ?? 100);
  const [estMinutes, setEstMinutes] = useState(prefill?.estMinutes ?? 5);
  const [trustLevel, setTrustLevel] = useState<1 | 2 | 3 | 4 | 5>(prefill?.trustLevel ?? 1);
  const [endDate, setEndDate] = useState(() => {
    if (prefill?.endDate) return prefill.endDate;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [anonymous, setAnonymous] = useState(prefill?.anonymous ?? false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const endDateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEndDateOpen) return;
    const handler = (e: MouseEvent) => {
      if (endDateRef.current && !endDateRef.current.contains(e.target as Node)) {
        setIsEndDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEndDateOpen]);

  // Questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (prefill?.questions && prefill.questions.length > 0) {
      return prefill.questions.map((q) => {
        const type = q.type as QuestionType;
        return {
          id: q.id || makeId(),
          text: q.text,
          type,
          options: q.options.length > 0
            ? q.options
            : needsOptions(type) ? ['', ''] : [],
          rows: needsRows(type) ? (q.rows && q.rows.length > 0 ? q.rows : ['', '']) : undefined,
          required: q.required,
        };
      });
    }
    return [
      { id: makeId(), text: '', type: 'single_choice', options: ['', ''], required: true },
    ];
  });

  const addQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      { id: makeId(), text: '', type: 'single_choice', options: ['', ''], required: true },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.id !== id) : qs));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setQuestions((qs) => {
      const oldIndex = qs.findIndex((q) => q.id === active.id);
      const newIndex = qs.findIndex((q) => q.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return qs;
      return arrayMove(qs, oldIndex, newIndex);
    });
  };

  const moveQuestion = (id: string, dir: 'up' | 'down') => {
    setQuestions((qs) => {
      const i = qs.findIndex((q) => q.id === id);
      if (i < 0) return qs;
      const target = dir === 'up' ? i - 1 : i + 1;
      if (target < 0 || target >= qs.length) return qs;
      const next = qs.slice();
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  };

  const addOption = (qid: string) => {
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, options: [...q.options, ''] } : q)));
  };

  const updateOption = (qid: string, idx: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) }
          : q,
      ),
    );
  };

  const removeOption = (qid: string, idx: number) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== idx) }
          : q,
      ),
    );
  };

  // Derived
  const payout = reward * maxResponses;
  const platformFee = Math.round((payout * PLATFORM_FEE.defaultPct) / 100);
  const totalCost = payout + platformFee;

  const rewardFairness: { label: string; tone: 'good' | 'fair' | 'low' } = useMemo(() => {
    const perMinute = estMinutes > 0 ? reward / estMinutes : 0;
    if (perMinute >= 150) return { label: 'Generous', tone: 'good' };
    if (perMinute >= 100) return { label: '~ Fair', tone: 'fair' };
    return { label: 'Low', tone: 'low' };
  }, [reward, estMinutes]);

  const eligiblePool: Record<number, number> = { 1: 8500, 2: 5200, 3: 3100, 4: 1400, 5: 420 };
  const pool = eligiblePool[trustLevel];

  const estVelocity = Math.max(1, Math.round(pool * 0.012));
  const estDays = Math.max(1, Math.ceil(maxResponses / estVelocity));
  const bufferDays = Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 86400000) - estDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-[#8A8A8A] mb-2">
            <button
              onClick={() => navigate('/surveys')}
              className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {t('Surveys')}
            </button>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[#1A1A1A] font-medium">{isEditing ? t('Edit Survey') : t('New Survey')}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-[#1A1A1A]">{isEditing ? t('Edit Survey') : t('Survey Builder')}</h1>
            {surveyStatus && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                  surveyStatus === 'Active'
                    ? 'bg-[#ECFDF5] text-[#047857]'
                    : surveyStatus === 'Paused'
                    ? 'bg-[#FFFBEB] text-[#B45309]'
                    : surveyStatus === 'Completed'
                    ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'bg-[#F3F3F3] text-[#8A8A8A]'
                }`}
              >
                {t(surveyStatus)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer"
            onClick={() => setIsPreviewOpen(true)}
          >
            <PlayCircle className="w-4 h-4" />
            {t('Preview')}
          </button>
          {structuralLock && (
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white cursor-pointer"
              onClick={cloneAsDraft}
            >
              <Copy className="w-4 h-4" />
              {t('Clone as new draft')}
            </button>
          )}
          {!isLive && !isCompleted && (
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer"
              onClick={() => navigate('/surveys')}
            >
              <Save className="w-4 h-4" />
              {t('Save Draft')}
            </button>
          )}
          <button
            disabled={isCompleted}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors shadow-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => navigate('/surveys')}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            {isCompleted
              ? t('Read only')
              : isLive
              ? t('Save changes')
              : isEditing
              ? t('Save Survey')
              : t('Publish Survey')}
          </button>
        </div>
      </div>

      {/* Live / Completed banner */}
      {(isLive || isCompleted) && (
        <div
          className={`mb-6 rounded-md border px-4 py-3 flex items-start gap-3 ${
            isLive
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
          }`}
        >
          {isLive ? (
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            {isLive ? (
              <>
                <span className="font-semibold">{t('This survey is live.')}</span>{' '}
                {t(
                  'Title, description, end date, and increasing the response target are safe to change. Questions, reward, length, category, trust level, and anonymity are locked to keep your collected data consistent. End the survey or clone it as a new draft to change those.'
                )}
              </>
            ) : (
              <>
                <span className="font-semibold">{t('This survey is closed.')}</span>{' '}
                {t('All fields are read-only. Clone it as a new draft to launch a follow-up.')}
              </>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Survey Settings */}
          <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">{t('Survey Settings')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('Title')} <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isCompleted}
                  placeholder={t('e.g. Customer Satisfaction 2025')}
                  className="w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A] disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A] disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('Description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isCompleted}
                  placeholder={t('Tell respondents what this survey is about...')}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A] resize-none disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A] disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="flex items-center text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('Category')}
                  {structuralLock && <LockPill />}
                </label>
                <BrandSelect
                  value={category}
                  onValueChange={setCategory}
                  disabled={structuralLock}
                  options={SURVEY_CATEGORIES.map((c) => ({ value: c, label: t(c) }))}
                />
              </div>
            </div>
          </div>

          {/* Reward & Limits */}
          <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">{t('Reward & Limits')}</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center text-xs font-medium text-[#4A4A4A]">
                      {t('Reward (₮)')}
                      {structuralLock && <LockPill />}
                    </label>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rewardFairness.tone === 'good'
                          ? 'bg-[#ECFDF5] text-[#047857]'
                          : rewardFairness.tone === 'fair'
                          ? 'bg-[#FFFBEB] text-[#B45309]'
                          : 'bg-[#FEF2F2] text-[#991B1B]'
                      }`}
                    >
                      {t(rewardFairness.label)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={reward}
                    disabled={structuralLock}
                    onChange={(e) => setReward(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A] disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#8A8A8A] mt-1">₮100/min · min ₮100</p>
                </div>

                <div>
                  <label className="flex items-center text-xs font-medium text-[#4A4A4A] mb-1.5">
                    {t('Max Responses')}
                    {isCompleted && <LockPill />}
                  </label>
                  <input
                    type="number"
                    min={minResponsesAllowed}
                    value={maxResponses}
                    disabled={isCompleted}
                    onChange={(e) =>
                      setMaxResponses(Math.max(minResponsesAllowed, Number(e.target.value) || minResponsesAllowed))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A] disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#8A8A8A] mt-1">
                    {isLive
                      ? `${t('Can only increase')} · ${t('current')}: ${responsesCurrent}`
                      : t('min 10 responses')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center text-xs font-medium text-[#4A4A4A]">
                      {t('Est. Minutes')}
                      {structuralLock && <LockPill />}
                    </label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F3F3] text-[#1A1A1A]">
                      <Zap className="w-3 h-3" />
                      {t('Auto')} ({estMinutes}m)
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={estMinutes}
                    disabled={structuralLock}
                    onChange={(e) => setEstMinutes(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A] disabled:cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#8A8A8A] mt-1">{t('shown to respondents')}</p>
                </div>

                <div>
                  <label className="flex items-center text-xs font-medium text-[#4A4A4A] mb-1.5">
                    {t('Min Trust Level')}
                    {structuralLock && <LockPill />}
                  </label>
                  <BrandSelect
                    value={String(trustLevel)}
                    onValueChange={(v) => setTrustLevel(Number(v) as 1 | 2 | 3 | 4 | 5)}
                    disabled={structuralLock}
                    options={TRUST_LEVELS.map((lvl) => ({
                      value: String(lvl.level),
                      label: `${t('Level')} ${lvl.level} — ${t(lvl.label)}`,
                    }))}
                  />
                  <p className="text-[11px] text-[#8A8A8A] mt-1">~{pool.toLocaleString()} {t('eligible respondents')}</p>
                </div>
              </div>

              <div>
                <label className="flex items-center text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('End Date')}
                  {isCompleted && <LockPill />}
                </label>
                <div className="relative" ref={endDateRef}>
                  <button
                    type="button"
                    onClick={() => !isCompleted && setIsEndDateOpen((o) => !o)}
                    disabled={isCompleted}
                    className="w-full flex items-center gap-2 pl-9 pr-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm text-[#1A1A1A] font-normal hover:bg-white focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] transition-colors cursor-pointer text-left relative disabled:bg-[#F3F3F3] disabled:text-[#8A8A8A] disabled:cursor-not-allowed"
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
                    {format(new Date(endDate), 'MMM d, yyyy')}
                  </button>

                  {isEndDateOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-white border border-[#E3E3E3] rounded-md z-20 p-3"
                      style={{ '--primary': '#FF3C21', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}
                    >
                      <CalendarUI
                        mode="single"
                        selected={new Date(endDate)}
                        onSelect={(date) => {
                          if (date) {
                            setEndDate(date.toISOString().slice(0, 10));
                            setIsEndDateOpen(false);
                          }
                        }}
                        disabled={{ before: new Date() }}
                        className="border-0 shadow-none p-0"
                      />
                    </div>
                  )}
                </div>
                <p className={`text-[11px] mt-1 flex items-center gap-1 ${bufferDays >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {t('Fills in')} ~{estDays}d · {bufferDays >= 0 ? `${bufferDays}d ${t('buffer')}` : t('not enough time')}
                </p>
              </div>

              <label className={`flex items-start gap-3 pt-2 ${structuralLock ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={anonymous}
                  disabled={structuralLock}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D4D4D4] text-[#1A1A1A] focus:ring-[#FF3C21] accent-[#1A1A1A] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div>
                  <div className="flex items-center text-sm font-medium text-[#1A1A1A]">
                    {t('Anonymous responses')}
                    {structuralLock && <LockPill />}
                  </div>
                  <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                    {t('Respondent names are hidden. Age, gender & region are still included in your reports.')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">{t('Estimated Cost')}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#4A4A4A]">
                <span>{t('Respondent payouts')}</span>
                <span className="tabular-nums">{formatMnt(payout)}</span>
              </div>
              <div className="flex justify-between text-[#4A4A4A]">
                <span>{t('Platform fee')} ({PLATFORM_FEE.defaultPct}%)</span>
                <span className="tabular-nums">{formatMnt(platformFee)}</span>
              </div>
              <div className="border-t border-[#F3F3F3] pt-3 mt-1 flex justify-between items-baseline">
                <span className="font-semibold text-[#1A1A1A]">{t('Total')}</span>
                <span className="font-bold text-xl text-[#1A1A1A] tabular-nums">{formatMnt(totalCost)}</span>
              </div>
              <p className="text-[11px] text-[#8A8A8A] pt-0.5">
                {maxResponses} {t('responses')} × {formatMnt(reward)} + {t('fees')}
              </p>
            </div>

            <div className="mt-4 bg-white border border-[#F3F3F3] rounded-md p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-[#1A1A1A] mb-1">{t('Campaign looks healthy')}</div>
                  <div className="text-[#4A4A4A] leading-relaxed">
                    {t('Pool')}: ~{pool.toLocaleString()} {t('respondents at Level')} {trustLevel}+<br />
                    {t('Velocity')}: ~{estVelocity} {t('responses / day')}<br />
                    {t('Fill time')}: ~{estDays} {t('days to collect')} {maxResponses} {t('responses')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Questions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center text-lg font-semibold text-[#1A1A1A]">
              {t('Questions')} ({questions.length})
              {structuralLock && <LockPill />}
            </h2>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === questions.length - 1}
                    onChange={(patch) => updateQuestion(q.id, patch)}
                    onMove={(dir) => moveQuestion(q.id, dir)}
                    onRemove={() => removeQuestion(q.id)}
                    onAddOption={() => addOption(q.id)}
                    onUpdateOption={(i, v) => updateOption(q.id, i, v)}
                    onRemoveOption={(i) => removeOption(q.id, i)}
                    canRemove={questions.length > 1}
                    locked={structuralLock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {!structuralLock && (
            <button
              onClick={addQuestion}
              className="mt-4 w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-[#D4D4D4] bg-white hover:bg-white hover:border-[#FF3C21] transition-colors rounded-md text-[#1A1A1A] font-medium text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('Add Question')}
            </button>
          )}
        </div>
      </div>

      <SurveyPreviewDrawer
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        description={description}
        category={category}
        estMinutes={estMinutes}
        reward={reward}
        questions={questions}
      />
    </motion.div>
  );
}

interface SurveyPreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  category: string;
  estMinutes: number;
  reward: number;
  questions: Question[];
}

type AnswerValue =
  | number
  | string
  | number[]
  | Record<number, number>
  | undefined;

function SurveyPreviewDrawer({
  open,
  onClose,
  title,
  description,
  category,
  estMinutes,
  reward,
  questions,
}: SurveyPreviewDrawerProps) {
  const { t } = useTranslation();
  const validQuestions = useMemo(
    () => questions.filter((q) => q.text.trim().length > 0),
    [questions],
  );
  const hasContent = title.trim().length > 0 || validQuestions.length > 0;
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setAnswers({});
      setSubmitted(false);
    }
  }, [open]);

  const setAnswer = (id: string, value: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  return (
    <Drawer direction="right" open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[#E3E3E3]">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E3E3E3] flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-semibold text-[#1A1A1A]">{t('Survey Preview')}</DrawerTitle>
              <DrawerDescription className="text-sm text-[#8A8A8A] mt-0.5">
                {t('Try it out — your answers won’t be saved.')}
              </DrawerDescription>
            </div>
            <button
              onClick={onClose}
              className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#FAFAFA]">
            {!hasContent ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-sm text-[#8A8A8A] py-20">
                <Eye className="w-8 h-8 mb-3 text-[#D4D4D4]" strokeWidth={1.5} />
                <p>{t('Add a title and at least one question to see the preview.')}</p>
              </div>
            ) : submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 max-w-sm mx-auto">
                {/* Icon with pulsing ring + confetti burst */}
                <div className="relative w-14 h-14 mb-4">
                  {/* Expanding ring */}
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-[#ECFDF5]"
                  />
                  {/* Confetti dots */}
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
                  {/* Check circle */}
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
                  className="text-lg font-semibold text-[#1A1A1A] mb-1"
                >
                  {t('Thanks for completing the preview!')}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.45, ease: 'easeOut' }}
                  className="text-sm text-[#8A8A8A] mb-6"
                >
                  {t('In production, respondents would now see the reward confirmation.')}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.55, ease: 'easeOut' }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => { setAnswers({}); setSubmitted(false); }}
                    className="px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white cursor-pointer"
                  >
                    {t('Try again')}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#1A1A1A] rounded-md text-sm font-medium text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    {t('Close preview')}
                  </button>
                </motion.div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-5">
                {/* Survey intro card */}
                <div className="bg-white border border-[#E3E3E3] rounded-md p-6">
                  <div className="flex items-center gap-2 mb-3 text-[11px] text-[#8A8A8A]">
                    <span className="px-2 py-0.5 rounded-full bg-[#F3F3F3] text-[#4A4A4A] font-medium">
                      {t(category)}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">{estMinutes} {t('min')}</span>
                    <span>·</span>
                    <span className="tabular-nums">{formatMnt(reward)}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                    {title.trim() || t('Untitled survey')}
                  </h2>
                  {description.trim() && (
                    <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  )}
                </div>

                {/* Questions */}
                {validQuestions.map((q, i) => (
                  <div key={q.id} className="bg-white border border-[#E3E3E3] rounded-md p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1A1A1A] leading-relaxed">
                          {q.text}
                          {q.required && <span className="text-[#FF3C21] ml-1">*</span>}
                        </div>
                      </div>
                    </div>
                    <div className="pl-9">
                      <PreviewAnswer
                        question={q}
                        value={answers[q.id]}
                        onChange={(v) => setAnswer(q.id, v)}
                      />
                    </div>
                  </div>
                ))}

                {validQuestions.length > 0 && (
                  <button
                    onClick={() => setSubmitted(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors cursor-pointer"
                  >
                    {t('Submit')}
                  </button>
                )}
                <p className="text-[11px] text-center text-[#8A8A8A] pb-4">
                  {t('Preview mode — answers will not be saved.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PreviewAnswer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const { t } = useTranslation();
  const options = question.options.filter((o) => o.trim().length > 0);

  if (question.type === 'single_choice') {
    if (options.length === 0) {
      return <p className="text-xs text-[#8A8A8A] italic">{t('No options yet.')}</p>;
    }
    const selected = typeof value === 'number' ? value : -1;
    return (
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          return (
            <label
              key={idx}
              className={`flex items-center gap-3 px-3 py-2.5 border rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? 'border-[#FF3C21] bg-[#FFF1EE]'
                  : 'border-[#E3E3E3] bg-white hover:border-[#D4D4D4]'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                checked={isSelected}
                onChange={() => onChange(idx)}
                className="w-4 h-4 accent-[#FF3C21]"
              />
              <span className="text-sm text-[#1A1A1A]">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'multiple_choice') {
    if (options.length === 0) {
      return <p className="text-xs text-[#8A8A8A] italic">{t('No options yet.')}</p>;
    }
    const selected = Array.isArray(value) ? (value as number[]) : [];
    const toggle = (idx: number) => {
      if (selected.includes(idx)) {
        onChange(selected.filter((i) => i !== idx));
      } else {
        onChange([...selected, idx]);
      }
    };
    return (
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <label
              key={idx}
              className={`flex items-center gap-3 px-3 py-2.5 border rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? 'border-[#FF3C21] bg-[#FFF1EE]'
                  : 'border-[#E3E3E3] bg-white hover:border-[#D4D4D4]'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(idx)}
                className="w-4 h-4 accent-[#FF3C21]"
              />
              <span className="text-sm text-[#1A1A1A]">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'short_text') {
    return (
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('Your answer…')}
        className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-md text-sm bg-white focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#B5B5B5]"
      />
    );
  }

  if (question.type === 'long_text') {
    return (
      <textarea
        rows={4}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('Your answer…')}
        className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-md text-sm bg-white focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#B5B5B5] resize-none"
      />
    );
  }

  if (question.type === 'scale') {
    const selected = typeof value === 'number' ? value : 0;
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = selected === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-10 h-10 flex items-center justify-center border rounded-md text-sm font-medium cursor-pointer tabular-nums transition-colors ${
                isSelected
                  ? 'border-[#FF3C21] bg-[#FFF1EE] text-[#FF3C21]'
                  : 'border-[#E3E3E3] bg-white text-[#4A4A4A] hover:border-[#D4D4D4]'
              }`}
              aria-label={`${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'rating') {
    const selected = typeof value === 'number' ? value : 0;
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isFilled = n <= selected;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-10 h-10 flex items-center justify-center border rounded-md cursor-pointer transition-colors ${
                isFilled
                  ? 'border-[#FF3C21] bg-[#FFF1EE] text-[#FF3C21]'
                  : 'border-[#E3E3E3] bg-white text-[#8A8A8A] hover:border-[#D4D4D4]'
              }`}
              aria-label={`${n}`}
            >
              <Star className="w-4 h-4" fill={isFilled ? 'currentColor' : 'none'} />
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'ranking') {
    if (options.length === 0) {
      return <p className="text-xs text-[#8A8A8A] italic">{t('No options yet.')}</p>;
    }
    return (
      <RankingPreview
        options={options}
        value={Array.isArray(value) ? (value as number[]) : undefined}
        onChange={onChange}
      />
    );
  }

  if (question.type === 'date') {
    return (
      <input
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-[#E3E3E3] rounded-md text-sm bg-white focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] text-[#1A1A1A]"
      />
    );
  }

  if (question.type === 'matrix') {
    const rows = (question.rows ?? []).filter((r) => r.trim().length > 0);
    const cols = options;
    if (rows.length === 0 || cols.length === 0) {
      return <p className="text-xs text-[#8A8A8A] italic">{t('Add rows and columns to preview.')}</p>;
    }
    const picks = (value && typeof value === 'object' && !Array.isArray(value))
      ? (value as Record<number, number>)
      : {};
    return (
      <div className="overflow-x-auto border border-[#E3E3E3] rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA]">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-[#8A8A8A] text-[11px] uppercase tracking-wider w-1/3" />
              {cols.map((c, ci) => (
                <th key={ci} className="text-center px-3 py-2 font-medium text-[#4A4A4A] text-xs">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={ri < rows.length - 1 ? 'border-b border-[#F3F3F3]' : ''}>
                <td className="px-3 py-2.5 text-[#1A1A1A]">{r}</td>
                {cols.map((_, ci) => (
                  <td key={ci} className="text-center px-3 py-2.5">
                    <input
                      type="radio"
                      name={`${question.id}_${ri}`}
                      checked={picks[ri] === ci}
                      onChange={() => onChange({ ...picks, [ri]: ci })}
                      className="w-4 h-4 accent-[#FF3C21] cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

function RankingPreview({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number[] | undefined;
  onChange: (v: number[]) => void;
}) {
  const { t } = useTranslation();
  const order = value && value.length === options.length ? value : options.map((_, i) => i);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = order.map((i) => `rank_${i}`);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onChange(arrayMove(order, from, to));
  };

  return (
    <div>
      <p className="text-xs text-[#8A8A8A] mb-2">{t('Drag to reorder by preference')}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {order.map((origIdx, pos) => (
              <SortableRankItem
                key={ids[pos]}
                id={ids[pos]}
                position={pos + 1}
                label={options[origIdx]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRankItem({ id, position, label }: { id: string; position: number; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-3 py-2.5 border rounded-md bg-white select-none touch-none cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'border-[#FF3C21] shadow-md' : 'border-[#E3E3E3]'
      }`}
    >
      <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold tabular-nums">
        {position}
      </span>
      <GripVertical className="w-4 h-4 text-[#B5B5B5] shrink-0" />
      <span className="text-sm text-[#1A1A1A] flex-1 min-w-0">{label}</span>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<Question>) => void;
  onMove: (dir: 'up' | 'down') => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (idx: number, value: string) => void;
  onRemoveOption: (idx: number) => void;
  locked?: boolean;
}

function QuestionCard({
  question,
  index,
  isFirst,
  isLast,
  canRemove,
  onChange,
  onMove,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  locked = false,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const showOptions = needsOptions(question.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    disabled: locked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F3F3] bg-white">
        {!locked && (
          <button
            {...listeners}
            className="text-[#8A8A8A] hover:text-[#1A1A1A] cursor-grab active:cursor-grabbing touch-none"
            title={t('Drag to reorder')}
            aria-label={t('Drag to reorder')}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold">
          {index + 1}
        </div>
        <span className="text-sm font-medium text-[#1A1A1A]">
          {question.text.trim() || `${t('Question')} ${index + 1}`}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F3F3] text-[#4A4A4A]">
            {t(QUESTION_TYPE_LABEL[question.type])}
          </span>
          {!locked && (
            <>
              <button
                onClick={() => onMove('up')}
                disabled={isFirst}
                className="p-1.5 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={t('Move up')}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMove('down')}
                disabled={isLast}
                className="p-1.5 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={t('Move down')}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                disabled={!canRemove}
                className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={t('Delete question')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {locked && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F3F3F3] text-[#8A8A8A] text-[10px] font-medium" title={t('Locked while live')}>
              <Lock className="w-2.5 h-2.5" /> {t('Locked')}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <fieldset disabled={locked} className="contents">
      <div className={`p-4 space-y-4 ${locked ? 'bg-[#FAFAFA]' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
              {t('Question text')}
            </label>
            <input
              type="text"
              value={question.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder={t('Enter your question...')}
              className="w-full px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
              {t('Type')}
            </label>
            <BrandSelect
              value={question.type}
              onValueChange={(v) => {
                const type = v as QuestionType;
                onChange({
                  type,
                  options: needsOptions(type) && question.options.length < 2 ? ['', ''] : question.options,
                  rows: needsRows(type)
                    ? (question.rows && question.rows.length >= 2 ? question.rows : ['', ''])
                    : undefined,
                });
              }}
              options={(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((k) => ({
                value: k,
                label: t(QUESTION_TYPE_LABEL[k]),
              }))}
            />
          </div>
        </div>

        {showOptions && (
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
              {question.type === 'matrix' ? t('Columns') : t('Options')}
            </label>
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => onUpdateOption(i, e.target.value)}
                    placeholder={`${question.type === 'matrix' ? t('Column') : t('Option')} ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A]"
                  />
                  <button
                    onClick={() => onRemoveOption(i)}
                    disabled={question.options.length <= 2}
                    className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={t('Remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={onAddOption}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] hover:text-[#000000] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {question.type === 'matrix' ? t('Add column') : t('Add option')}
            </button>
          </div>
        )}

        {question.type === 'matrix' && (
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">{t('Rows')}</label>
            <div className="space-y-2">
              {(question.rows ?? []).map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => {
                      const next = [...(question.rows ?? [])];
                      next[i] = e.target.value;
                      onChange({ rows: next });
                    }}
                    placeholder={`${t('Row')} ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A]"
                  />
                  <button
                    onClick={() => {
                      const rows = question.rows ?? [];
                      if (rows.length <= 2) return;
                      onChange({ rows: rows.filter((_, idx) => idx !== i) });
                    }}
                    disabled={(question.rows?.length ?? 0) <= 2}
                    className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={t('Remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => onChange({ rows: [...(question.rows ?? []), ''] })}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] hover:text-[#000000] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('Add row')}
            </button>
          </div>
        )}

        {question.type === 'scale' && (
          <div className="text-xs text-[#8A8A8A]">
            {t('Respondents will choose a value from 1 to 5.')}
          </div>
        )}

        {question.type === 'rating' && (
          <div className="text-xs text-[#8A8A8A]">
            {t('Respondents will rate from 1 to 5 stars.')}
          </div>
        )}

        {question.type === 'date' && (
          <div className="text-xs text-[#8A8A8A]">
            {t('Respondents will pick a date.')}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="w-4 h-4 rounded border-[#D4D4D4] text-[#1A1A1A] focus:ring-[#FF3C21] accent-[#1A1A1A] cursor-pointer"
          />
          <span className="text-sm text-[#1A1A1A]">{t('Required question')}</span>
        </label>
      </div>
      </fieldset>
    </div>
  );
}
