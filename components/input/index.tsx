import React, { HTMLInputTypeAttribute, useRef, useState } from 'react';
import styles from './styles.module.css';

const token = Symbol('input');

export interface HookProps {
  readonly validate: (value: string) => string | void;
  readonly initial?: string;
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
  // Basics of putting together the input
  readonly hook: HookOutput;
  readonly type: HTMLInputTypeAttribute;

  // User friendliness
  readonly label: string;
  readonly hint: string;

  // Other input attributes, we pass these through basically verbatim
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly autoComplete?: string;
  readonly inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

export const useInput = (props: HookProps): HookOutput => {
  const [value, setValue] = useState(props.initial ?? '');
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

  const labelClass = [
    styles.label,
    props.readOnly ? styles.readOnly : undefined
  ].join(' ');

  return (
    <label className={labelClass}>
      <div className={styles.description}>{props.label}</div>
      <input
        type={props.type}
        value={props.hook.value}
        onChange={e => {
          props.hook.setValue(e.target.value);
          props.hook.setMessage(undefined);
        }}

        ref={props.hook.ref as any}
        onBlur={() => {
          if (props.hook.value !== '') {
            props.hook.validate();
          }
        }}

        readOnly={props.readOnly}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
      />
      <div className={hasError ? styles.warning : styles.hint}>
        {hasError ? props.hook.message : props.hint}
      </div>
    </label>
  )
}