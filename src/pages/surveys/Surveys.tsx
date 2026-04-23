import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { BrandSelect } from '@/shared/ui/brand-select';
import { mockQuestionsFor } from '@/shared/lib/mock-questions';
import {
  Search,
  Download,
  Plus,
  X,
  Calendar,
  ChevronDown,
  Check,
  Pencil,
  Trash2,
  Save,
  AlertCircle,
  ArrowUpRight,
  Users,
  ClipboardList,
  Wallet,
  Receipt,
  Clock,
  List,
  CheckCircle,
  Archive,
  Lock,
  RotateCcw,
} from 'lucide-react';

import type { Survey, SurveyCategory, SurveyStatus } from './survey-data';
import { DEMO_SURVEYS } from './survey-data';

function formatMnt(value: number): string {
  return `₮${value.toLocaleString('en-US')}`;
}

export default function Surveys() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<SurveyCategory | 'All'>('All');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [surveys, setSurveys] = useState<Survey[]>(DEMO_SURVEYS);
  const [deletingSurvey, setDeletingSurvey] = useState<Survey | null>(null);
  const [graceWindow, setGraceWindow] = useState<'now' | '30m' | '24h'>('30m');
  const [view, setView] = useState<'all' | 'trash'>('all');
  const [toast, setToast] = useState<{ id: string; title: string } | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);

  const getStatusBadge = (status: SurveyStatus) => {
    switch (status) {
      case 'Active':    return 'bg-[#ECFDF5] text-[#047857]';
      case 'Draft':     return 'bg-[#F3F3F3] text-[#8A8A8A]';
      case 'Paused':    return 'bg-[#FFFBEB] text-[#B45309]';
      case 'Completed': return 'bg-[#EFF6FF] text-[#1D4ED8]';
    }
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'All' ||
    categoryFilter !== 'All' ||
    dateRange !== undefined;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setDateRange(undefined);
    setSelectedPreset(null);
  };

  const trashedCount = surveys.filter((s) => Boolean(s.deletedAt)).length;

  const visibleSurveys = surveys.filter((s) => {
    const inTrash = Boolean(s.deletedAt);
    if (view === 'trash' ? !inTrash : inTrash) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateRange?.from) {
      const created = new Date(s.createdAt);
      if (created < dateRange.from) return false;
      if (dateRange.to && created > dateRange.to) return false;
    }
    return true;
  });

  const totalActive = surveys.filter((s) => !s.deletedAt && s.status === 'Active').length;
  const totalResponses = surveys
    .filter((s) => !s.deletedAt)
    .reduce((acc, s) => acc + s.responsesCurrent, 0);
  const totalBudget = surveys
    .filter((s) => !s.deletedAt)
    .reduce((acc, s) => acc + s.rewardMnt * s.responsesTarget, 0);
  const totalSpent = surveys
    .filter((s) => !s.deletedAt)
    .reduce((acc, s) => acc + s.rewardMnt * s.responsesCurrent, 0);

  const showToast = (title: string) => {
    const id = `toast_${Date.now()}`;
    setToast({ id, title });
    setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), 5000);
  };

  const moveToTrash = (id: string) => {
    setSurveys((all) => all.map((s) => (s.id === id ? { ...s, deletedAt: new Date().toISOString() } : s)));
    showToast(t('Moved to Trash. Auto-deletes in 30 days.'));
  };

  const restoreFromTrash = (id: string) => {
    setSurveys((all) => all.map((s) => (s.id === id ? { ...s, deletedAt: null } : s)));
    showToast(t('Restored.'));
  };

  const purgeForever = (id: string) => {
    setSurveys((all) => all.filter((s) => s.id !== id));
    setPurgingId(null);
  };

  const undoLastTrash = () => {
    setSurveys((all) =>
      all
        .map((s) => (s.deletedAt ? { ...s, _ts: new Date(s.deletedAt).getTime() } : { ...s, _ts: -Infinity }))
        .sort((a, b) => (b as { _ts: number })._ts - (a as { _ts: number })._ts)
        .map(({ _ts: _omit, ...rest }, i) => (i === 0 ? { ...rest, deletedAt: null } : rest)) as Survey[],
    );
    setToast(null);
  };

  const daysUntilPurge = (deletedAt: string) => {
    const purgeDate = new Date(deletedAt).getTime() + 30 * 86400 * 1000;
    return Math.max(0, Math.ceil((purgeDate - Date.now()) / 86400000));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A]">{t('Surveys')}</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            {t('Create surveys, target respondents, and review quality-scored responses.')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer">
            <Download className="w-4 h-4" />
            {t('Export CSV')}
          </button>
          <button
            onClick={() => navigate('/surveys/new')}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors shadow-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('Create Survey')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: 'Active Surveys',
            Icon: ClipboardList,
            value: String(totalActive),
            trend: <span className="text-[#047857] flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> 12%</span>,
            subtitle: `${surveys.length} total this quarter`,
          },
          {
            title: 'Total Responses',
            Icon: Users,
            value: totalResponses.toLocaleString(),
            trend: <span className="text-[#047857] flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> 8.3%</span>,
            subtitle: 'Across all live surveys',
          },
          {
            title: 'Budget Allocated',
            Icon: Wallet,
            value: formatMnt(totalBudget),
            subtitle: 'Locked for current campaigns',
          },
          {
            title: 'Budget Spent',
            Icon: Receipt,
            value: formatMnt(totalSpent),
            subtitle: `${Math.round((totalSpent / Math.max(1, totalBudget)) * 100)}% of allocation`,
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="bg-white border border-[#E3E3E3] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[#D4D4D4] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[#8A8A8A]">{t(card.title)}</span>
              <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A] group-hover:bg-[#FF3C21] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#1A1A1A]">{card.value}</div>
            <div className="text-xs flex items-center gap-2 font-medium text-[#4A4A4A] mt-2">
              {card.trend && <>{card.trend}<span className="text-[#D4D4D4]">•</span></>}
              <span>{t(card.subtitle)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Table */}
      <div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search surveys...')}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A]"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative">
              <button
                onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] bg-white rounded-md text-sm font-medium text-[#4A4A4A] hover:bg-[#F3F3F3] focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] transition-colors shadow-none cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#8A8A8A]" />
                {dateRange?.from
                  ? (dateRange.to ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : format(dateRange.from, 'MMM d, yyyy'))
                  : t('Created Date')}
              </button>

              {isDateRangeOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-[#E3E3E3] rounded-md z-10 flex shadow-none">
                  <div className="w-48 border-r border-[#E3E3E3] p-2 flex flex-col gap-1">
                    {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 12 months', 'Custom date range'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSelectedPreset(preset);
                          if (preset === 'Last 7 days') setDateRange({ from: subDays(new Date(), 7), to: new Date() });
                          else if (preset === 'Last 30 days') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                          else if (preset === 'Last 90 days') setDateRange({ from: subDays(new Date(), 90), to: new Date() });
                          else if (preset === 'Last 12 months') setDateRange({ from: subMonths(new Date(), 12), to: new Date() });
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors shadow-none cursor-pointer ${
                          selectedPreset === preset
                            ? 'bg-[#F3F3F3] text-[#1A1A1A] font-medium'
                            : 'text-[#4A4A4A] hover:bg-white'
                        }`}
                      >
                        {t(preset)}
                        {selectedPreset === preset && <Check className="w-4 h-4 text-[#1A1A1A]" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-4" style={{ '--primary': '#FF3C21', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}>
                    <CalendarUI
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        setSelectedPreset('Custom date range');
                      }}
                      numberOfMonths={2}
                      className="border-0 shadow-none p-0"
                    />
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#F3F3F3]">
                      <button
                        onClick={() => {
                          setDateRange(undefined);
                          setSelectedPreset('Custom date range');
                          setIsDateRangeOpen(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors shadow-none cursor-pointer"
                      >
                        {t('Clear')}
                      </button>
                      <button
                        onClick={() => setIsDateRangeOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#FF3C21] rounded-md hover:bg-[#E63419] transition-colors shadow-none cursor-pointer"
                      >
                        {t('Apply')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <BrandSelect
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as SurveyCategory | 'All')}
              leftIcon={<List />}
              className="sm:w-auto"
              options={[
                { value: 'All', label: t('All Categories') },
                { value: 'Social', label: t('Social') },
                { value: 'Product', label: t('Product') },
                { value: 'Brand', label: t('Brand') },
                { value: 'Other', label: t('Other') },
              ]}
            />

            <BrandSelect
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as SurveyStatus | 'All')}
              leftIcon={<CheckCircle />}
              className="sm:w-auto"
              options={[
                { value: 'All', label: t('All Statuses') },
                { value: 'Active', label: t('Active') },
                { value: 'Draft', label: t('Draft') },
                { value: 'Paused', label: t('Paused') },
                { value: 'Completed', label: t('Completed') },
              ]}
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center w-9 h-9 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-full transition-colors border border-transparent hover:border-[#E3E3E3] shadow-none cursor-pointer flex-shrink-0"
                title={t('Clear filters')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-md border border-[#F3F3F3] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E3E3E3] text-[#8A8A8A] font-medium bg-[#FAFAFA]">
                  <th className="pl-6 pr-3 py-4 font-medium w-12">{t('No.')}</th>
                  <th className="pl-3 pr-6 py-4 font-medium">{t('Survey')}</th>
                  <th className="px-6 py-4 font-medium">{t('Responses')}</th>
                  <th className="px-6 py-4 font-medium">{t('Reward')}</th>
                  <th className="px-6 py-4 font-medium">{t('Duration')}</th>
                  <th className="px-6 py-4 font-medium">{t('Created Date')}</th>
                  <th className="px-6 py-4 font-medium">{t('Ends')}</th>
                  <th className="px-6 py-4 font-medium">{t('Status')}</th>
                  <th className="px-6 py-4 font-medium text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F3F3]">
                {visibleSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-[#8A8A8A]">
                      {t('No surveys match these filters.')}
                    </td>
                  </tr>
                ) : visibleSurveys.map((survey, index) => {
                  const pct = Math.min(100, Math.round((survey.responsesCurrent / Math.max(1, survey.responsesTarget)) * 100));
                  return (
                    <motion.tr
                      key={survey.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="hover:bg-white transition-colors group cursor-pointer"
                      onClick={() => navigate(`/surveys/${survey.id.toLowerCase()}`)}
                    >
                      {/* Index */}
                      <td className="pl-6 pr-3 py-4 text-[#8A8A8A] tabular-nums">
                        {index + 1}
                      </td>

                      {/* Survey */}
                      <td className="pl-3 pr-6 py-4">
                        <div className="font-medium text-[#1A1A1A]">{survey.title}</div>
                        <div className="text-xs text-[#8A8A8A] mt-0.5">{t(survey.category)}</div>
                      </td>

                      {/* Responses — progress bar + counts */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-28 h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-[#FF3C21] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-[#4A4A4A] tabular-nums">
                            {survey.responsesCurrent}/{survey.responsesTarget}
                          </span>
                        </div>
                      </td>

                      {/* Reward */}
                      <td className="px-6 py-4 font-semibold text-[#1A1A1A] tabular-nums">
                        {formatMnt(survey.rewardMnt)}
                      </td>

                      {/* Length */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[#4A4A4A]">
                          <Clock className="w-3.5 h-3.5 text-[#8A8A8A]" />
                          <span className="tabular-nums">{survey.lengthMinutes}m</span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">
                        {format(new Date(survey.createdAt), 'MMM d, yyyy')}
                      </td>

                      {/* Ends */}
                      <td className="px-6 py-4 text-[#8A8A8A]">
                        {survey.status === 'Draft' ? '—' : t(survey.endsLabel)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full shadow-none ${getStatusBadge(survey.status)}`}>
                          {t(survey.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/surveys/new', {
                                state: {
                                  prefill: {
                                    title: survey.title,
                                    category: survey.category,
                                    reward: survey.rewardMnt,
                                    maxResponses: survey.responsesTarget,
                                    estMinutes: survey.lengthMinutes,
                                    questions: mockQuestionsFor(survey.category),
                                    status: survey.status,
                                    responsesCurrent: survey.responsesCurrent,
                                  },
                                },
                              });
                            }}
                            className="p-1.5 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors cursor-pointer"
                            title={t('Edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingSurvey(survey); }}
                            className="p-1.5 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors cursor-pointer"
                            title={t('Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F3F3] bg-white">
            <span className="text-sm text-[#8A8A8A]">
              {t('Showing')} 1 {t('to')} {visibleSurveys.length} {t('of')} {surveys.length} {t('surveys')}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#E3E3E3] rounded-md bg-white text-[#8A8A8A] hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('Previous')}
              </button>
              <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[#FF3C21] rounded-md bg-[#FF3C21] text-white tabular-nums cursor-default">
                1
              </button>
              <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#E3E3E3] rounded-md bg-white text-[#4A4A4A] hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                {t('Next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete / End Survey Modal */}
      <AnimatePresence>
        {deletingSurvey && (() => {
          const s = deletingSurvey;
          const isLive = s.status === 'Active' || s.status === 'Paused';
          const locked = s.responsesTarget * s.rewardMnt;
          const earned = s.responsesCurrent * s.rewardMnt;
          const refund = Math.max(0, locked - earned);
          const close = () => {
            setDeletingSurvey(null);
            setGraceWindow('30m');
          };
          const remove = () => {
            setSurveys(surveys.filter((x) => x.id !== s.id));
            close();
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-[#1A1A1A]/30 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="bg-white rounded-md w-full max-w-md shadow-none border border-[#E3E3E3] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F3F3] shrink-0">
                  <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
                    {isLive ? (
                      <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-[#DC2626]" />
                    )}
                    {isLive ? t('End survey early') : t('Delete survey')}
                  </h2>
                  <button
                    onClick={close}
                    className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 bg-white space-y-5">
                  {/* Survey card */}
                  <div className="p-3 bg-[#FAFAFA] border border-[#E3E3E3] rounded-md">
                    <div className="font-medium text-[#1A1A1A] text-sm">{t(s.title)}</div>
                    <div className="text-[#8A8A8A] text-xs mt-1">
                      {t(s.category)} · {formatMnt(s.rewardMnt)} · {s.responsesCurrent}/{s.responsesTarget} {t('responses')}
                    </div>
                  </div>

                  {isLive ? (
                    <>
                      {/* Money summary */}
                      <div className="rounded-md border border-[#E3E3E3] divide-y divide-[#F3F3F3]">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <div className="text-sm text-[#1A1A1A]">{t('Already paid out')}</div>
                            <div className="text-xs text-[#8A8A8A] mt-0.5">
                              {s.responsesCurrent} {t('completed responses')}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#1A1A1A] tabular-nums">
                            {formatMnt(earned)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-[#ECFDF5]">
                          <div>
                            <div className="text-sm font-medium text-[#047857]">
                              {t('Refunded to your balance')}
                            </div>
                            <div className="text-xs text-[#047857]/80 mt-0.5">
                              {t('Unused locked credits')}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#047857] tabular-nums">
                            + {formatMnt(refund)}
                          </span>
                        </div>
                      </div>

                      {/* Grace window */}
                      {s.status === 'Active' && (
                        <div>
                          <label className="block text-xs font-medium text-[#4A4A4A] mb-2">
                            {t('Give in-progress respondents time to finish?')}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              [
                                { id: 'now', label: t('End now') },
                                { id: '30m', label: t('30 min') },
                                { id: '24h', label: t('24 hours') },
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setGraceWindow(opt.id)}
                                className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                  graceWindow === opt.id
                                    ? 'border-[#FF3C21] bg-[#FFF1EE] text-[#FF3C21]'
                                    : 'border-[#E3E3E3] bg-white text-[#4A4A4A] hover:bg-[#F3F3F3]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* What happens next — clean bullet list */}
                      <ul className="space-y-2.5 text-xs text-[#4A4A4A]">
                        <li className="flex items-start gap-2.5">
                          {graceWindow === 'now' || s.status === 'Paused' ? (
                            <>
                              <X className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                              <span>{t('In-progress responses are discarded and not paid.')}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0 mt-0.5" />
                              <span>
                                {graceWindow === '30m'
                                  ? t('Respondents have 30 minutes to submit. Eligible submissions are paid.')
                                  : t('Respondents have 24 hours to submit. Eligible submissions are paid.')}
                              </span>
                            </>
                          )}
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Archive className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0 mt-0.5" />
                          <span>{t('Results stay in your archive — you can still export them.')}</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Lock className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0 mt-0.5" />
                          <span>{t('The survey can\'t be reopened.')}</span>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed">
                        {s.status === 'Draft'
                          ? t('This draft will be permanently deleted. No credits or respondents are involved.')
                          : t('The final report and exports will be deleted. Payouts already made are unaffected.')}
                      </p>
                      <p className="text-[#DC2626] text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        {t('This action cannot be undone.')}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 px-6 py-4 border-t border-[#F3F3F3] bg-[#FAFAFA] shrink-0">
                  <button
                    onClick={close}
                    className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-md hover:bg-[#B91C1C] transition-colors cursor-pointer"
                    onClick={remove}
                  >
                    {isLive ? t('End survey') : t('Delete permanently')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </motion.div>
  );
}
