import { useEffect, useState } from 'react';

import { formatDuration } from '@utils/format';

// 훈련 시작 시각을 기준으로 1초마다 경과 시간을 계산
const useElapsedTrainingTime = (startedAt?: number | null, stoppedAt?: number | null) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (
      startedAt === null ||
      startedAt === undefined ||
      (stoppedAt !== null && stoppedAt !== undefined)
    ) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, [startedAt, stoppedAt]);

  if (startedAt === null || startedAt === undefined) return '-';

  const elapsedSeconds = Math.max(0, Math.floor(((stoppedAt ?? now) - startedAt) / 1000));
  return formatDuration(elapsedSeconds);
};

export default useElapsedTrainingTime;
