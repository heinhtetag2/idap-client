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

  const getStatusBadge = (status: SurveyStatus) => {
    switch (status) {
      case 'Active':    return 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]';
      case 'Draft':     return 'bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]';
      case 'Paused':    return 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]';
      case 'Completed': return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]';
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

  const visibleSurveys = surveys.filter((s) => {
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

  const totalActive = surveys.filter((s) => s.status === 'Active').length;
  const totalResponses = surveys.reduce((acc, s) => acc + s.responsesCurrent, 0);
  const totalBudget = surveys.reduce((acc, s) => acc + s.rewardMnt * s.responsesTarget, 0);
  const totalSpent = surveys.reduce((acc, s) => acc + s.rewardMnt * s.responsesCurrent, 0);

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
          <h1 className="text-3xl font-serif text-[#0A0A0A]">{t('Surveys')}</h1>
          <p className="text-sm text-[#71717A] mt-1">
            {t('Create surveys, target respondents, and review quality-scored responses.')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E4E4E7] rounded-md text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors bg-white shadow-none cursor-pointer">
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
            className="bg-white border border-[#E4E4E7] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[#D4D4D8] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[#71717A]">{t(card.title)}</span>
              <div className="p-2 bg-[#F4F4F5] rounded-md text-[#52525B] group-hover:bg-[#FF3C21] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#0A0A0A]">{card.value}</div>
            <div className="text-xs flex items-center gap-2 font-medium text-[#52525B] mt-2">
              {card.trend && <>{card.trend}<span className="text-[#D4D4D8]">•</span></>}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search surveys...')}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E4E7] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#71717A]"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative">
              <button
                onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-[#E4E4E7] bg-white rounded-md text-sm font-medium text-[#52525B] hover:bg-[#F4F4F5] focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] transition-colors shadow-none cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#71717A]" />
                {dateRange?.from
                  ? (dateRange.to ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : format(dateRange.from, 'MMM d, yyyy'))
                  : t('Created Date')}
              </button>

              {isDateRangeOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-[#E4E4E7] rounded-md z-10 flex shadow-none">
                  <div className="w-48 border-r border-[#E4E4E7] p-2 flex flex-col gap-1">
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
                            ? 'bg-[#F4F4F5] text-[#0A0A0A] font-medium'
                            : 'text-[#52525B] hover:bg-white'
                        }`}
                      >
                        {t(preset)}
                        {selectedPreset === preset && <Check className="w-4 h-4 text-[#0A0A0A]" />}
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
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#F4F4F5]">
                      <button
                        onClick={() => {
                          setDateRange(undefined);
                          setSelectedPreset('Custom date range');
                          setIsDateRangeOpen(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-[#52525B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors shadow-none cursor-pointer"
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
                className="flex items-center justify-center w-9 h-9 text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-full transition-colors border border-transparent hover:border-[#E4E4E7] shadow-none cursor-pointer flex-shrink-0"
                title={t('Clear filters')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-md border border-[#F4F4F5] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E4E4E7] text-[#52525B] font-medium bg-[#F4F4F5]">
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
              <tbody className="divide-y divide-[#F4F4F5]">
                {visibleSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-[#71717A]">
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
                      <td className="pl-6 pr-3 py-4 text-[#71717A] tabular-nums">
                        {index + 1}
                      </td>

                      {/* Survey */}
                      <td className="pl-3 pr-6 py-4">
                        <div className="font-medium text-[#0A0A0A]">{survey.title}</div>
                        <div className="text-xs text-[#71717A] mt-0.5">{t(survey.category)}</div>
                      </td>

                      {/* Responses — progress bar + counts */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-28 h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-[#FF3C21] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-[#52525B] tabular-nums">
                            {survey.responsesCurrent}/{survey.responsesTarget}
                          </span>
                        </div>
                      </td>

                      {/* Reward */}
                      <td className="px-6 py-4 font-semibold text-[#0A0A0A] tabular-nums">
                        {formatMnt(survey.rewardMnt)}
                      </td>

                      {/* Length */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[#52525B]">
                          <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                          <span className="tabular-nums">{survey.lengthMinutes}m</span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-[#52525B] tabular-nums">
                        {format(new Date(survey.createdAt), 'MMM d, yyyy')}
                      </td>

                      {/* Ends */}
                      <td className="px-6 py-4 text-[#71717A]">
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
                                  },
                                },
                              });
                            }}
                            className="p-1.5 text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-md transition-colors cursor-pointer"
                            title={t('Edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingSurvey(survey); }}
                            className="p-1.5 text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-md transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F4F4F5] bg-white">
            <span className="text-sm text-[#71717A]">
              {t('Showing')} 1 {t('to')} {visibleSurveys.length} {t('of')} {surveys.length} {t('surveys')}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#E4E4E7] rounded-md bg-white text-[#71717A] hover:bg-[#F4F4F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('Previous')}
              </button>
              <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[#FF3C21] rounded-md bg-[#FF3C21] text-white tabular-nums cursor-default">
                1
              </button>
              <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#E4E4E7] rounded-md bg-white text-[#52525B] hover:bg-[#F4F4F5] transition-colors cursor-pointer">
                {t('Next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingSurvey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0A0A]/30 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-sm shadow-none border border-[#F4F4F5] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5] shrink-0">
                <h2 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-[#DC2626]" />
                  {t('Delete Survey')}
                </h2>
                <button
                  onClick={() => setDeletingSurvey(null)}
                  className="text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-white">
                <p className="text-[#52525B] text-sm leading-relaxed">
                  {t('Are you sure you want to delete this survey? Any in-progress responses will be discarded.')}
                </p>
                <div className="mt-3 p-3 bg-white border border-[#E4E4E7] rounded-md">
                  <div className="font-medium text-[#0A0A0A] text-sm">
                    {t(deletingSurvey.title)}
                  </div>
                  <div className="text-[#71717A] text-xs mt-1">
                    {t(deletingSurvey.category)} • <span className="font-medium text-[#0A0A0A]">{formatMnt(deletingSurvey.rewardMnt)}</span> · {deletingSurvey.responsesCurrent}/{deletingSurvey.responsesTarget}
                  </div>
                </div>
                <p className="mt-4 text-[#DC2626] text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {t('This action cannot be undone.')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F4F4F5] bg-white shrink-0">
                <button
                  onClick={() => setDeletingSurvey(null)}
                  className="px-4 py-2 text-sm font-medium text-[#52525B] bg-white border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors shadow-none cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-md hover:bg-[#B91C1C] transition-colors shadow-none cursor-pointer"
                  onClick={() => {
                    setSurveys(surveys.filter((s) => s.id !== deletingSurvey.id));
                    setDeletingSurvey(null);
                  }}
                >
                  {t('Delete Permanently')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
