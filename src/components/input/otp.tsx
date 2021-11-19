import { Input, Props } from '.';

type SuppliedProps = 'type' | 'label' | 'hint' | 'placeholder' | 'autoComplete' | 'inputMode';

export const OtpInput: React.FC<Omit<Props, SuppliedProps>> = (props) =>
  <Input
    type='text'
    label='Verification code'
    hint='Enter the code that was just texted to your device'
    autoComplete='one-time-code'
    inputMode='numeric'
    {...props}
  />