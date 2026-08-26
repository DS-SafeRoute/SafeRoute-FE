import { useEffect, useState } from 'react';

import { formatDuration } from '@utils/format';

const useElapsedTrainingTime = (startedAt: number) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const updateElapsedTime = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateElapsedTime();
    const intervalId = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [startedAt]);

  return formatDuration(elapsedSeconds);
};

export default useElapsedTrainingTime;
