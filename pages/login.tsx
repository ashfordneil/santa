import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { CreateUserRequest, CreateUserResponse } from 'boundaries/create-user';
import { RequestOtpRequest, RequestOtpResponse } from 'boundaries/request-otp';
import { SubmitOtpRequest, SubmitOtpResponse } from 'boundaries/submit-otp';
import { Button } from 'components/button';
import { ErrorMessage } from 'components/error-wrapper';
import { useInput } from 'components/input';
import { NameInput } from 'components/input/name';
import { OtpInput } from 'components/input/otp';
import { PhoneInput } from 'components/input/phone';

import { request } from 'util/request';

import styles from '../styles/Login.module.css';

const enum Phase {
  EnteringPhone,
  ValidatingPhone,
  EnteringName,
}

const Login: React.FC = () => {
  const [ phase, setPhase ] = useState(Phase.EnteringPhone);
  const router = useRouter();

  const phone = useInput({
    validate: (ph) => {
      if (!ph.startsWith('04')) {
        return 'Please enter a valid phone number, starting with 04';
      }
    }
  });

  const otp = useInput({
    validate: (otp) => {
      if (otp.length !== 6) {
        return 'The code should be 6 digits long';
      }

      if (/[^0-9]/.test(otp)) {
        return 'The code should only contain numbers';
      }
    }
  });

  const name = useInput({
    validate: () => {
    }
  });

  const requestOtp = useAsyncCallback((phone: string) =>
    request<RequestOtpRequest, typeof RequestOtpResponse>('/api/request-otp', { phone }, RequestOtpResponse)
  );

  const submitOtp = useAsyncCallback(async (otp: string) => {
    if (!requestOtp.result) {
      throw new Error('Internal state error');
    }
    return await request<SubmitOtpRequest, typeof SubmitOtpResponse>('/api/submit-otp', {
      otp,
      token: requestOtp.result.token
    }, SubmitOtpResponse);
  });

  const createUser = useAsyncCallback(async (name: string) => {
    if (submitOtp.result?.userExists !== false) {
      throw new Error('Internal state error');
    }
    const result = await request<CreateUserRequest, typeof CreateUserResponse>('/api/create-user', {
      name,
      token: submitOtp.result.verifiedPhoneToken
    }, CreateUserResponse);

    if (!result.success) {
      throw new Error(result.reason);
    }

    return result.success;
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (phase) {
      case Phase.EnteringPhone:
        if (phone.validate()) {
          requestOtp.execute(phone.value);
        }
        break;
      case Phase.ValidatingPhone:
        if (otp.validate()) {
          submitOtp.execute(otp.value);
        }
        break;
      case Phase.EnteringName:
        if (name.validate()) {
          createUser.execute(name.value);
        }
        break;

    }
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    otp.setValue('');
    name.setValue('');
    requestOtp.reset();
    submitOtp.reset();
    createUser.reset();
    setPhase(Phase.EnteringPhone);
  };

  const currentRequest = {
    [Phase.EnteringPhone]: requestOtp,
    [Phase.ValidatingPhone]: submitOtp,
    [Phase.EnteringName]: createUser,
  }[phase];

  const isLoggedIn = {
    [Phase.EnteringPhone]: false,
    [Phase.ValidatingPhone]: submitOtp.result?.userExists,
    [Phase.EnteringName]: submitOtp.result !== undefined
  }[phase];

  const phoneComponent = <PhoneInput hook={phone} readOnly={requestOtp.loading || phase !== Phase.EnteringPhone}/>;
  const otpComponent = phase === Phase.ValidatingPhone ? <OtpInput hook={otp} readOnly={submitOtp.loading}/> : null;
  const nameComponent = phase === Phase.EnteringName ? (
    <>
      <p>It appears you don&#39;t have an account. Please enter your name so we can set one up for you</p>
      <NameInput hook={name} readOnly={createUser.loading}/>
    </>
  ) : null;

  useEffect(() => {
    if (!currentRequest.result) {
      // do nothing
    } else if (isLoggedIn) {
      router.push('/');
    } else {
      switch (phase) {
        case Phase.EnteringPhone:
          setPhase(Phase.ValidatingPhone);
          break;
        case Phase.ValidatingPhone:
          setPhase(Phase.EnteringName);
          break;
        case Phase.EnteringName:
          break;
      }
    }
  }, [currentRequest.result, phase, isLoggedIn]);

  const submit = currentRequest.loading ? (
    <p>Loading...</p>
  ) : (
    <ErrorMessage clear={currentRequest.reset} error={currentRequest.error}>
      <div className={styles.submitArea}>
        {phase === Phase.EnteringPhone ? null : <Button onClick="reset">Edit phone number</Button>}
        <Button onClick="submit">{phase === Phase.EnteringName ? 'Create an account' : 'Next'}</Button>
      </div>
    </ErrorMessage>
  );

  return (
    <form onSubmit={onSubmit} onReset={onReset} className={styles.form}>
      <h1>Please log into Secret Santa</h1>
      {phoneComponent}
      {otpComponent}
      {nameComponent}
      {submit}
    </form>
  )
};

export default Login;