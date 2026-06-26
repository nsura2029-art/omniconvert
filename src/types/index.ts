export type PlanType = 'anonymous' | 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  credits: number;
  maxDailyConversions: number;
  dailyConversionsCount: number;
  isBanned?: boolean;
  createdAt: string;
  referredBy?: string;
  referredRewarded?: boolean;
}

export interface FileConversion {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  toolId: number;
  toolName: string;
  category: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  creditCost: number;
  timestamp: string;
  downloadUrl?: string;
  logs: string[];
}

export interface CloudIntegration {
  provider: 's3' | 'azure' | 'gcs' | 'dropbox';
  enabled: boolean;
  bucketOrFolder: string;
  apiKey: string;
  regionOrUsername?: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'convert' | 'optimize' | 'storage';
  title: string;
  description: string;
  config: Record<string, string>;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  active: boolean;
  lastRun?: string;
}
