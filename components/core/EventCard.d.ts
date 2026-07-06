import React from 'react';
import type { Category } from './CategoryTag';

/**
 * @startingPoint section="Content" subtitle="Agenda event card with time, category & location" viewport="342x120"
 */
export interface EventCardProps {
  /** Start time, e.g. "13:00". Rendered in the Spectral serif. */
  time: string;
  /** Optional duration label, e.g. "1 ч". */
  duration?: string;
  /** Event title. */
  title: string;
  /** Location / room / speaker line. */
  location?: string;
  /** Program category — drives the sticker colour. */
  category?: Category;
  style?: React.CSSProperties;
}

/**
 * A single agenda row: serif time column + dashed divider + category sticker,
 * title and location. Stack several in a flex column with 12px gap to form the
 * scrollable day agenda.
 */
export function EventCard(props: EventCardProps): JSX.Element;
