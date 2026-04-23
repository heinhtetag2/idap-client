import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import {
  Pencil,
  Pause,
  Play,
  Trash2,
  Users,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Clock,
  AlertCircle,
  X,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  List,
  CheckCircle,
  ArrowUpRight,
  Info,
  LayoutDashboard,
  Shield,
  MapPin,
  ClipboardCheck,
  TrendingUp,
  UserCircle2,
  GraduationCap,
  Briefcase,
  Wallet,
  Copy,
  Archive,
  Lock,
  Rocket,
} from 'lucide-react';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { mockQuestionsFor } from '@/shared/lib/mock-questions';
import { findSurveyById, DEMO_SURVEYS, type Survey as SurveyRecord } from '@/pages/surveys/survey-data';

type QualityTier = 'High' | 'Medium' | 'Low';
type RewardStatus = 'Earned' | 'Pending' | 'Invalidated';

interface RespondentProfile {
  /** 1 (Newcomer) – 5 (Elite). Matches TRUST_LEVELS in shared config. */
  trustLevel: 1 | 2 | 3 | 4 | 5;
  ageBracket: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  gender: 'Female' | 'Male' | 'Other';
  region: string;
  /** Sub-region (e.g., "Khoroo 3"). */
  district: string;
  education: 'High school' | 'Diploma' | 'Bachelor' | 'Master' | 'Other';
  employment: 'Full-time' | 'Part-time' | 'Self-employed' | 'Student' | 'Unemployed';
  /** Monthly household income bracket (MNT). */
  incomeBracket: string;
  surveysCompleted: number;
  avgQualityScore: number; // 0-100 across their history
  memberSinceLabel: string;
}

interface Response {
  id: string;
  respondent: string;
  quality: QualityTier;
  rewardStatus: RewardStatus;
  submittedLabel: string;
  answers: Record<string, string>;
  profile: RespondentProfile;
}

interface QualityFactor {
  label: string;
  detail: string;
  passed: boolean;
}

type QuestionType =
  | 'single'
  | 'multi'
  | 'rating'
  | 'scale'
  | 'ranking'
  | 'date'
  | 'matrix'
  | 'text';

interface QuestionDef {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  /** Matrix rows. Columns come from `options`. */
  rows?: string[];
  /** 10-item deterministic cycle for demo distribution.
   *  - single / rating / scale / date / text: plain string
   *  - multi: comma-separated option labels, e.g. "Videos, Memes"
   *  - ranking: pipe-separated order, best-to-worst, e.g. "Speed|Price|Brand|Support"
   *  - matrix: row=col pairs separated by ";", e.g. "Ease=Good; Price=Ok"
   */
  pattern: string[];
  timeSec: number;
}

const QUALITY_FACTORS: QualityFactor[] = [
  { label: 'Response speed',   detail: 'Avg 12.4s/question — normal',            passed: true },
  { label: 'Straight-lining',  detail: 'No straight-lining detected',            passed: true },
  { label: 'Attention check',  detail: 'Passed all attention checks',            passed: true },
  { label: 'Position bias',    detail: 'Answer distribution looks natural',      passed: true },
  { label: 'Tab visibility',   detail: 'Stayed on tab throughout survey',        passed: true },
];

const QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    text: 'Which mobile banking app do you use most frequently?',
    type: 'single',
    options: ['TDB Digital', 'Khan Bank', 'Xac Bank', 'State Bank', 'Other'],
    pattern: ['TDB Digital', 'TDB Digital', 'TDB Digital', 'TDB Digital', 'Khan Bank', 'Khan Bank', 'Khan Bank', 'Xac Bank', 'State Bank', 'Other'],
    timeSec: 9,
  },
  {
    id: 'q2',
    text: 'How often do you make digital payments per week?',
    type: 'single',
    options: ['0 times', '1–5 times', '6–10 times', '11–20 times', '20+ times'],
    pattern: ['1–5 times', '1–5 times', '6–10 times', '6–10 times', '6–10 times', '6–10 times', '11–20 times', '11–20 times', '20+ times', '0 times'],
    timeSec: 13,
  },
  {
    id: 'q3',
    text: 'What is your primary reason for using digital payments?',
    type: 'single',
    options: ['No cash available', 'Convenience', 'Security', 'Discount offers', 'Other'],
    pattern: ['Convenience', 'Convenience', 'Convenience', 'No cash available', 'No cash available', 'No cash available', 'Security', 'Security', 'Discount offers', 'Other'],
    timeSec: 11,
  },
  {
    id: 'q4',
    text: 'Rate your overall satisfaction',
    type: 'rating',
    pattern: ['5', '5', '4', '4', '4', '4', '3', '3', '2', '1'],
    timeSec: 7,
  },
  {
    id: 'q5',
    text: 'Would you recommend this service to others?',
    type: 'single',
    options: ['Yes, definitely', 'Probably', 'Not sure', 'No'],
    pattern: ['Yes, definitely', 'Yes, definitely', 'Yes, definitely', 'Yes, definitely', 'Probably', 'Probably', 'Probably', 'Not sure', 'Not sure', 'No'],
    timeSec: 10,
  },
  {
    id: 'q6',
    text: 'What is the most useful feature?',
    type: 'single',
    options: ['Quick transfers', 'Bill payments', 'QR scan', 'International', 'Investment'],
    pattern: ['Quick transfers', 'Quick transfers', 'Quick transfers', 'Bill payments', 'Bill payments', 'QR scan', 'QR scan', 'International', 'Investment', 'Bill payments'],
    timeSec: 15,
  },
  {
    id: 'q7',
    text: 'Any suggestions for improvement?',
    type: 'text',
    pattern: [
      'Add more languages',
      'Better customer support',
      'Faster app performance',
      'Reduce transaction fees',
      'More payment options',
      'Add dark mode',
      '',
      '',
      'Support Apple Pay',
      '',
    ],
    timeSec: 23,
  },
  {
    id: 'q8',
    text: 'How likely are you to recommend digital payments to others?',
    type: 'scale',
    pattern: ['5', '4', '5', '4', '4', '3', '4', '5', '3', '2'],
    timeSec: 6,
  },
  {
    id: 'q9',
    text: 'Rank these features by importance',
    type: 'ranking',
    options: ['Security', 'Speed', 'Cashback', 'Design', 'Support'],
    pattern: [
      'Security|Speed|Cashback|Design|Support',
      'Security|Speed|Support|Design|Cashback',
      'Speed|Security|Cashback|Support|Design',
      'Security|Cashback|Speed|Support|Design',
      'Speed|Security|Design|Cashback|Support',
      'Security|Speed|Support|Cashback|Design',
      'Speed|Security|Cashback|Design|Support',
      'Security|Speed|Design|Support|Cashback',
      'Security|Speed|Cashback|Design|Support',
      'Speed|Security|Cashback|Support|Design',
    ],
    timeSec: 18,
  },
  {
    id: 'q10',
    text: 'When did you last use a mobile payment?',
    type: 'date',
    pattern: [
      '2026-04-22',
      '2026-04-21',
      '2026-04-22',
      '2026-04-20',
      '2026-04-18',
      '2026-04-22',
      '2026-04-15',
      '2026-04-19',
      '2026-04-22',
      '2026-04-10',
    ],
    timeSec: 8,
  },
  {
    id: 'q11',
    text: 'Rate each aspect of the mobile payment experience',
    type: 'matrix',
    options: ['Poor', 'Ok', 'Good', 'Excellent'],
    rows: ['Ease of use', 'Speed', 'Security', 'Support'],
    pattern: [
      'Ease of use=Excellent; Speed=Excellent; Security=Good; Support=Good',
      'Ease of use=Good; Speed=Excellent; Security=Good; Support=Ok',
      'Ease of use=Excellent; Speed=Good; Security=Excellent; Support=Good',
      'Ease of use=Good; Speed=Good; Security=Good; Support=Ok',
      'Ease of use=Excellent; Speed=Excellent; Security=Good; Support=Good',
      'Ease of use=Ok; Speed=Good; Security=Ok; Support=Poor',
      'Ease of use=Good; Speed=Excellent; Security=Excellent; Support=Good',
      'Ease of use=Excellent; Speed=Good; Security=Good; Support=Ok',
      'Ease of use=Good; Speed=Good; Security=Excellent; Support=Good',
      'Ease of use=Excellent; Speed=Excellent; Security=Excellent; Support=Excellent',
    ],
    timeSec: 22,
  },
];

