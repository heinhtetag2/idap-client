export type SurveyStatus = 'Active' | 'Draft' | 'Paused' | 'Completed';
export type SurveyCategory = 'Social' | 'Product' | 'Brand' | 'Other';

export interface Survey {
  id: string;
  title: string;
  category: SurveyCategory;
  status: SurveyStatus;
  responsesCurrent: number;
  responsesTarget: number;
  rewardMnt: number;
  lengthMinutes: number;
  endsLabel: string;
  createdAt: string;

  // Detail-page fields
  description: string;
  endDate: string;
  trustLevel: 1 | 2 | 3 | 4 | 5;
  anonymous: boolean;
  completionRate: number;
  avgQuality: number;
  createdLabel: string;

  /** ISO date string when soft-deleted. Items live in Trash for 30 days. */
  deletedAt?: string | null;
}

export const DEMO_SURVEYS: Survey[] = [
  {
    id: 'SUR-001',
    title: 'Organizational Culture Survey',
    category: 'Other',
    status: 'Completed',
    responsesCurrent: 207,
    responsesTarget: 207,
    rewardMnt: 500,
    lengthMinutes: 3,
    endsLabel: '2 days ago',
    createdAt: '2026-02-15',
    description: 'Internal culture pulse check across teams and leadership.',
    endDate: '2026-04-18',
    trustLevel: 1,
    anonymous: false,
    completionRate: 93,
    avgQuality: 4.4,
    createdLabel: '2 months ago',
  },
  {
    id: 'SUR-002',
    title: 'Market Trends Research',
    category: 'Social',
    status: 'Active',
    responsesCurrent: 8,
    responsesTarget: 77,
    rewardMnt: 2000,
    lengthMinutes: 4,
    endsLabel: 'in 13 days',
    createdAt: '2026-04-05',
    description: 'Understanding current market preferences and social media engagement patterns.',
    endDate: '2026-05-03',
    trustLevel: 2,
    anonymous: true,
    completionRate: 78,
    avgQuality: 4.1,
    createdLabel: '15 days ago',
  },
  {
    id: 'SUR-003',
    title: 'Social Responsibility Survey',
    category: 'Product',
    status: 'Active',
    responsesCurrent: 35,
    responsesTarget: 137,
    rewardMnt: 2000,
    lengthMinutes: 9,
    endsLabel: 'in 11 days',
    createdAt: '2026-04-03',
    description: 'Measuring product impact on social and environmental responsibility.',
    endDate: '2026-05-01',
    trustLevel: 2,
    anonymous: true,
    completionRate: 82,
    avgQuality: 3.9,
    createdLabel: '17 days ago',
  },
  {
    id: 'SUR-004',
    title: 'Organizational Culture Survey',
    category: 'Social',
    status: 'Active',
    responsesCurrent: 179,
    responsesTarget: 184,
    rewardMnt: 1000,
    lengthMinutes: 8,
    endsLabel: 'in 27 days',
    createdAt: '2026-03-28',
    description: 'Cross-functional assessment of team dynamics, values, and collaboration.',
    endDate: '2026-05-17',
    trustLevel: 3,
    anonymous: false,
    completionRate: 89,
    avgQuality: 4.3,
    createdLabel: '23 days ago',
  },
  {
    id: 'SUR-005',
    title: 'Service Quality Assessment',
    category: 'Other',
    status: 'Draft',
    responsesCurrent: 0,
    responsesTarget: 332,
    rewardMnt: 500,
    lengthMinutes: 12,
    endsLabel: '—',
    createdAt: '2026-04-18',
    description: 'Evaluating customer service quality across all support channels.',
    endDate: '2026-05-20',
    trustLevel: 1,
    anonymous: false,
    completionRate: 0,
    avgQuality: 0,
    createdLabel: '2 days ago',
  },
  {
    id: 'SUR-006',
    title: 'Digital Transformation Survey',
    category: 'Brand',
    status: 'Paused',
    responsesCurrent: 241,
    responsesTarget: 273,
    rewardMnt: 500,
    lengthMinutes: 5,
    endsLabel: 'in 30 days',
    createdAt: '2026-03-25',
    description: 'Brand perception during our ongoing digital transformation.',
    endDate: '2026-05-20',
    trustLevel: 2,
    anonymous: true,
    completionRate: 88,
    avgQuality: 4.0,
    createdLabel: '26 days ago',
  },
  {
    id: 'SUR-007',
    title: 'Digital Transformation Survey',
    category: 'Other',
    status: 'Draft',
    responsesCurrent: 0,
    responsesTarget: 89,
    rewardMnt: 1000,
    lengthMinutes: 3,
    endsLabel: '—',
    createdAt: '2026-04-15',
    description: 'Quick pulse on digital adoption and tooling preferences.',
    endDate: '2026-05-20',
    trustLevel: 1,
    anonymous: false,
    completionRate: 0,
    avgQuality: 0,
    createdLabel: '5 days ago',
  },
];

export function findSurveyById(id: string | undefined): Survey | undefined {
  if (!id) return undefined;
  const needle = id.toUpperCase();
  return DEMO_SURVEYS.find((s) => s.id.toUpperCase() === needle);
}
