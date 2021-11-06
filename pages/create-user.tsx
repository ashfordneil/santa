import React from 'react';
import { Input, useInput } from '../components/input';
import { Button } from '../components/button';
import styles from '../styles/CreateUser.module.css';

const CreateUser = () => {
  const name = useInput({ validate: () => {} });
  const phone = useInput({
    validate: (ph) => {
      if (!ph.startsWith('04')) {
        return 'Please enter a valid phone number, starting with 04';
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.validate() || !phone.validate()) {
      return;
    }

    console.log({ name: name.value, phone: phone.value });
  }

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <h1>Welcome to Secret Santa</h1>
      <p>To get started, we need you to enter some information.</p>
      <Input hook={name} label="Name" hint="Enter your name or nickname here" />
      <Input hook={phone} label="Phone number" hint="Enter your phone number, so we can verify your ID" />
      <Button>Get started</Button>
    </form>
  );
};

export default CreateUser;