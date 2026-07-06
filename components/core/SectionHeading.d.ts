import React from 'react';

export interface SectionHeadingProps {
  /** The heading text (Spectral serif). */
  children: React.ReactNode;
  /** Optional right-aligned muted meta, e.g. "11:00 – 19:00". */
  meta?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Section title in the Spectral serif with an optional baseline-aligned meta
 * line on the right. Use above the day overview, agenda and partners blocks.
 */
export function SectionHeading(props: SectionHeadingProps): JSX.Element;
