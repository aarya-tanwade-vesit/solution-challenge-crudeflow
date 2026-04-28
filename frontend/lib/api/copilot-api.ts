import { apiPost } from './client';

export interface CopilotQueryPayload {
  message: string;
  decisionId?: string;
  conversationId?: string;
  context?: Record<string, unknown>;
}

export interface CopilotStructuredReply {
  answer: string;
  reason: string;
  impact: string;
  nextActions?: string[];
  usedData?: string[];
}

export interface CopilotReply {
  conversationId: string;
  message: string;
  structured?: CopilotStructuredReply;
  confidence: number;
  citations?: Array<Record<string, unknown>>;
  rawModel?: string;
  asOf: string;
}

export async function askCopilot(payload: CopilotQueryPayload): Promise<CopilotReply | null> {
  return apiPost<CopilotReply | null, CopilotQueryPayload>('/copilot/query', payload, null);
}

