import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Shared hook for Arcade countdowns/countups and tick events.
 * Handles the game loop tick decoupled from requestAnimationFrame (useful for UI states).
 *
 * @param initialMs Initial time in milliseconds.
 * @param mode 'countdown' or 'countup'
 * @param onTick Optional callback that fires every \`intervalMs\`
 * @param intervalMs How often the UI timer ticks (default 1000ms = 1s)
 */
export function useArcadeTimer(
  initialMs: number,
  mode: 'countdown' | 'countup' = 'countdown',
  onTick?: (currentMs: number) => void,
  intervalMs: number = 1000
) {
  const [ms, setMs] = useState(initialMs);
  const [isRunning, setIsRunning] = useState(false);
  const lastTickRef = useRef<number>(Date.now());
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const start = useCallback(() => {
    setIsRunning(true);
    lastTickRef.current = Date.now();
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback((newInitialMs?: number) => {
    setIsRunning(false);
    setMs(newInitialMs ?? initialMs);
  }, [initialMs]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setMs((prev) => {
        const next = mode === 'countdown' ? Math.max(0, prev - delta) : prev + delta;
        if (onTickRef.current) {
          onTickRef.current(next);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isRunning, mode, intervalMs]);

  return { ms, isRunning, start, pause, reset };
}
