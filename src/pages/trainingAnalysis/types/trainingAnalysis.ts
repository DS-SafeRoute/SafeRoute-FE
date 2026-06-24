export type CameraStreamStatus = 'online' | 'offline';

export type TimelineEventSeverity = 'info' | 'warning' | 'danger' | 'success';

export type AnalysisViewTab = 'live' | 'grid' | 'detect';

export interface StreamCamera {
  id: string;
  name: string;
  zone: string;
  fps: number;
  latencyMs: number;
  detectedCount: number;
  status: CameraStreamStatus;
}

export interface Detection {
  id: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TimelineEvent {
  time: string;
  label: string;
  severity: TimelineEventSeverity;
}

export interface AnalysisInfo {
  fileName: string;
  resolution: string;
  duration: string;
  model: string;
  processedSec: number;
}

export interface DetectionSummary {
  detectedCount: number;
  avgSpeedMs: number;
  bottleneckCount: number;
  frameProcessRate: number;
  modelLabel: string;
  confidence: number;
}

export interface AiVisionStatus {
  detectedCount: number;
  trackedCount: number;
  confidencePct: number;
}
