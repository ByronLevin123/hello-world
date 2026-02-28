import { z } from 'zod';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidParamSchema = z.string().regex(UUID_REGEX, 'Invalid application ID');

const validStatuses = ['submitted', 'under_review', 'approved', 'declined', 'referred'] as const;
const validComplianceStatuses = ['pending', 'in_progress', 'cleared', 'flagged'] as const;
const validRiskBands = ['low', 'medium', 'high'] as const;

export const updateApplicationSchema = z.object({
  status: z.enum(validStatuses).optional(),
  decision: z.enum(['approved', 'declined']).optional(),
  decisionBy: z.string().max(100).optional(),
  decisionNotes: z.string().max(1000).optional(),
  assignedTo: z.string().max(100).optional(),
  complianceStatus: z.enum(validComplianceStatuses).optional(),
  amlCheckPassed: z.boolean().optional(),
  kycCheckPassed: z.boolean().optional(),
  fraudCheckPassed: z.boolean().optional(),
  complianceReviewedBy: z.string().max(100).optional(),
  riskScore: z.number().int().min(0).max(999).optional(),
  riskBand: z.enum(validRiskBands).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const addNoteSchema = z.object({
  author: z.string().min(1).max(100),
  role: z.string().min(1).max(30),
  content: z.string().min(1).max(2000),
});

export const listQuerySchema = z.object({
  status: z.enum(validStatuses).optional(),
  complianceStatus: z.enum(validComplianceStatuses).optional(),
  riskBand: z.enum(validRiskBands).optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
