// src/dashboard/hr/types.ts
export type CorrespondenceType = 'OFFER_LETTER' | 'CONTRACT' | 'WARNING' | 'PROMOTION' | 'TERMINATION' | 'GENERAL';

export const CORRESPONDENCE_TYPE_LABELS: Record<CorrespondenceType, string> = {
  OFFER_LETTER: 'Offer Letter',
  CONTRACT: 'Employment Contract', 
  WARNING: 'Written Warning',
  PROMOTION: 'Promotion Letter',
  TERMINATION: 'Termination Notice',
  GENERAL: 'General Communication'
};