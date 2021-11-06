import React, { useRef, useState } from 'react';
import styles from './styles.module.css';

const token = Symbol('input');

export interface HookProps {
  readonly validate: (value: string) => string | void;
}

export interface HookOutput {
  // to make sure that people use the hook appropriately
  readonly __token: typeof token;

  // public API, you can use these
  readonly value: string;
  readonly validate: () => boolean;

  // private (ish, typescript won't support it) API, don't use these
  readonly setValue: (value: string) => void;
  readonly ref: React.MutableRefObject<HTMLInputElement | undefined>;
  readonly message: string | void;
  readonly setMessage: (message?: string) => void;
}

export interface Props {
  readonly hook: HookOutput;
  readonly label: string;
  readonly hint: string;
  readonly placeholder?: string;
}

export const useInput = (props: HookProps): HookOutput => {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | void>();
  const ref = useRef<HTMLInputElement>();

  const validate = () => {
    const newMessage = value === ''
      ? 'Please enter a value'
      : props.validate(value);

    if (newMessage !== undefined && message === undefined) {
      ref.current?.focus();
    }
    setMessage(newMessage);
    return newMessage === undefined;
  };

  return {
    __token: token,
    value,
    setValue,
    message,
    setMessage,
    ref,
    validate
  }
};

export const Input: React.FC<Props> = (props) => {
  const hasError = props.hook.message !== undefined;

  return (
    <label className={styles.label}>
      <div className={styles.description}>{props.label}</div>
      <input
        type="text"
        value={props.hook.value}
        onChange={e => {
          props.hook.setValue(e.target.value);
          props.hook.setMessage(undefined);
        }}

        ref={props.hook.ref}
        onBlur={props.hook.validate}
      />
      <div className={hasError ? styles.warning : styles.hint}>
        {hasError ? props.hook.message : props.hint}
      </div>
    </label>
  )
}