function answerForResponse(questionIndex: number, responseIndex: number): string {
  const q = QUESTIONS[questionIndex];
  // Rotate pattern by question index so each question has a different distribution
  return q.pattern[(responseIndex + questionIndex * 3) % q.pattern.length];
}

interface Aggregation {
  type: QuestionType;
  total: number;
  distribution: Array<{ value: string; count: number; pct: number }>;
  avg?: number;
  texts?: string[];
  /** Ranking: sorted by avg rank ascending (best first). */
  rankings?: Array<{ value: string; avgRank: number }>;
  /** Matrix: per-row distribution across columns. */
  matrixRows?: Array<{
    row: string;
    distribution: Array<{ value: string; count: number; pct: number }>;
  }>;
  /** Date: earliest / latest picks. */
  dateRange?: { first: string; last: string };
}

function aggregateQuestion(q: QuestionDef, responses: Response[]): Aggregation {
  const total = responses.length;

  if (q.type === 'text') {
    const texts = responses.map((r) => r.answers[q.id]).filter((s) => s && s.trim().length > 0) as string[];
    return { type: 'text', total, distribution: [], texts };
  }

  if (q.type === 'multi') {
    const counts = new Map<string, number>();
    responses.forEach((r) => {
      const a = r.answers[q.id];
      if (!a) return;
      a.split(',').map((s) => s.trim()).filter(Boolean).forEach((opt) => {
        counts.set(opt, (counts.get(opt) ?? 0) + 1);
      });
    });
    const distribution = (q.options ?? []).map((opt) => {
      const count = counts.get(opt) ?? 0;
      return { value: opt, count, pct: total > 0 ? (count / total) * 100 : 0 };
    });
    return { type: 'multi', total, distribution };
  }

  if (q.type === 'rating' || q.type === 'scale') {
    const counts = new Map<string, number>();
    responses.forEach((r) => {
      const a = r.answers[q.id];
      if (a != null && a !== '') counts.set(a, (counts.get(a) ?? 0) + 1);
    });
    const sum = responses.reduce((acc, r) => acc + Number(r.answers[q.id] ?? 0), 0);
    const avg = total > 0 ? sum / total : 0;
    const distribution = ['5', '4', '3', '2', '1'].map((v) => {
      const count = counts.get(v) ?? 0;
      return { value: v, count, pct: total > 0 ? (count / total) * 100 : 0 };
    });
    return { type: q.type, total, distribution, avg };
  }

  if (q.type === 'ranking') {
    const options = q.options ?? [];
    const sum = new Map<string, number>();
    const n = new Map<string, number>();
    responses.forEach((r) => {
      const a = r.answers[q.id];
      if (!a) return;
      const order = a.split('|').map((s) => s.trim()).filter(Boolean);
      order.forEach((opt, idx) => {
        sum.set(opt, (sum.get(opt) ?? 0) + (idx + 1));
        n.set(opt, (n.get(opt) ?? 0) + 1);
      });
    });
    const rankings = options
      .map((opt) => {
        const c = n.get(opt) ?? 0;
        const s = sum.get(opt) ?? 0;
        return { value: opt, avgRank: c > 0 ? s / c : options.length };
      })
      .sort((a, b) => a.avgRank - b.avgRank);
    return { type: 'ranking', total, distribution: [], rankings };
  }

  if (q.type === 'date') {
    const picks = responses
      .map((r) => r.answers[q.id])
      .filter((s) => s && s.length > 0) as string[];
    const counts = new Map<string, number>();
    picks.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1));
    const distribution = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count, pct: total > 0 ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
    const sorted = [...picks].sort();
    const dateRange = picks.length > 0
      ? { first: sorted[0], last: sorted[sorted.length - 1] }
      : undefined;
    return { type: 'date', total, distribution, dateRange };
  }

  if (q.type === 'matrix') {
    const rows = q.rows ?? [];
    const cols = q.options ?? [];
    const matrixRows = rows.map((row) => {
      const counts = new Map<string, number>();
      let rowTotal = 0;
      responses.forEach((r) => {
        const a = r.answers[q.id];
        if (!a) return;
        const pairs = a.split(';').map((s) => s.trim()).filter(Boolean);
        const match = pairs.find((p) => p.split('=')[0].trim() === row);
        if (!match) return;
        const col = match.split('=')[1]?.trim();
        if (!col) return;
        counts.set(col, (counts.get(col) ?? 0) + 1);
        rowTotal += 1;
      });
      const distribution = cols.map((col) => {
        const count = counts.get(col) ?? 0;
        return { value: col, count, pct: rowTotal > 0 ? (count / rowTotal) * 100 : 0 };
      });
      return { row, distribution };
    });
    return { type: 'matrix', total, distribution: [], matrixRows };
  }

  // single choice
  const counts = new Map<string, number>();
  responses.forEach((r) => {
    const a = r.answers[q.id];
    if (a != null && a !== '') counts.set(a, (counts.get(a) ?? 0) + 1);
  });
  const distribution = (q.options ?? []).map((opt) => {
    const count = counts.get(opt) ?? 0;
    return { value: opt, count, pct: total > 0 ? (count / total) * 100 : 0 };
  });
  return { type: 'single', total, distribution };
}

function qualityScoreFor(tier: QualityTier) {
  return tier === 'High' ? 83 : tier === 'Medium' ? 62 : 28;
}

