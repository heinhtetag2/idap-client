import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  ClipboardList,
  MessageSquare,
  Star,
  ArrowRight,
} from 'lucide-react';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { DEMO_SURVEYS } from '@/pages/surveys/survey-data';

// --- derived product metrics ---
const activeSurveys = DEMO_SURVEYS.filter((s) => s.status === 'Active').length;
const draftSurveys = DEMO_SURVEYS.filter((s) => s.status === 'Draft').length;
const totalResponses = DEMO_SURVEYS.reduce((sum, s) => sum + s.responsesCurrent, 0);
const scored = DEMO_SURVEYS.filter((s) => s.avgQuality > 0);
const avgQuality =
  scored.length > 0 ? scored.reduce((sum, s) => sum + s.avgQuality, 0) / scored.length : 0;
const creditsBalance = 450_000;

// --- chart data varies by selected range ---
type RangeKey = '7d' | '30d' | 'this_month' | 'last_month';

interface ChartPoint { name: string; value: number; }
interface RangeData {
  response: ChartPoint[];
  credits: ChartPoint[];
  responseTrend: number;
  creditsTrend: number;
  subtitle: string;
  creditsBucketLabel: string;
}

const CHART_DATA: Record<RangeKey, RangeData> = {
  '7d': {
    response: [
      { name: 'Mon', value: 42 }, { name: 'Tue', value: 58 }, { name: 'Wed', value: 31 },
      { name: 'Thu', value: 74 }, { name: 'Fri', value: 89 }, { name: 'Sat', value: 62 }, { name: 'Sun', value: 54 },
    ],
    credits: [
      { name: 'Mon', value: 18_000 }, { name: 'Tue', value: 24_000 }, { name: 'Wed', value: 13_000 },
      { name: 'Thu', value: 32_000 }, { name: 'Fri', value: 41_000 }, { name: 'Sat', value: 26_000 }, { name: 'Sun', value: 22_000 },
    ],
    responseTrend: 12.4,
    creditsTrend: -3.1,
    subtitle: 'in the last 7 days',
    creditsBucketLabel: 'This week',
  },
  '30d': {
    response: [
      { name: 'Week 1', value: 248 }, { name: 'Week 2', value: 312 }, { name: 'Week 3', value: 287 }, { name: 'Week 4', value: 394 },
    ],
    credits: [
      { name: 'Week 1', value: 92_000 }, { name: 'Week 2', value: 118_000 }, { name: 'Week 3', value: 104_000 }, { name: 'Week 4', value: 142_000 },
    ],
    responseTrend: 8.7,
    creditsTrend: 14.2,
    subtitle: 'in the last 30 days',
    creditsBucketLabel: 'Last 30 days',
  },
  this_month: {
    response: [
      { name: 'W1', value: 210 }, { name: 'W2', value: 298 }, { name: 'W3', value: 341 }, { name: 'W4', value: 176 },
    ],
    credits: [
      { name: 'W1', value: 78_000 }, { name: 'W2', value: 112_000 }, { name: 'W3', value: 128_000 }, { name: 'W4', value: 62_000 },
    ],
    responseTrend: 6.1,
    creditsTrend: 9.4,
    subtitle: 'this month',
    creditsBucketLabel: 'This month',
  },
  last_month: {
    response: [
      { name: 'W1', value: 188 }, { name: 'W2', value: 254 }, { name: 'W3', value: 301 }, { name: 'W4', value: 229 },
    ],
    credits: [
      { name: 'W1', value: 98_000 }, { name: 'W2', value: 124_000 }, { name: 'W3', value: 138_000 }, { name: 'W4', value: 110_000 },
    ],
    responseTrend: -2.3,
    creditsTrend: 5.8,
    subtitle: 'last month',
    creditsBucketLabel: 'Last month',
  },
};

// --- top performing surveys (by responses collected) ---
const topSurveys = [...DEMO_SURVEYS]
  .filter((s) => s.responsesCurrent > 0)
  .sort((a, b) => b.responsesCurrent - a.responsesCurrent)
  .slice(0, 4);

