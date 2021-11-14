import React from 'react';
import { Button } from '../button';
import styles from './styles.module.css';

export interface Props {
  readonly error?: Error;
  readonly clear: () => void;
}

export const ErrorMessage: React.FC<Props> = props => {
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
      <Button onClick={e => {
        e.preventDefault();
        props.clear();
      }}>Ignore</Button>
    </div>
  );
};