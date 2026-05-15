'use client';

import { useEffect, useMemo, useState } from 'react';

type Mode = 'tokens' | 'clock';

type LiveCountdownProps = {
  endAt: string | Date | null;
  mode?: Mode;
  className?: string;
  endedLabel?: string;
  noCountdownLabel?: string;
};

type TimeParts = {
  ended: boolean;
  d: number;
  h: number;
  m: number;
  s: number;
};

function getParts(endMs: number, nowMs: number): TimeParts {
  const diff = endMs - nowMs;
  if (diff <= 0) {
    return { ended: true, d: 0, h: 0, m: 0, s: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return { ended: false, d, h, m, s };
}

function pad(v: number) {
  return String(v).padStart(2, '0');
}

export default function LiveCountdown({
  endAt,
  mode = 'tokens',
  className = '',
  endedLabel = 'Ended',
  noCountdownLabel = 'No countdown yet',
}: LiveCountdownProps) {
  const endMs = useMemo(() => {
    if (!endAt) return null;
    const ms = new Date(endAt).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [endAt]);

  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    if (!endMs) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const updateNow = () => {
      setNowMs(Date.now());
    };

    // first client update after mount (avoids hydration mismatch + lint error)
    const rafId = requestAnimationFrame(() => {
      updateNow();

      // then align to next second boundary
      const alignDelay = 1000 - (Date.now() % 1000);
      const timeoutId = setTimeout(() => {
        updateNow();
        intervalId = setInterval(updateNow, 1000);
      }, alignDelay);

      // store timeoutId on interval variable scope via closure cleanup
      (cleanupState.timeoutId as ReturnType<typeof setTimeout> | null) =
        timeoutId;
    });

    const cleanupState: {
      timeoutId: ReturnType<typeof setTimeout> | null;
    } = { timeoutId: null };

    return () => {
      cancelAnimationFrame(rafId);
      if (cleanupState.timeoutId) clearTimeout(cleanupState.timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [endMs]);

  if (!endMs) return <span className={className}>{noCountdownLabel}</span>;
  if (nowMs === null) {
    return (
      <span className={className} suppressHydrationWarning>
        --:--:--
      </span>
    );
  }

  const parts = getParts(endMs, nowMs);
  if (parts.ended) return <span className={className}>{endedLabel}</span>;

  const secondsTens = Math.floor(parts.s / 10);
  const secondsOnes = parts.s % 10;

  const secondNode = (
    <span className='inline-flex tabular-nums'>
      <span className='inline-block w-[1ch]'>{secondsTens}</span>
      <span
        key={secondsOnes}
        className='inline-block w-[1ch] motion-safe:animate-countdown-ones-up'
      >
        {secondsOnes}
      </span>
    </span>
  );

  if (mode === 'clock') {
    if (parts.d > 0) {
      return (
        <span className={`${className} tabular-nums`}>
          {parts.d}d {pad(parts.h)}:{pad(parts.m)}:{secondNode}
        </span>
      );
    }

    return (
      <span className={`${className} tabular-nums`}>
        {pad(parts.h)}:{pad(parts.m)}:{secondNode}
      </span>
    );
  }

  // mode === 'tokens' (d h m s style)
  return (
    <span className={`${className} inline-flex gap-1 tabular-nums`}>
      <span>
        {pad(parts.d)}
        <span className='ml-0.5 text-3xs text-grey'>d</span>
      </span>
      <span>
        {pad(parts.h)}
        <span className='ml-0.5 text-3xs text-grey'>h</span>
      </span>
      <span>
        {pad(parts.m)}
        <span className='ml-0.5 text-3xs text-grey'>m</span>
      </span>
      <span>
        {secondNode}
        <span className='ml-0.5 text-3xs text-grey'>s</span>
      </span>
    </span>
  );
}
