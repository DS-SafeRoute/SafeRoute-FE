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

    const tick = () => setNow(Date.now());
    const intervalId = window.setInterval(tick, 1000);
    // 탭이 백그라운드로 가면 브라우저가 setInterval을 수십 초~분 단위로 늦춰서, 실제로는
    // 시간이 흐르는데도 화면엔 멈춰있는 것처럼 보임(다른 탭에서 도면관리 등을 보다가 돌아오면
    // 특히 두드러짐) — 탭이 다시 보이거나 포커스가 돌아오는 순간 즉시 한 번 더 갱신해서 따라잡음
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [startedAt, stoppedAt]);

  if (startedAt === null || startedAt === undefined) return '-';

  const elapsedSeconds = Math.max(0, Math.floor(((stoppedAt ?? now) - startedAt) / 1000));
  return formatDuration(elapsedSeconds);
};

export default useElapsedTrainingTime;
