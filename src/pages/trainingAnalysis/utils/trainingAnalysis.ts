const pad = (value: number) => String(value).padStart(2, '0');

export const formatSessionStartedAt = (startedAt: string) => {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return startedAt;

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
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
