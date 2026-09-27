import React from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import type { AiAssistResult } from '../../ai/aiTypes';

export const AiAssistCard: React.FC<{ title: string; result: AiAssistResult }> = ({ title, result }) => (
  <section aria-label={title}>
    <Card variant="inset" padding="sm" className="min-w-0 gap-space-xs">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-space-xs">
        <h3 className="min-w-0 break-words font-label-md text-label-md font-bold text-on-surface">{title}</h3>
        <StatusBadge label={`AI-ASSISTED ${result.mode}`} variant="primary" />
      </div>
      {result.notice && <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">{result.notice}</p>}
      <div className="min-w-0 rounded-lg border-l-2 border-primary bg-surface-container-lowest p-space-sm">
        <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">AI-GENERATED WORDING</p>
        <p className="mt-1 break-words font-body-sm text-body-sm text-on-surface">{result.text}</p>
      </div>
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">SOURCE DATA · SYNTHETIC</p>
        <p className="mt-0.5 break-words font-code-xs text-code-xs text-on-surface">{result.sourceIds.length ? result.sourceIds.join(' · ') : 'No source identifiers available'}</p>
      </div>
      <p className="break-words font-body-sm text-body-sm text-on-surface-variant">AI assists with wording and summaries. Critical workflow decisions remain rule-based and require human review.</p>
    </Card>
  </section>
);
