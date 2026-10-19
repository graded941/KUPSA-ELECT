import React, { useState, useEffect } from 'react';
import { ViewId, ElectionPhase } from '../types';
import { getElectionPollingDate } from '../data/election';
import { Clock, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ElectionCountdownProps {
  onNavigate: (view: ViewId) => void;
  currentPhase?: ElectionPhase;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isElapsed: boolean;
}

export function ElectionCountdown({ onNavigate }: ElectionCountdownProps) {
  // Target election polling date based on constitutional timeline (First Friday of Nov)
  const [targetDate] = useState<Date>(() => getElectionPollingDate(new Date()));
  const [systemDate, setSystemDate] = useState<Date>(new Date());
  
  const calculateTimeRemaining = (target: Date, current: Date): TimeRemaining => {
    const totalMs = target.getTime() - current.getTime();
    if (totalMs <= 0) {
      return {
        totalMs: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isElapsed: true,
      };
    }

    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / 1000 / 60) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

    return {
      totalMs,
      days,
      hours,
      minutes,
      seconds,
      isElapsed: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate, new Date())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSystemDate(now);
      setTimeLeft(calculateTimeRemaining(targetDate, now));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formattedSystemTime = systemDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedSystemDate = systemDate.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-card p-6 sm:p-8 md:p-10 shadow-pop">
      {/* Background Accent Gradient Watermark */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
            <Clock className="h-5 w-5 animate-spin-slow" />
          </span>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Countdown to Election Phase
            </h3>
          </div>
        </div>

        {/* System Time Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 font-mono text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>System: <strong className="text-foreground">{formattedSystemDate}</strong> {formattedSystemTime} EAT</span>
        </div>
      </div>

      {/* Main Countdown Numbers Grid */}
      {!timeLeft.isElapsed ? (
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            {/* Days */}
            <div className="rounded-2xl border-2 border-border bg-background p-4 sm:p-6 shadow-xs hover:border-ink transition-colors">
              <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <p className="mt-1 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary">
                Days
              </p>
            </div>

            {/* Hours */}
            <div className="rounded-2xl border-2 border-border bg-background p-4 sm:p-6 shadow-xs hover:border-ink transition-colors">
              <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <p className="mt-1 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary">
                Hours
              </p>
            </div>

            {/* Minutes */}
            <div className="rounded-2xl border-2 border-border bg-background p-4 sm:p-6 shadow-xs hover:border-ink transition-colors">
              <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <p className="mt-1 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary">
                Minutes
              </p>
            </div>

            {/* Seconds */}
            <div className="rounded-2xl border-2 border-ink bg-accent/30 p-4 sm:p-6 shadow-xs">
              <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <p className="mt-1 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-foreground flex items-center justify-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Seconds
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Elapsed State (Polling Stations Open Now) */
        <div className="mt-8 rounded-2xl border-2 border-success bg-success/10 p-6 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success text-white shadow-xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="font-display text-2xl font-bold text-foreground">
            Polling Stations are Officially Open!
          </h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The election phase has begun. All registered pharmacy students in good standing can cast their secret ballot now.
          </p>
          <button
            onClick={() => onNavigate('portal')}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-ink-foreground shadow-pop hover:bg-primary transition-colors"
          >
            <span>Proceed to Voting Booth</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
