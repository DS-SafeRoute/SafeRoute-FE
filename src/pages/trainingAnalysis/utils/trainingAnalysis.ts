import type { MonitoringCamera } from '../types/trainingAnalysis';

const pad = (value: number) => String(value).padStart(2, '0');

// 층별로 묶어서 보여주기 위한 그룹핑 — 카메라 목록 카드 그리드, 프레임 상세 사이드바 둘 다에서
// 씀. Map은 key가 처음 등장한 순서를 유지하므로 카메라 목록 응답 순서(대개 층 순)를 그대로 따라감
export const groupCamerasByFloor = (cameras: MonitoringCamera[]) => {
  const groups = new Map<string, MonitoringCamera[]>();
  for (const camera of cameras) {
    const group = groups.get(camera.floorName);
    if (group) group.push(camera);
    else groups.set(camera.floorName, [camera]);
  }
  return Array.from(groups.entries());
};

export const formatSessionStartedAt = (startedAt: string) => {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return startedAt;

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

// 세션 정보 박스 우측의 수치 타일(날짜/시작 시간)에서 날짜·시각을 따로 보여주려고
// formatSessionStartedAt을 둘로 쪼갠 버전
export const formatSessionStartedDate = (startedAt: string) => {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return startedAt;

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

export const formatSessionStartedClock = (startedAt: string) => {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return startedAt;

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// 프레임/카메라 캡처 시각(epoch ms) → "HH:mm:ss". 훈련 종료 후 열람하는 화면이라
// "n초 전" 같은 상대 시각 대신 실제 촬영 시각을 그대로 보여줌
export const formatCapturedTime = (epochMs: number | null) => {
  if (epochMs === null) return null;
  const date = new Date(epochMs);
  if (Number.isNaN(date.getTime())) return null;

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatElapsedFromStart = (capturedAt: number, sessionStartedAt: number) => {
  const elapsedSec = Math.max(0, Math.round((capturedAt - sessionStartedAt) / 1000));
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  return `훈련 시작 후 ${pad(minutes)}:${pad(seconds)}`;
};
