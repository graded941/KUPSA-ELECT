import React from 'react';
import { ViewId } from '../types';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  return (
    <section className="grain border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 md:py-20">
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h1 className="mt-3 sm:mt-4 max-w-3xl font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {children && (
          <div className="mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
