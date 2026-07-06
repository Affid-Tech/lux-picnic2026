import React from 'react';

export interface PartnerTileProps {
  /** Partner name. Omit to render the "лого" placeholder. */
  name?: string;
  /** Highlight the host / headline partner in the terracotta accent. */
  brand?: boolean;
  style?: React.CSSProperties;
}

/**
 * A single cell of the flat partners grid. Arrange in a 3-column CSS grid with
 * ~10px gap. Placeholder tiles (no `name`) read "лого" in mono until real
 * logos are supplied.
 */
export function PartnerTile(props: PartnerTileProps): JSX.Element;
