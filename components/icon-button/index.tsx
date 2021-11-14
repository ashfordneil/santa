import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './styles.module.css';

export interface Props {
  readonly icon: IconDefinition;
  readonly onClick: React.MouseEventHandler;
  readonly disabled?: boolean;
}

export const IconButton: React.FC<Props> = props => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={styles.button}
    >
      <FontAwesomeIcon icon={props.icon} />
    </button>
  )
};