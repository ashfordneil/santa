import React from 'react';
import styles from './styles.module.css';

export interface Props {

}

export const Button: React.FC<Props> = props => {
  return (
    <button className={styles.button}>
      {props.children}
    </button>
  )
};