function formatMnt(value: number): string {
  return `₮${value.toLocaleString('en-US')}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${(value / 1_000).toFixed(0)}K`;
  return `₮${value}`;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<RangeKey>('7d');
  const range = CHART_DATA[dateRange];
  const responseTotal = range.response.reduce((sum, d) => sum + d.value, 0);
  const creditsTotal = range.credits.reduce((sum, d) => sum + d.value, 0);

  const stats = [
    {
      title: 'Available Credits',
      value: formatMnt(creditsBalance),
      Icon: CreditCard,
      trend: '+20%',
      isPositive: true,
      subtitle: 'Top-ups this month',
      href: '/billing',
    },
    {
      title: 'Active Surveys',
      value: String(activeSurveys),
      Icon: ClipboardList,
      trend: `${draftSurveys} drafts`,
      isPositive: null,
      subtitle: `${DEMO_SURVEYS.length} total`,
      href: '/surveys',
    },
    {
      title: 'Total Responses',
      value: totalResponses.toLocaleString(),
      Icon: MessageSquare,
      trend: '+8.3%',
      isPositive: true,
      subtitle: 'Across all live surveys',
      href: '/surveys',
    },
    {
      title: 'Avg. Quality Score',
      value: avgQuality.toFixed(1),
      Icon: Star,
      trend: '+0.2',
      isPositive: true,
      subtitle: 'Out of 5.0',
      href: '/surveys',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A]">{t('Dashboard')}</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            {t('Overview of your surveys, responses, and credit activity.')}
          </p>
        </div>
        <div className="flex gap-3">
          <BrandSelect
            value={dateRange}
            onValueChange={(v) => setDateRange(v as RangeKey)}
            leftIcon={<Calendar />}
            ariaLabel={t('Chart range')}
            options={[
              { value: '7d', label: t('Last 7 days') },
              { value: '30d', label: t('Last 30 days') },
              { value: 'this_month', label: t('This month') },
              { value: 'last_month', label: t('Last month') },
            ]}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.title}
            onClick={() => navigate(stat.href)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="text-left bg-white border border-[#E3E3E3] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[#D4D4D4] transition-colors group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[#8A8A8A]">{t(stat.title)}</span>
              <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A] group-hover:bg-[#FF3C21] group-hover:text-white transition-colors">
                <stat.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#1A1A1A] tabular-nums">{stat.value}</div>
            <div className="text-xs flex items-center gap-1.5 font-medium mt-2">
              {stat.isPositive === true && (
                <span className="text-[#047857] flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </span>
              )}
              {stat.isPositive === false && (
                <span className="text-[#DC2626] flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" />
                  {stat.trend}
                </span>
              )}
              {stat.isPositive === null && <span className="text-[#4A4A4A]">{stat.trend}</span>}
              <span className="text-[#D4D4D4]">•</span>
              <span className="text-[#8A8A8A] font-normal">{t(stat.subtitle)}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Collection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white border border-[#E3E3E3] rounded-md p-6 shadow-none"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                {t('Response Collection')}
              </h2>
              <p className="text-xs text-[#8A8A8A] mt-0.5">
                {t('Responses collected')} {t(range.subtitle)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-[#1A1A1A] tabular-nums">
                {responseTotal.toLocaleString()}
              </div>
              <div
                className={`text-xs font-medium flex items-center gap-0.5 justify-end ${
                  range.responseTrend >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'
                }`}
              >
                {range.responseTrend >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(range.responseTrend).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="h-[260px] w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={range.response} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3C21" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF3C21" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#8A8A8A' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#8A8A8A' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#B5B5B5' }}
                  formatter={(value: number) => [`${value} responses`, '']}
                  cursor={{ stroke: '#E3E3E3', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FF3C21"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResponses)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Credits Spent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white border border-[#E3E3E3] rounded-md p-6 shadow-none"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-semibold text-[#1A1A1A]">{t('Credits Spent')}</h2>
              <p className="text-xs text-[#8A8A8A] mt-0.5">
                {t('Survey reward payouts')} {t(range.subtitle)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-[#1A1A1A] tabular-nums">
                {formatCompact(creditsTotal)}
              </div>
              <div
                className={`text-xs font-medium flex items-center gap-0.5 justify-end ${
                  range.creditsTrend >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'
                }`}
              >
                {range.creditsTrend >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(range.creditsTrend).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="h-[260px] w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={range.credits} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#8A8A8A' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#8A8A8A' }}
                  tickFormatter={(v: number) => `${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#B5B5B5' }}
                  formatter={(value: number) => [formatMnt(value), '']}
                  cursor={{ fill: '#F3F3F3' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {range.credits.map((entry, index) => (
                    <Cell
                      key={`cell-${index}-${entry.name}`}
                      fill={index === range.credits.length - 1 ? '#FF3C21' : '#E3E3E3'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Performing Surveys */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-white border border-[#E3E3E3] rounded-md shadow-none overflow-hidden"
      >
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">{t('Top Performing Surveys')}</h2>
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              {t('Ranked by responses collected')}
            </p>
          </div>
          <button
            onClick={() => navigate('/surveys')}
            className="flex items-center gap-1 text-xs font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors cursor-pointer shrink-0"
          >
            {t('View all')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#F3F3F3] border-t border-[#F3F3F3]">
          {topSurveys.map((s) => {
            const pct = Math.min(100, Math.round((s.responsesCurrent / Math.max(1, s.responsesTarget)) * 100));
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/surveys/${s.id.toLowerCase()}`)}
                className="w-full grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 px-6 py-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="font-medium text-[#1A1A1A] truncate">{s.title}</div>
                  <div className="text-xs text-[#8A8A8A] mt-0.5">{t(s.category)}</div>
                </div>

                <div className="hidden sm:flex flex-col items-start w-40 gap-1.5">
                  <div className="relative w-full h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#FF3C21] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#8A8A8A] tabular-nums">
                    {s.responsesCurrent}/{s.responsesTarget}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-[#4A4A4A] tabular-nums">
                  <Star className="w-3.5 h-3.5 text-[#FF3C21]" fill="#FF3C21" />
                  {s.avgQuality.toFixed(1)}
                </div>

                <ArrowRight className="w-4 h-4 text-[#B5B5B5] group-hover:text-[#4A4A4A] transition-colors" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
