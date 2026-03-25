/**
 * T77: Playtest Ops Console — Type Definitions
 */

export type TesterProfile = 
  | 'gamer' 
  | 'non-gamer' 
  | 'mobile-first' 
  | 'desktop-first' 
  | 'political-proximity' 
  | 'team';

export type SessionType = 'observed' | 'self-guided' | 'think-aloud';

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export type NoteType = 
  | 'confusion' 
  | 'strong-moment' 
  | 'bug' 
  | 'drop' 
  | 'completion' 
  | 'timestamp' 
  | 'custom';

export interface SessionMetadata {
  testerId: string;
  testerNickname: string;
  profile: TesterProfile;
  deviceType: string;
  browser: string;
  screenSize: string;
  sessionType: SessionType;
  operatorName: string;
  notes: string;
}

export interface OperatorNote {
  id: string;
  timestamp: number;
  type: NoteType;
  content: string;
  turn?: number;
}

export interface PlaytestSession {
  id: string;
  metadata: SessionMetadata;
  startTime: number;
  endTime?: number;
  status: SessionStatus;
  notes: OperatorNote[];
  telemetrySnapshot?: unknown;
  feedbackSnapshot?: unknown;
}

export interface AuditProgress {
  comprehensionCompleted: boolean;
  balanceCompleted: boolean;
  mobileCompleted: boolean;
  feedbackClustered: boolean;
  issuesTriaged: boolean;
  decisionReady: boolean;
}

export interface EvidencePack {
  exportedAt: string;
  sessions: PlaytestSession[];
  telemetry: unknown;
  feedback: unknown;
  auditProgress: AuditProgress;
  summary: {
    totalSessions: number;
    completedSessions: number;
    deviceCoverage: string[];
    browserCoverage: string[];
    profileCoverage: TesterProfile[];
  };
}

export interface BetaDecisionData {
  sampleSize: number;
  deviceCoverage: string[];
  completionRate: number;
  replayIntent: number;
  shareIntent: number;
  mainFrictionPoints: string[];
  p0Count: number;
  p1Count: number;
  p2Count: number;
  recommendation: 'GO' | 'HARDENING' | 'REWORK';
  confidence: 'high' | 'medium' | 'low';
}
