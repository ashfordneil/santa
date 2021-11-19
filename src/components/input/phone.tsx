import { Input, Props } from '.';

type SuppliedProps = 'type' | 'label' | 'hint' | 'placeholder' | 'autoComplete' | 'inputMode';

export const PhoneInput: React.FC<Omit<Props, SuppliedProps>> = (props) =>
  <Input
    type='tel'
    label='Phone'
    hint='Please enter your phone number'
    placeholder='0412 345 678'
    autoComplete='tel-national'
    inputMode='tel'
    {...props}
  />