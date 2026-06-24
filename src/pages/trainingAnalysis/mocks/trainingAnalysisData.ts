import type {
  AiVisionStatus,
  AnalysisInfo,
  Detection,
  DetectionSummary,
  StreamCamera,
  TimelineEvent,
} from '../types/trainingAnalysis';

export const mockStreamCameras: StreamCamera[] = [
  {
    id: 'cam-1',
    name: 'CAM-1',
    zone: '비상구 A-1층',
    fps: 30,
    latencyMs: 45,
    detectedCount: 12,
    status: 'online',
  },
  {
    id: 'cam-2',
    name: 'CAM-2',
    zone: '비상구 B-1층',
    fps: 30,
    latencyMs: 52,
    detectedCount: 8,
    status: 'online',
  },
  {
    id: 'cam-3',
    name: 'CAM-3',
    zone: '계단실 A-2층',
    fps: 29,
    latencyMs: 48,
    detectedCount: 15,
    status: 'online',
  },
  {
    id: 'cam-4',
    name: 'CAM-4',
    zone: '계단실 B-2층',
    fps: 30,
    latencyMs: 41,
    detectedCount: 11,
    status: 'online',
  },
  {
    id: 'cam-5',
    name: 'CAM-5',
    zone: '복도 - 3층',
    fps: 28,
    latencyMs: 55,
    detectedCount: 3,
    status: 'online',
  },
  {
    id: 'cam-6',
    name: 'CAM-6',
    zone: '중앙홀 - 1층',
    fps: 0,
    latencyMs: 0,
    detectedCount: 24,
    status: 'offline',
  },
];

export const mockDetections: Detection[] = [
  { id: 'P-01', confidence: 0.97, x: 18, y: 30, width: 8, height: 22 },
  { id: 'P-02', confidence: 0.93, x: 30, y: 28, width: 8, height: 22 },
  { id: 'P-03', confidence: 0.91, x: 42, y: 29, width: 8, height: 22 },
  { id: 'P-04', confidence: 0.95, x: 54, y: 32, width: 8, height: 22 },
  { id: 'P-05', confidence: 0.88, x: 66, y: 28, width: 8, height: 22 },
  { id: 'P-06', confidence: 0.96, x: 78, y: 30, width: 8, height: 22 },
];

export const mockTimelineEvents: TimelineEvent[] = [
  { time: '00:47', label: 'CCTV 인식 시작', severity: 'info' },
  { time: '02:11', label: '병목 감지 · 계단 A구역', severity: 'warning' },
  { time: '02:34', label: '경로 재산출 · 서측 우회', severity: 'info' },
  { time: '03:18', label: '1층 로비 임계치 초과', severity: 'danger' },
  { time: '03:55', label: '대피 90% 완료', severity: 'success' },
];

export const mockAnalysisInfo: AnalysisInfo = {
  fileName: 'train_240414.mp4',
  resolution: '3840×2160',
  duration: '04:08',
  model: 'YOLO v8 + DeepSORT',
  processedSec: 42,
};

export const mockDetectionSummary: DetectionSummary = {
  detectedCount: 342,
  avgSpeedMs: 1.2,
  bottleneckCount: 2,
  frameProcessRate: 98.8,
  modelLabel: 'YOLO v8',
  confidence: 0.94,
};

export const mockAiVisionStatus: AiVisionStatus = {
  detectedCount: 847,
  trackedCount: 58,
  confidencePct: 94.2,
};
