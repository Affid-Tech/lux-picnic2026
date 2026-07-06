import React from 'react';
import type { Category } from './CategoryTag';

export interface DaySegment {
  /** Category colour for this block of the day. */
  category: Category;
  /** Flex weight ∝ duration. Defaults to 1. */
  flex?: number;
}

export interface DayOverviewBarProps {
  /** Ordered day blocks, left→right. */
  segments: DaySegment[];
  /** Hour labels shown beneath the bar, spaced edge-to-edge. */
  ticks?: (string | number)[];
  /** Bar thickness in px (16 default; use ~6 for the airy variant). */
  height?: number;
  style?: React.CSSProperties;
}

/**
 * Compact single-glance overview of the whole day: proportional coloured
 * segments in a rounded pill with hour ticks. Pair it with a SectionHeading
 * above and the scrollable EventCard list below.
 */
export function DayOverviewBar(props: DayOverviewBarProps): JSX.Element;