function multiplierFor(score: number) {
  if (score >= 90) return 1.2;
  if (score >= 85) return 1.1;
  if (score >= 80) return 1.0;
  if (score >= 75) return 0.9;
  return 0.8;
}

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

const FIRST_NAMES = ['Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia', 'Ethan', 'Ava', 'Noah', 'Isabella', 'Liam', 'Mia', 'Lucas', 'Charlotte', 'Oliver', 'Amelia', 'Elijah', 'Harper', 'Benjamin'];
const LAST_NAMES  = ['Johnson', 'Chen', 'Wilson', 'Park', 'Martinez', 'Anderson', 'Brown', 'Garcia', 'Rodriguez', 'Lee', 'Kim', 'Nguyen', 'Patel', 'Singh', 'Smith', 'Taylor', 'Davies', 'Cohen', 'Yamamoto', 'O\'Connor'];
const QUALITY_CYCLE: QualityTier[] = ['High', 'High', 'High', 'High', 'Medium', 'High', 'High', 'Medium', 'High', 'Low'];
const STATUS_FOR_QUALITY: Record<QualityTier, RewardStatus> = {
  High: 'Earned',
  Medium: 'Pending',
  Low: 'Invalidated',
};

function submittedLabel(index: number): string {
  if (index === 0) return 'less than a minute ago';
  if (index === 1) return 'about 1 hour ago';
  if (index < 24) return `about ${index} hours ago`;
  const days = Math.floor(index / 24);
  return days === 1 ? 'about 1 day ago' : `${days} days ago`;
}

const AGE_BRACKETS: RespondentProfile['ageBracket'][] = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDERS: RespondentProfile['gender'][] = ['Female', 'Male', 'Other'];
const REGIONS = ['Ulaanbaatar', 'Darkhan', 'Erdenet', 'Choibalsan', 'Khovd'];
const DISTRICTS = ['Khoroo 1', 'Khoroo 3', 'Khoroo 7', 'Khoroo 12', 'Central', 'North', 'South'];
const EDUCATIONS: RespondentProfile['education'][] = ['High school', 'Diploma', 'Bachelor', 'Master', 'Other'];
const EMPLOYMENTS: RespondentProfile['employment'][] = ['Full-time', 'Part-time', 'Self-employed', 'Student', 'Unemployed'];
const INCOME_BRACKETS = [
  'Under ₮500K',
  '₮500K – 1M',
  '₮1M – 2M',
  '₮2M – 3M',
  '₮3M+',
  'Prefer not to say',
];
const MEMBERSHIP_LABELS = [
  '3 months',
  '6 months',
  '11 months',
  '1 year',
  '1 year 4 months',
  '2 years',
  '2 years 6 months',
];

function profileFor(index: number, quality: QualityTier): RespondentProfile {
  // Deterministic but varied pseudo-data keyed off the response index.
  const trustCycle: RespondentProfile['trustLevel'][] = [2, 3, 4, 3, 5, 2, 4, 1, 3, 5];
  const base = quality === 'High' ? 78 : quality === 'Medium' ? 58 : 34;
  const jitter = ((index * 13) % 11) - 5;
  const avgQualityScore = Math.max(0, Math.min(100, base + jitter));
  return {
    trustLevel: trustCycle[index % trustCycle.length],
    ageBracket: AGE_BRACKETS[(index * 3 + 1) % AGE_BRACKETS.length],
    gender: GENDERS[(index * 5) % GENDERS.length],
    region: REGIONS[(index * 7 + 2) % REGIONS.length],
    district: DISTRICTS[(index * 4 + 3) % DISTRICTS.length],
    education: EDUCATIONS[(index * 2 + 4) % EDUCATIONS.length],
    employment: EMPLOYMENTS[(index * 3 + 2) % EMPLOYMENTS.length],
    incomeBracket: INCOME_BRACKETS[(index * 5 + 1) % INCOME_BRACKETS.length],
    surveysCompleted: 4 + ((index * 11) % 93),
    avgQualityScore,
    memberSinceLabel: MEMBERSHIP_LABELS[(index * 2 + 1) % MEMBERSHIP_LABELS.length],
  };
}

function generateResponses(count: number): Response[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last  = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    const quality = QUALITY_CYCLE[i % QUALITY_CYCLE.length];
    const answers: Record<string, string> = {};
    QUESTIONS.forEach((q, qi) => {
      answers[q.id] = answerForResponse(qi, i);
    });
    return {
      id: `r${i + 1}`,
      respondent: `${first} ${last}`,
      quality,
      rewardStatus: STATUS_FOR_QUALITY[quality],
      submittedLabel: submittedLabel(i),
      answers,
      profile: profileFor(i, quality),
    };
  });
}


function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(current);
  pages.add(current - 1);
  pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 2) {
    pages.add(total - 2);
    pages.add(total - 1);
  }

  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis');
    result.push(p);
    prev = p;
  }
  return result;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatMnt(n: number) {
  return `₮${n.toLocaleString('en-US')}`;
}

function qualityBadge(q: QualityTier) {
  switch (q) {
    case 'High':   return 'bg-[#ECFDF5] text-[#047857]';
    case 'Medium': return 'bg-[#FFFBEB] text-[#B45309]';
    case 'Low':    return 'bg-[#FEF2F2] text-[#991B1B]';
  }
}

