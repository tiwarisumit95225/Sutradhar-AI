/**
 * Operational Priority Matrix Metrics
 * PROTOTYPE / SYNTHETIC DATA ONLY
 */

export interface MetricCard {
  id: string;
  label: string;
  count: number;
  badgeText: string;
  badgeVariant: 'CRITICAL' | 'PRIMARY' | 'ERROR' | 'NEUTRAL' | 'SUCCESS';
  icon: string;
  accentColor: string;
}

export const SYNTHETIC_METRICS: MetricCard[] = [
  {
    id: 'need-attention',
    label: 'Need Attention',
    count: 7,
    badgeText: '2 CRITICAL',
    badgeVariant: 'CRITICAL',
    icon: 'person_alert',
    accentColor: 'text-secondary',
  },
  {
    id: 'active-referrals',
    label: 'Active Referrals',
    count: 4,
    badgeText: 'IN TRANSIT',
    badgeVariant: 'PRIMARY',
    icon: 'forward_media',
    accentColor: 'text-primary',
  },
  {
    id: 'care-gaps',
    label: 'Care Gaps',
    count: 3,
    badgeText: 'ACTION REQ',
    badgeVariant: 'ERROR',
    icon: 'warning',
    accentColor: 'text-error',
  },
  {
    id: 'field-followups',
    label: 'Field Follow-ups',
    count: 5,
    badgeText: 'DUE',
    badgeVariant: 'NEUTRAL',
    icon: 'pending_actions',
    accentColor: 'text-secondary',
  },
  {
    id: 'closures-today',
    label: 'Closures Today',
    count: 5,
    badgeText: 'EVIDENCED',
    badgeVariant: 'SUCCESS',
    icon: 'task_alt',
    accentColor: 'text-tertiary',
  },
];
