import React from 'react';
import styles from './styles.module.css';

export interface Props {
  readonly onClick: 'submit' | 'reset' | React.MouseEventHandler;
  readonly disabled?: boolean;
}

export const Button: React.FC<Props> = props => {
  const classes = [
    styles.button,
    props.disabled ? styles.disabled : undefined,
    props.onClick === 'reset' ? styles.reset : undefined,
    props.onClick === 'submit' ? styles.submit : undefined
  ].join(' ');

  return (
    <button
      className={classes} type={typeof props.onClick === 'function' ? 'button' : props.onClick}
      onClick={typeof props.onClick === 'function' ? props.onClick : undefined}
    >
      {props.children}
    </button>
  );
};