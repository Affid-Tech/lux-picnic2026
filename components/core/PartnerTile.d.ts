import React from 'react';

export interface PartnerTileProps {
  /** Partner name. Rendered as a Spectral terracotta wordmark; omit to show the mono "лого" placeholder. */
  name?: string;
  /** Highlight the host / headline partner with a terracotta border. */
  brand?: boolean;
  style?: React.CSSProperties;
}

/**
 * A single cell of the flat partners grid. Arrange in a 3-column CSS grid with
 * ~10px gap. With no logo asset the brand name is set as a terracotta wordmark
 * (never a grey category chip); an empty `name` falls back to a mono "лого"
 * placeholder.
 */
export function PartnerTile(props: PartnerTileProps): JSX.Element;
