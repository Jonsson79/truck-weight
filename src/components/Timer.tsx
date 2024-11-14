import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startTime: string | null;
  isRunning: boolean;
}

export const Timer: React.FC<TimerProps> = ({ startTime, isRunning }) => {
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  useEffect(() => {
    if (!isRunning || !startTime) {
      setElapsed('00:00:00');
      return;
    }

    const intervalId = setInterval(() => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

      setElapsed(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, isRunning]);

  return (
    <div className="flex items-center gap-2 text-2xl font-mono">
      <Clock className="w-6 h-6" />
      <span>{elapsed}</span>
    </div>
  );
};