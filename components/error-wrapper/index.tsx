import React, { useState } from 'react';
import { faBug, faTimes } from '@fortawesome/free-solid-svg-icons';

import { IconButton } from '../icon-button';
import styles from './styles.module.css';

export interface Props {
  readonly error?: Error;
  readonly clear: () => void;
}

export const ErrorMessage: React.FC<Props> = props => {
  const [ detail, setDetail ] = useState(false);
  if (!props.error) {
    return (
      <>
        {props.children}
      </>
    );
  }

  return (
    <div className={styles.error}>
      <p>{props.error.message}</p>
      <IconButton
        onClick={() => setDetail(!detail)}
        icon={faBug}
      />
      <IconButton
        onClick={e => {
          e.preventDefault();
          props.clear();
        }}
        icon={faTimes}
      />
      {detail && (
        <pre style={{ gridColumn: '1 / 3' }}>
          {props.error.stack}
        </pre>
      )}
    </div>
  );
};