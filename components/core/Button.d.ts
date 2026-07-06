import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` = terracotta fill, `secondary` = bordered cream. */
  variant?: 'primary' | 'secondary';
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Rounded action button in the picnic palette.
 * Use `primary` once per view for the main CTA (Регистрация); `secondary` for
 * supporting actions. Radius is --radius-md; never use it as a pill.
 */
export function Button(props: ButtonProps): JSX.Element;
