import { useEffect, useState } from 'react';

const formatElapsedTime = (elapsedSeconds: number) => {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

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

  return formatElapsedTime(elapsedSeconds);
};

export default useElapsedTrainingTime;