function rewardStatusDisplay(s: RewardStatus) {
  switch (s) {
    case 'Earned':
      return { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Earned', className: 'text-[#047857]' };
    case 'Pending':
      return { icon: <Clock className="w-4 h-4" />, label: 'Pending', className: 'text-[#B45309]' };
    case 'Invalidated':
      return { icon: <AlertCircle className="w-4 h-4" />, label: 'Invalidated', className: 'text-[#DC2626]' };
  }
}

type DetailStatus = 'Active' | 'Paused' | 'Draft' | 'Completed';

interface SurveyDetailData {
  id: string;
  title: string;
  status: DetailStatus;
  category: string;
  questionCount: number;
  estMinutes: number;
  responsesCurrent: number;
  responsesTarget: number;
  completionRate: number;
  avgQuality: number;
  budgetSpent: number;
  rewardPerResponse: number;
  trustLevel: 1 | 2 | 3 | 4 | 5;
  anonymous: boolean;
  createdAt: string;
  createdLabel: string;
  endsLabel: string;
  endDate: string;
  description: string;
}

function buildInitialSurvey(id: string | undefined): SurveyDetailData {
  const source: SurveyRecord = findSurveyById(id) ?? DEMO_SURVEYS[0];
  return {
    id: source.id,
    title: source.title,
    status: source.status as DetailStatus,
    category: source.category,
    questionCount: QUESTIONS.length,
    estMinutes: source.lengthMinutes,
    responsesCurrent: source.responsesCurrent,
    responsesTarget: source.responsesTarget,
    completionRate: source.completionRate,
    avgQuality: source.avgQuality,
    budgetSpent: source.rewardMnt * source.responsesCurrent,
    rewardPerResponse: source.rewardMnt,
    trustLevel: source.trustLevel,
    anonymous: source.anonymous,
    createdAt: source.createdAt,
    createdLabel: source.createdLabel,
    endsLabel: source.endsLabel,
    endDate: source.endDate,
    description: source.description,
  };
}

export default function SurveyDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<SurveyDetailData>(() => buildInitialSurvey(id));

  const allResponses = useMemo(
    () => generateResponses(survey.responsesCurrent),
    [survey.responsesCurrent],
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isAnswersOpen, setIsAnswersOpen] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'responses'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<QualityTier | 'All'>('All');
  const [rewardFilter, setRewardFilter] = useState<RewardStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredResponses = allResponses.filter((r) => {
    if (qualityFilter !== 'All' && r.quality !== qualityFilter) return false;
    if (rewardFilter !== 'All' && r.rewardStatus !== rewardFilter) return false;
    if (searchQuery && !r.respondent.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * pageSize;
  const pageRows = filteredResponses.slice(pageStart, pageStart + pageSize);

  const hasActiveFilters = searchQuery !== '' || qualityFilter !== 'All' || rewardFilter !== 'All';
  const clearFilters = () => {
    setSearchQuery('');
    setQualityFilter('All');
    setRewardFilter('All');
    setCurrentPage(1);
  };

  const handleExportSummaryCsv = () => {
    const header = ['Question #', 'Question', 'Type', 'Answer', 'Count', 'Percentage'];
    const rows: string[][] = [header];
    QUESTIONS.forEach((q, i) => {
      const agg = aggregateQuestion(q, allResponses);
      const typeLabel = q.type === 'rating' ? 'Rating' : q.type === 'text' ? 'Short Text' : 'Single Choice';
      const qNum = String(i + 1);
      if (agg.type === 'rating') {
        rows.push([qNum, q.text, typeLabel, 'Average', (agg.avg ?? 0).toFixed(2), '']);
        agg.distribution.forEach((d) => {
          rows.push([qNum, q.text, typeLabel, `${d.value} stars`, String(d.count), `${d.pct.toFixed(1)}%`]);
        });
      } else if (agg.type === 'text') {
        const texts = agg.texts ?? [];
        if (texts.length === 0) {
          rows.push([qNum, q.text, typeLabel, '(no responses)', '0', '']);
        } else {
          texts.forEach((txt) => {
            rows.push([qNum, q.text, typeLabel, txt, '1', '']);
          });
        }
      } else {
        agg.distribution.forEach((d) => {
          rows.push([qNum, q.text, typeLabel, d.value, String(d.count), `${d.pct.toFixed(1)}%`]);
        });
      }
    });
    const slug = survey.title.toLowerCase().replace(/\s+/g, '-');
    downloadCsv(`${slug}-question-summary.csv`, rows);
  };

  const handleExportCsv = () => {
    const header = [
      'Respondent',
      'Quality',
      'Reward Status',
      'Submitted',
      ...QUESTIONS.map((q) => q.text),
    ];
    const rows = [
      header,
      ...filteredResponses.map((r) => [
        r.respondent,
        r.quality,
        r.rewardStatus,
        r.submittedLabel,
        ...QUESTIONS.map((q) => r.answers[q.id] ?? ''),
      ]),
    ];
    const slug = survey.title.toLowerCase().replace(/\s+/g, '-');
    downloadCsv(`${slug}-responses.csv`, rows);
  };

  const pct = Math.round((survey.responsesCurrent / survey.responsesTarget) * 100);
  const spotsRemaining = survey.responsesTarget - survey.responsesCurrent;
  const isActive = survey.status === 'Active';
  const isPaused = survey.status === 'Paused';
  const isLive = isActive || isPaused;
  const isDraft = survey.status === 'Draft';
  const isCompleted = survey.status === 'Completed';
  const [graceWindow, setGraceWindow] = useState<'now' | '30m' | '24h'>('30m');

  const togglePause = () => {
    setSurvey((s) =>
      s.status === 'Active'
        ? { ...s, status: 'Paused' }
        : s.status === 'Paused'
        ? { ...s, status: 'Active' }
        : s,
    );
  };

  const handleEdit = () => {
    navigate('/surveys/new', {
      state: {
        prefill: {
          title: survey.title,
          description: survey.description,
          category: survey.category,
          reward: survey.rewardPerResponse,
          maxResponses: survey.responsesTarget,
          estMinutes: survey.estMinutes,
          trustLevel: survey.trustLevel,
          endDate: survey.endDate,
          anonymous: survey.anonymous,
          questions: mockQuestionsFor(survey.category),
          status: survey.status,
          responsesCurrent: survey.responsesCurrent,
        },
      },
    });
  };

  const handleClone = () => {
    navigate('/surveys/new', {
      state: {
        prefill: {
          title: `${survey.title} (copy)`,
          description: survey.description,
          category: survey.category,
          reward: survey.rewardPerResponse,
          maxResponses: survey.responsesTarget,
          estMinutes: survey.estMinutes,
          trustLevel: survey.trustLevel,
          endDate: survey.endDate,
          anonymous: survey.anonymous,
          questions: mockQuestionsFor(survey.category),
        },
      },
    });
  };

  const handleDelete = () => {
    setIsDeleteOpen(false);
    setGraceWindow('30m');
    navigate('/surveys');
  };

  const statusBadge: Record<DetailStatus, string> = {
    Active: 'bg-[#ECFDF5] text-[#047857]',
    Paused: 'bg-[#FFFBEB] text-[#B45309]',
    Draft: 'bg-[#F3F3F3] text-[#8A8A8A]',
    Completed: 'bg-[#EFF6FF] text-[#1D4ED8]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#8A8A8A] mb-2">
        <button
          onClick={() => navigate('/surveys')}
          className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          {t('Surveys')}
        </button>
        <span className="text-[#D4D4D4]">/</span>
        <span className="text-[#1A1A1A] font-medium">{t(survey.title)}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-serif text-[#1A1A1A]">{t(survey.title)}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusBadge[survey.status]}`}>
              {t(survey.status)}
            </span>
          </div>
          <p className="text-sm text-[#8A8A8A] flex items-center gap-1.5 flex-wrap">
            <span>{t(survey.category)}</span>
            <span className="text-[#D4D4D4]">·</span>
            <span>{survey.questionCount} {t('Questions')}</span>
            <span className="text-[#D4D4D4]">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8A8A8A]" />
              {survey.estMinutes} {t('Min')}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          {/* Edit — available for Draft, Active, Paused (with locks) and Completed (read-only view) */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            {isCompleted ? t('View') : t('Edit')}
          </button>

          {/* Status-specific primary action */}
          {isActive && (
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-4 py-2 border border-[#FDE68A] rounded-md text-sm font-medium text-[#B45309] bg-[#FFFBEB] hover:bg-[#FFE8CC] transition-colors shadow-none cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              {t('Pause')}
            </button>
          )}
          {isPaused && (
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-4 py-2 border border-[#D1FAE5] rounded-md text-sm font-medium text-[#047857] bg-[#ECFDF5] hover:bg-[#D5E8D2] transition-colors shadow-none cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {t('Resume')}
            </button>
          )}
          {isDraft && (
            <button
              onClick={() => navigate('/surveys')}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors shadow-none cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              {t('Publish')}
            </button>
          )}
          {isCompleted && (
            <button
              onClick={handleClone}
              className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              {t('Clone as new draft')}
            </button>
          )}

          {/* Trash / End — always present but its modal adapts to status */}
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center justify-center w-9 h-9 border border-[#E3E3E3] rounded-md text-[#DC2626] bg-white hover:bg-[#FEF2F2] transition-colors shadow-none cursor-pointer"
            title={isLive ? t('End survey') : t('Delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E3E3E3] mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'text-[#1A1A1A]' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {t('Overview')}
          {activeTab === 'overview' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[#FF3C21] rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'responses' ? 'text-[#1A1A1A]' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('Responses')} <span className="text-[#8A8A8A] font-normal tabular-nums">({allResponses.length})</span>
          {activeTab === 'responses' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[#FF3C21] rounded-full" />}
        </button>
      </div>

      {activeTab === 'overview' && (<>
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          iconTone="brand"
          label={t('Responses')}
          value={`${survey.responsesCurrent} / ${survey.responsesTarget}`}
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconTone="green"
          label={t('Completion Rate')}
          value={`${survey.completionRate}%`}
        />
        <KpiCard
          icon={<BarChart3 className="w-5 h-5" />}
          iconTone="amber"
          label={t('Avg Quality')}
          value={survey.avgQuality.toFixed(1)}
        />
        <KpiCard
          icon={<DollarSign className="w-5 h-5" />}
          iconTone="blue"
          label={t('Budget Spent')}
          value={`₮${(survey.budgetSpent / 1000).toFixed(0)}K`}
        />
      </div>

      {/* Progress + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-6">
        {/* Response Progress */}
        <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">{t('Response Progress')}</h2>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#4A4A4A] tabular-nums">
              {survey.responsesCurrent} {t('collected')}
            </span>
            <span className="text-sm font-semibold text-[#1A1A1A] tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 bg-[#F3F3F3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF3C21] rounded-full transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[#8A8A8A] mt-2">
            {spotsRemaining} {t('spots remaining')}
          </p>

          <div className="mt-5 pt-4 border-t border-[#F3F3F3]">
            <div className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">
              {t('Description')}
            </div>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">{t(survey.description)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">{t('Details')}</h2>

          <dl className="space-y-3 text-sm">
            <DetailRow label={t('Reward per response')} value={formatMnt(survey.rewardPerResponse)} />
            <DetailRow label={t('Trust level required')} value={`${t('Level')} ${survey.trustLevel}+`} />
            <DetailRow label={t('Anonymous')} value={survey.anonymous ? t('Yes') : t('No')} />
            <DetailRow
              label={t('Created')}
              value={
                <>
                  {format(new Date(survey.createdAt), 'MMM d, yyyy')}{' '}
                  <span className="text-[#8A8A8A] font-normal">({t(survey.createdLabel)})</span>
                </>
              }
            />
            <DetailRow
              label={t('Ends')}
              value={
                <>
                  {format(new Date(survey.endDate), 'MMM d, yyyy')}{' '}
                  <span className="text-[#8A8A8A] font-normal">({t(survey.endsLabel)})</span>
                </>
              }
            />
          </dl>
        </div>
      </div>

      {/* Question Summary */}
      <div className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden mb-6">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#F3F3F3]">
          <h2 className="text-base font-semibold text-[#1A1A1A]">{t('Question Summary')}</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8A8A8A]">
              {t('Based on')} {allResponses.length} {t('responses')}
            </span>
            <button
              onClick={handleExportSummaryCsv}
              disabled={allResponses.length === 0}
              className="flex items-center gap-2 h-8 px-3 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('Export CSV')}
            </button>
          </div>
        </div>
        {QUESTIONS.map((q, i) => (
          <QuestionSummaryRow
            key={q.id}
            question={q}
            index={i}
            aggregation={aggregateQuestion(q, allResponses)}
            isLast={i === QUESTIONS.length - 1}
          />
        ))}
      </div>

      {/* Recent Responses */}
      <div className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F3F3]">
          <h2 className="text-base font-semibold text-[#1A1A1A]">{t('Recent Responses')}</h2>
          <button
            onClick={() => setActiveTab('responses')}
            className="text-sm font-medium text-[#1A1A1A] hover:text-[#000000] transition-colors cursor-pointer"
          >
            {t('View all')} →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#E3E3E3] text-[#8A8A8A] font-medium bg-[#FAFAFA]">
                <th className="px-6 py-4 font-medium">{t('Respondent')}</th>
                <th className="px-6 py-4 font-medium">{t('Quality')}</th>
                <th className="px-6 py-4 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {t('Reward Status')}
                      <span title={t('Auto-assigned by quality score — ≥80 instant, 50–79 held 24h, <50 invalidated')} className="inline-flex cursor-help">
                        <Info className="w-3.5 h-3.5 text-[#D4D4D4] hover:text-[#8A8A8A] transition-colors" />
                      </span>
                    </span>
                  </th>
                <th className="px-6 py-4 font-medium">{t('Submitted')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F3]">
              {allResponses.slice(0, 6).map((r) => {
                const rs = rewardStatusDisplay(r.rewardStatus);
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-white transition-colors cursor-pointer"
                    onClick={() => setSelectedResponse(r)}
                  >
                    <td className="px-6 py-4 text-[#1A1A1A] font-medium">{r.respondent}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${qualityBadge(r.quality)}`}>
                        {t(r.quality)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${rs.className}`}>
                        {rs.icon}
                        {t(rs.label)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8A8A8A]">{t(r.submittedLabel)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>)}

      {activeTab === 'responses' && (
        <div>
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={t('Search by respondent...')}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A]"
              />
            </div>

            <BrandSelect
              value={qualityFilter}
              onValueChange={(v) => { setQualityFilter(v as QualityTier | 'All'); setCurrentPage(1); }}
              leftIcon={<List />}
              className="sm:w-auto"
              options={[
                { value: 'All',    label: t('All Quality') },
                { value: 'High',   label: t('High') },
                { value: 'Medium', label: t('Medium') },
                { value: 'Low',    label: t('Low') },
              ]}
            />

            <BrandSelect
              value={rewardFilter}
              onValueChange={(v) => { setRewardFilter(v as RewardStatus | 'All'); setCurrentPage(1); }}
              leftIcon={<CheckCircle />}
              className="sm:w-auto"
              options={[
                { value: 'All',         label: t('All Reward Statuses') },
                { value: 'Earned',      label: t('Earned') },
                { value: 'Pending',     label: t('Pending') },
                { value: 'Invalidated', label: t('Invalidated') },
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

            <div className="ml-auto">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 border border-[#E3E3E3] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t('Export CSV')}
              </button>
            </div>
          </div>

          {/* Full table */}
          <div className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#E3E3E3] text-[#8A8A8A] font-medium bg-[#FAFAFA]">
                    <th className="px-6 py-4 font-medium">{t('Respondent')}</th>
                    <th className="px-6 py-4 font-medium">{t('Quality')}</th>
                    <th className="px-6 py-4 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {t('Reward Status')}
                      <span title={t('Auto-assigned by quality score — ≥80 instant, 50–79 held 24h, <50 invalidated')} className="inline-flex cursor-help">
                        <Info className="w-3.5 h-3.5 text-[#D4D4D4] hover:text-[#8A8A8A] transition-colors" />
                      </span>
                    </span>
                  </th>
                    <th className="px-6 py-4 font-medium">{t('Submitted')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F3F3]">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#8A8A8A]">
                        {t('No responses match these filters.')}
                      </td>
                    </tr>
                  ) : pageRows.map((r) => {
                    const rs = rewardStatusDisplay(r.rewardStatus);
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-white transition-colors cursor-pointer"
                        onClick={() => setSelectedResponse(r)}
                      >
                        <td className="px-6 py-4 text-[#1A1A1A] font-medium">{r.respondent}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${qualityBadge(r.quality)}`}>
                            {t(r.quality)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${rs.className}`}>
                            {rs.icon}
                            {t(rs.label)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8A8A8A]">{t(r.submittedLabel)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F3F3] bg-white">
              <span className="text-sm text-[#8A8A8A]">
                {t('Showing')} {filteredResponses.length === 0 ? 0 : pageStart + 1} {t('to')} {Math.min(pageStart + pageSize, filteredResponses.length)} {t('of')} {filteredResponses.length} {t('responses')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#E3E3E3] rounded-md bg-white text-[#4A4A4A] hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('Previous')}
                </button>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-1 text-sm text-[#8A8A8A]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm border rounded-md tabular-nums transition-colors ${
                        p === page
                          ? 'font-medium border-[#FF3C21] bg-[#FF3C21] text-white cursor-default'
                          : 'font-normal border-[#E3E3E3] bg-white text-[#4A4A4A] hover:bg-[#F3F3F3] cursor-pointer'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#E3E3E3] rounded-md bg-white text-[#4A4A4A] hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail side sheet */}
      <Drawer direction="right" open={!!selectedResponse} onOpenChange={(o) => !o && setSelectedResponse(null)}>
        <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[#E3E3E3]">
          {selectedResponse && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E3E3E3] flex items-center justify-between shrink-0">
                <div>
                  <DrawerTitle className="text-base font-semibold text-[#1A1A1A]">{t('Response Detail')}</DrawerTitle>
                  <DrawerDescription className="text-sm text-[#8A8A8A] mt-0.5">{selectedResponse.respondent}</DrawerDescription>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Respondent Profile (anonymized) */}
                <RespondentProfileCard profile={selectedResponse.profile} />

                {/* Quality Score */}
                {(() => {
                  const score = qualityScoreFor(selectedResponse.quality);
                  const mult = multiplierFor(score);
                  const baseReward = 5_000;
                  const earned = Math.round(baseReward * mult);
                  const totalSec = QUESTIONS.reduce((acc, q) => acc + q.timeSec, 0);
                  return (
                    <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[#1A1A1A]">{t('Quality Score')}</h3>
                        <span className="text-3xl font-bold text-[#1A1A1A] tabular-nums leading-none">{score}</span>
                      </div>
                      <div className="h-2 bg-[#F3F3F3] rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${score >= 80 ? 'bg-[#047857]' : score >= 50 ? 'bg-[#B45309]' : 'bg-[#DC2626]'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <StatTile icon={<Clock className="w-4 h-4" />} tone="neutral" value={formatDuration(totalSec)} label={t('Time taken')} />
                        <StatTile icon={<BarChart3 className="w-4 h-4" />} tone="brand"   value={`×${mult.toFixed(1)}`} label={t('Multiplier')} />
                        <StatTile icon={<DollarSign className="w-4 h-4" />} tone="amber" value={`₮${earned.toLocaleString()}`} label={t('Reward')} />
                      </div>
                    </div>
                  );
                })()}

                {/* Quality Factors */}
                <div className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#F3F3F3] bg-white">
                    <h3 className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">
                      {t('Quality Factors')}
                    </h3>
                  </div>
                  {QUALITY_FACTORS.map((f, i) => (
                    <div
                      key={f.label}
                      className={`flex items-start gap-3 px-5 py-4 ${i < QUALITY_FACTORS.length - 1 ? 'border-b border-[#F3F3F3]' : ''}`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" strokeWidth={1.75} />
                      <div>
                        <div className="text-sm font-medium text-[#1A1A1A]">{t(f.label)}</div>
                        <div className="text-xs text-[#8A8A8A] mt-0.5">{t(f.detail)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Answers */}
                <div className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden">
                  <button
                    onClick={() => setIsAnswersOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-5 py-3 border-b border-[#F3F3F3] bg-white cursor-pointer"
                  >
                    <h3 className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">
                      {t('Answers')} ({QUESTIONS.length} {t('Questions')})
                    </h3>
                    {isAnswersOpen
                      ? <ChevronUp className="w-4 h-4 text-[#8A8A8A]" />
                      : <ChevronDown className="w-4 h-4 text-[#8A8A8A]" />}
                  </button>
                  {isAnswersOpen && (
                    <div>
                      {QUESTIONS.map((q, i) => {
                        const answer = selectedResponse.answers[q.id] ?? '';
                        return (
                          <div
                            key={q.id}
                            className={`p-5 ${i < QUESTIONS.length - 1 ? 'border-b border-[#F3F3F3]' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold flex items-center justify-center shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-[#1A1A1A] mb-2 leading-relaxed">{t(q.text)}</div>
                                <div className="flex items-start gap-2 text-sm text-[#4A4A4A]">
                                  <MessageSquare className="w-4 h-4 text-[#8A8A8A] shrink-0 mt-0.5" />
                                  <span>{answer || <span className="italic text-[#8A8A8A]">{t('(no answer)')}</span>}</span>
                                </div>
                                <div className="text-[11px] text-[#8A8A8A] mt-1 tabular-nums">{q.timeSec}s</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete / End Survey Modal — status-aware */}
      <AnimatePresence>
        {isDeleteOpen && (() => {
          const locked = survey.responsesTarget * survey.rewardPerResponse;
          const earned = survey.responsesCurrent * survey.rewardPerResponse;
          const refund = Math.max(0, locked - earned);
          const close = () => {
            setIsDeleteOpen(false);
            setGraceWindow('30m');
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
                  <div className="p-3 bg-[#FAFAFA] border border-[#E3E3E3] rounded-md">
                    <div className="font-medium text-[#1A1A1A] text-sm">{t(survey.title)}</div>
                    <div className="text-[#8A8A8A] text-xs mt-1">
                      {t(survey.category)} · ₮{survey.rewardPerResponse.toLocaleString('en-US')} · {survey.responsesCurrent}/{survey.responsesTarget} {t('responses')}
                    </div>
                  </div>

                  {isLive ? (
                    <>
                      <div className="rounded-md border border-[#E3E3E3] divide-y divide-[#F3F3F3]">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <div className="text-sm text-[#1A1A1A]">{t('Already paid out')}</div>
                            <div className="text-xs text-[#8A8A8A] mt-0.5">
                              {survey.responsesCurrent} {t('completed responses')}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#1A1A1A] tabular-nums">
                            ₮{earned.toLocaleString('en-US')}
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
                            + ₮{refund.toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>

                      {isActive && (
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

                      <ul className="space-y-2.5 text-xs text-[#4A4A4A]">
                        <li className="flex items-start gap-2.5">
                          {graceWindow === 'now' || isPaused ? (
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
                          <span>{t("The survey can't be reopened.")}</span>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed">
                        {isDraft
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
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-md hover:bg-[#B91C1C] transition-colors cursor-pointer"
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

interface KpiCardProps {
  icon: React.ReactNode;
  iconTone: 'brand' | 'green' | 'amber' | 'blue';
  label: string;
  value: string;
}

function KpiCard({ icon, iconTone, label, value }: KpiCardProps) {
  const tones: Record<KpiCardProps['iconTone'], string> = {
    brand: 'bg-[#F3F3F3] text-[#1A1A1A]',
    green: 'bg-[#ECFDF5] text-[#047857]',
    amber: 'bg-[#FFFBEB] text-[#B45309]',
    blue:  'bg-[#EFF6FF] text-[#1D4ED8]',
  };
  return (
    <div className="bg-white rounded-md border border-[#E3E3E3] p-5">
      <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${tones[iconTone]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight mb-1 tabular-nums">{value}</div>
      <div className="text-sm text-[#8A8A8A]">{label}</div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

interface QuestionSummaryRowProps {
  question: QuestionDef;
  index: number;
  aggregation: Aggregation;
  isLast: boolean;
}

function QuestionSummaryRow({ question, index, aggregation, isLast }: QuestionSummaryRowProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textSearch, setTextSearch] = useState('');
  const qTypeLabel = (
    {
      single: 'Single Choice',
      multi: 'Multi Choice',
      rating: 'Rating',
      scale: 'Scale',
      ranking: 'Ranking',
      date: 'Date',
      matrix: 'Matrix',
      text: 'Short Text',
    } as Record<QuestionType, string>
  )[question.type];

  const allTexts = aggregation.texts ?? [];
  const filteredTexts = textSearch
    ? allTexts.filter((txt) => txt.toLowerCase().includes(textSearch.toLowerCase()))
    : allTexts;

  return (
    <div className={!isLast ? 'border-b border-[#F3F3F3]' : ''}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 text-left hover:bg-white transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#8A8A8A] mb-0.5">{t(qTypeLabel)}</div>
            <div className="font-medium text-[#1A1A1A]">{t(question.text)}</div>
          </div>
          {isOpen
            ? <ChevronUp className="w-4 h-4 text-[#8A8A8A] shrink-0 mt-1" />
            : <ChevronDown className="w-4 h-4 text-[#8A8A8A] shrink-0 mt-1" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 ml-9">
              {aggregation.type === 'rating' && (
                <>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-[#1A1A1A] tabular-nums leading-none">
                      {aggregation.avg?.toFixed(1) ?? '—'}
                    </span>
                    <span className="text-sm text-[#8A8A8A]">/ 5 {t('average')}</span>
                  </div>
                  <div className="space-y-2">
                    {aggregation.distribution.map((item) => (
                      <DistributionRow
                        key={item.value}
                        label={`${item.value} ★`}
                        count={item.count}
                        pct={item.pct}
                      />
                    ))}
                  </div>
                </>
              )}

              {aggregation.type === 'scale' && (
                <>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-[#1A1A1A] tabular-nums leading-none">
                      {aggregation.avg?.toFixed(1) ?? '—'}
                    </span>
                    <span className="text-sm text-[#8A8A8A]">/ 5 {t('average')}</span>
                  </div>
                  <div className="space-y-2">
                    {aggregation.distribution.map((item) => (
                      <DistributionRow
                        key={item.value}
                        label={`${item.value}`}
                        count={item.count}
                        pct={item.pct}
                      />
                    ))}
                  </div>
                </>
              )}

              {(aggregation.type === 'single' || aggregation.type === 'multi') && (
                <div className="space-y-2">
                  {aggregation.type === 'multi' && (
                    <div className="text-xs text-[#8A8A8A] mb-1">
                      {t('Respondents could choose multiple options.')}
                    </div>
                  )}
                  {aggregation.distribution.map((item) => (
                    <DistributionRow
                      key={item.value}
                      label={item.value}
                      count={item.count}
                      pct={item.pct}
                    />
                  ))}
                </div>
              )}

              {aggregation.type === 'ranking' && (
                <div className="space-y-2">
                  <div className="text-xs text-[#8A8A8A] mb-1">
                    {t('Sorted by average rank — lower is better.')}
                  </div>
                  {(aggregation.rankings ?? []).map((r, idx) => (
                    <div
                      key={r.value}
                      className="flex items-center gap-3 px-3 py-2 border border-[#F3F3F3] rounded-md bg-white"
                    >
                      <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#F3F3F3] text-[#1A1A1A] text-xs font-semibold tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-[#1A1A1A] flex-1 min-w-0">{r.value}</span>
                      <span className="text-xs text-[#8A8A8A] tabular-nums shrink-0">
                        {t('avg')} {r.avgRank.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {aggregation.type === 'date' && (
                <div className="space-y-3">
                  {aggregation.dateRange && (
                    <div className="flex items-center gap-6 text-xs text-[#8A8A8A]">
                      <span>
                        {t('Earliest')}{' '}
                        <span className="text-[#1A1A1A] font-medium tabular-nums">
                          {aggregation.dateRange.first}
                        </span>
                      </span>
                      <span>
                        {t('Latest')}{' '}
                        <span className="text-[#1A1A1A] font-medium tabular-nums">
                          {aggregation.dateRange.last}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {aggregation.distribution.slice(0, 5).map((item) => (
                      <DistributionRow
                        key={item.value}
                        label={item.value}
                        count={item.count}
                        pct={item.pct}
                      />
                    ))}
                    {aggregation.distribution.length === 0 && (
                      <div className="text-xs text-[#8A8A8A]">{t('No dates submitted yet.')}</div>
                    )}
                  </div>
                </div>
              )}

              {aggregation.type === 'matrix' && (
                <div className="space-y-4">
                  {(aggregation.matrixRows ?? []).map((mr) => (
                    <div key={mr.row}>
                      <div className="text-sm font-medium text-[#1A1A1A] mb-2">{mr.row}</div>
                      <div className="space-y-1.5">
                        {mr.distribution.map((item) => (
                          <DistributionRow
                            key={item.value}
                            label={item.value}
                            count={item.count}
                            pct={item.pct}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aggregation.type === 'text' && (
                <div className="space-y-2">
                  {allTexts.slice(0, 3).map((text, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#F3F3F3] rounded-md px-3 py-2 text-sm text-[#4A4A4A] italic"
                    >
                      “{text}”
                    </div>
                  ))}
                  {allTexts.length > 3 && (
                    <button
                      onClick={() => setIsTextModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#1A1A1A] hover:text-[#000000] transition-colors cursor-pointer"
                    >
                      + {allTexts.length - 3} {t('more written responses')}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {allTexts.length === 0 && (
                    <div className="text-xs text-[#8A8A8A]">{t('No written responses yet.')}</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All text responses modal */}
      <AnimatePresence>
        {isTextModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1A1A1A]/30 flex items-center justify-center z-50 p-4"
            onClick={() => setIsTextModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-2xl border border-[#F3F3F3] flex flex-col max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[#F3F3F3] shrink-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs text-[#8A8A8A]">
                    <span>{t(qTypeLabel)}</span>
                    <span className="text-[#D4D4D4]">·</span>
                    <span className="tabular-nums">{allTexts.length} {t('responses')}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">{t(question.text)}</h2>
                </div>
                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-3 border-b border-[#F3F3F3] shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
                  <input
                    type="text"
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                    placeholder={t('Search within answers...')}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#E3E3E3] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#8A8A8A]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {filteredTexts.length === 0 ? (
                  <div className="text-sm text-[#8A8A8A] text-center py-8">
                    {t('No answers match your search.')}
                  </div>
                ) : (
                  filteredTexts.map((text, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#F3F3F3] rounded-md px-3 py-2 text-sm text-[#4A4A4A] italic"
                    >
                      “{text}”
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-3 border-t border-[#F3F3F3] bg-white shrink-0 flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A] tabular-nums">
                  {textSearch
                    ? `${filteredTexts.length} ${t('of')} ${allTexts.length}`
                    : `${allTexts.length} ${t('total responses')}`}
                </span>
                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors shadow-none cursor-pointer"
                >
                  {t('Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DistributionRowProps {
  label: string;
  count: number;
  pct: number;
}

const TRUST_LABEL: Record<number, string> = {
  1: 'Newcomer',
  2: 'Verified',
  3: 'Trusted',
  4: 'Expert',
  5: 'Elite',
};

function RespondentProfileCard({ profile }: { profile: RespondentProfile }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md border border-[#E3E3E3] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#F3F3F3] flex items-center justify-between">
        <h3 className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">
          {t('Respondent Profile')}
        </h3>
        <span
          className="inline-flex items-center gap-1 text-[11px] text-[#8A8A8A]"
          title={t('Identity is hidden to protect respondent privacy. Only anonymized traits are shown.')}
        >
          <Shield className="w-3 h-3" />
          {t('Anonymized')}
        </span>
      </div>

      {/* Trust level highlight */}
      <div className="px-5 py-4 border-b border-[#F3F3F3] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#1A1A1A]">
            {t('Level')} {profile.trustLevel} — {t(TRUST_LABEL[profile.trustLevel])}
          </div>
          <div className="text-xs text-[#8A8A8A]">
            {t('Member for')} {profile.memberSinceLabel}
          </div>
        </div>
      </div>

      {/* Traits grid */}
      <div className="grid grid-cols-2 divide-x divide-[#F3F3F3]">
        <ProfileTrait
          icon={<UserCircle2 className="w-4 h-4" />}
          label={t('Demographics')}
          value={`${profile.ageBracket} · ${t(profile.gender)}`}
        />
        <ProfileTrait
          icon={<MapPin className="w-4 h-4" />}
          label={t('Region')}
          value={`${t(profile.region)} · ${t(profile.district)}`}
        />
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#F3F3F3] border-t border-[#F3F3F3]">
        <ProfileTrait
          icon={<GraduationCap className="w-4 h-4" />}
          label={t('Education')}
          value={t(profile.education)}
        />
        <ProfileTrait
          icon={<Briefcase className="w-4 h-4" />}
          label={t('Employment')}
          value={t(profile.employment)}
        />
      </div>
      <div className="border-t border-[#F3F3F3]">
        <ProfileTrait
          icon={<Wallet className="w-4 h-4" />}
          label={t('Monthly household income')}
          value={t(profile.incomeBracket)}
        />
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#F3F3F3] border-t border-[#F3F3F3]">
        <ProfileTrait
          icon={<ClipboardCheck className="w-4 h-4" />}
          label={t('Surveys completed')}
          value={profile.surveysCompleted.toLocaleString()}
        />
        <ProfileTrait
          icon={<TrendingUp className="w-4 h-4" />}
          label={t('Avg quality')}
          value={`${profile.avgQualityScore} / 100`}
        />
      </div>
    </div>
  );
}

function ProfileTrait({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] text-[#8A8A8A] mb-0.5">
        <span className="text-[#B5B5B5]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-[#1A1A1A] truncate">{value}</div>
    </div>
  );
}

function DistributionRow({ label, count, pct }: DistributionRowProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1 gap-4">
        <span className="text-sm text-[#1A1A1A] min-w-0 truncate">{label}</span>
        <span className="text-xs text-[#8A8A8A] tabular-nums shrink-0">
          {count} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FF3C21] rounded-full transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface StatTileProps {
  icon: React.ReactNode;
  tone: 'neutral' | 'brand' | 'amber';
  value: string;
  label: string;
}

function StatTile({ icon, tone, value, label }: StatTileProps) {
  const tones: Record<StatTileProps['tone'], string> = {
    neutral: 'bg-[#F3F3F3] text-[#4A4A4A]',
    brand:   'bg-[#F3F3F3] text-[#1A1A1A]',
    amber:   'bg-[#FFFBEB] text-[#B45309]',
  };
  return (
    <div className="flex flex-col items-center justify-center p-3 border border-[#F3F3F3] rounded-md text-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${tones[tone]}`}>
        {icon}
      </div>
      <div className="text-sm font-semibold text-[#1A1A1A] tabular-nums">{value}</div>
      <div className="text-[11px] text-[#8A8A8A] mt-0.5">{label}</div>
    </div>
  );
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <dt className="text-[#8A8A8A]">{label}</dt>
      <dd className="text-[#1A1A1A] font-medium text-right">{value}</dd>
    </div>
  );
}
