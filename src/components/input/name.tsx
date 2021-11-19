import { Input, Props } from '.';

type SuppliedProps = 'type' | 'label' | 'hint' | 'placeholder' | 'autoComplete' | 'inputMode';

export const NameInput: React.FC<Omit<Props, SuppliedProps>> = (props) =>
  <Input
    type='text'
    label='Name'
    hint='Please enter your name'
    placeholder='Namey McNameface'
    autoComplete='name'
    {...props}
  />