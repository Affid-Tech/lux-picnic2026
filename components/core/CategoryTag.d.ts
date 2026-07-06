import React from 'react';

export type Category = 'general' | 'it' | 'kids' | 'games';

export interface CategoryTagProps {
  /** One of the four fixed program categories. Drives colour + default label. */
  category?: Category;
  /** Override the default Russian label. Omit to use the category's name. */
  label?: string;
  /** `md` for hero/filters, `sm` inside event cards. */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/**
 * Sticker-style program-category pill (Общее / IT / Детская / Игры).
 * Colours are fixed by category and MUST NOT be reassigned. Always use this
 * component for category labelling so colour usage stays consistent.
 */
export function CategoryTag(props: CategoryTagProps): JSX.Element;

/** Category → { label, color, text } lookup, exported for custom layouts. */
export declare const CATEGORIES: Record<Category, { label: string; color: string; text: string }>;
